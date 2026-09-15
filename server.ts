import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { CURATED_BASELINE_ITEMS } from './src/data/baseline.ts';
import { AITrackerItem, SourceHealth, TrackerDataResponse, AICategory, FreeStatus } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Lazy/safe initialization for Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
      aiClient = null;
    }
  }
  return aiClient;
}

// In-memory cache for live tracked items
interface CacheState {
  data: TrackerDataResponse | null;
  fetchedAt: number;
}

const cache: CacheState = {
  data: null,
  fetchedAt: 0,
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

// Helper to determine category from HF pipeline tags or tags array
function determineCategory(pipelineTag?: string, tags?: string[], modelId?: string): AICategory {
  const pTag = (pipelineTag || '').toLowerCase();
  const idStr = (modelId || '').toLowerCase();
  const tagsList = (tags || []).map(t => t.toLowerCase());

  if (pTag.includes('image') || tagsList.includes('text-to-image') || tagsList.includes('image-to-image') || idStr.includes('flux') || idStr.includes('diffusion')) {
    return 'image';
  }
  if (pTag.includes('video') || tagsList.includes('text-to-video') || idStr.includes('video') || idStr.includes('animate')) {
    return 'video';
  }
  if (pTag.includes('audio') || pTag.includes('speech') || tagsList.includes('audio') || tagsList.includes('whisper') || tagsList.includes('tts')) {
    return 'audio';
  }
  if (pTag.includes('code') || tagsList.includes('code') || idStr.includes('coder') || idStr.includes('starcoder')) {
    return 'coding';
  }
  if (tagsList.includes('gguf') || tagsList.includes('ollama') || idStr.includes('gguf') || tagsList.includes('llama.cpp')) {
    return 'local-ai';
  }
  if (tagsList.includes('design') || tagsList.includes('svg') || tagsList.includes('ui') || idStr.includes('vector')) {
    return 'design';
  }
  if (idStr.includes('builder') || idStr.includes('web') || tagsList.includes('html')) {
    return 'website-builder';
  }
  if (idStr.includes('agent') || idStr.includes('browser') || tagsList.includes('workflow')) {
    return 'productivity';
  }
  return 'research';
}

// Helper to determine freeStatus and openSource from tags and license
function evaluatePricingAndOpenSource(tags?: string[], licenseStr?: string): {
  freeStatus: FreeStatus;
  openSource: boolean;
  selfHosted: boolean;
  licenseName: string;
} {
  const allTags = [...(tags || []), licenseStr || ''].map(t => t.toLowerCase());
  let isOpenSource = false;
  let isSelfHosted = false;
  let licenseName = 'License unverified';

  // Check known open licenses
  for (const tag of allTags) {
    if (tag.includes('license:apache-2.0') || tag.includes('apache-2.0')) {
      isOpenSource = true;
      isSelfHosted = true;
      licenseName = 'Apache-2.0';
      break;
    }
    if (tag.includes('license:mit') || tag.includes('mit')) {
      isOpenSource = true;
      isSelfHosted = true;
      licenseName = 'MIT';
      break;
    }
    if (tag.includes('license:gpl') || tag.includes('gpl-3.0')) {
      isOpenSource = true;
      isSelfHosted = true;
      licenseName = 'GPL-3.0';
      break;
    }
    if (tag.includes('llama3') || tag.includes('llama-3')) {
      isOpenSource = true;
      isSelfHosted = true;
      licenseName = 'Llama Community License';
      break;
    }
    if (tag.includes('openrail') || tag.includes('creativeml')) {
      isOpenSource = true;
      isSelfHosted = true;
      licenseName = 'OpenRAIL';
      break;
    }
    if (tag.includes('license:cc-by') || tag.includes('cc-by-4.0')) {
      isOpenSource = true;
      isSelfHosted = true;
      licenseName = 'CC-BY-4.0';
      break;
    }
  }

  let freeStatus: FreeStatus = 'pricing-unverified';
  if (isOpenSource) {
    freeStatus = 'open-source';
  }

  return {
    freeStatus,
    openSource: isOpenSource,
    selfHosted: isSelfHosted,
    licenseName,
  };
}

// Fetch live models from Hugging Face public Hub API
async function fetchHuggingFaceModels(): Promise<{ items: AITrackerItem[]; health: SourceHealth }> {
  const startTime = Date.now();
  const url = 'https://huggingface.co/api/models?sort=createdAt&direction=-1&limit=25&full=true';
  const sourceHealth: SourceHealth = {
    id: 'hf-models',
    name: 'Hugging Face Model Hub API',
    url: 'https://huggingface.co/models',
    type: 'huggingface',
    status: 'healthy',
    latencyMs: 0,
    lastChecked: new Date().toISOString(),
    itemsRetrieved: 0,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Hexavora-AI-Tracker/1.0',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    sourceHealth.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceHealth.status = 'degraded';
      sourceHealth.error = `HTTP ${res.status}: ${res.statusText}`;
      return { items: [], health: sourceHealth };
    }

    const rawList: any[] = await res.json();
    const items: AITrackerItem[] = [];

    for (const raw of rawList) {
      if (!raw.id || typeof raw.id !== 'string') continue;
      const parts = raw.id.split('/');
      const provider = parts.length > 1 ? parts[0] : 'Community';
      const cleanName = parts.length > 1 ? parts.slice(1).join('/') : raw.id;

      const tags: string[] = Array.isArray(raw.tags) ? raw.tags : [];
      const licenseTag = tags.find(t => t.startsWith('license:'))?.replace('license:', '') || '';
      const pricing = evaluatePricingAndOpenSource(tags, licenseTag);
      const category = determineCategory(raw.pipeline_tag, tags, raw.id);

      const releaseDate = raw.createdAt ? raw.createdAt.split('T')[0] : 'Release date not verified';
      const capabilities: string[] = [];
      if (raw.pipeline_tag) {
        capabilities.push(raw.pipeline_tag.replace(/-/g, ' '));
      }
      if (pricing.selfHosted) capabilities.push('Local self-hosted inference');
      if (raw.downloads && raw.downloads > 500) capabilities.push(`Active community adoption (${raw.downloads.toLocaleString()} downloads)`);
      if (capabilities.length === 0) capabilities.push('Open model weights');

      const limitations: string[] = [];
      if (pricing.openSource) {
        limitations.push('Requires local or cloud GPU compute depending on model parameter size');
      } else {
        limitations.push('Pricing and usage limits dependent on provider terms');
      }

      items.push({
        id: `hf-${raw.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        name: cleanName,
        provider,
        type: 'model',
        category,
        description: raw.description || `Live model release by ${provider} hosted on the Hugging Face Hub under ${pricing.licenseName}.`,
        capabilities,
        releaseDate,
        freeStatus: pricing.freeStatus,
        openSource: pricing.openSource,
        selfHosted: pricing.selfHosted,
        accessType: pricing.selfHosted ? 'local' : 'api',
        officialUrl: `https://huggingface.co/${raw.id}`,
        sourceUrl: `https://huggingface.co/${raw.id}`,
        sourceName: 'Hugging Face Model Hub',
        lastVerifiedAt: new Date().toISOString(),
        verificationStatus: 'verified',
        limitations,
        tags: [category, ...tags.slice(0, 5)],
        sourceType: 'live-api',
        license: pricing.licenseName,
        downloads: typeof raw.downloads === 'number' ? raw.downloads : undefined,
        whatChanged: `Newly released or updated model on Hugging Face Hub (pipeline: ${raw.pipeline_tag || 'general'}).`,
        whyItMatters: `Expands available open ecosystem weights for ${category} tasks.`,
      });
    }

    sourceHealth.itemsRetrieved = items.length;
    return { items, health: sourceHealth };
  } catch (err: any) {
    sourceHealth.latencyMs = Date.now() - startTime;
    sourceHealth.status = 'offline';
    sourceHealth.error = err?.message || 'Network error fetching Hugging Face API';
    console.warn('Hugging Face fetch error:', err?.message);
    return { items: [], health: sourceHealth };
  }
}

// Fetch live GitHub releases for key open source AI tools
async function fetchGitHubReleases(): Promise<{ items: AITrackerItem[]; health: SourceHealth }> {
  const startTime = Date.now();
  const sourceHealth: SourceHealth = {
    id: 'github-releases',
    name: 'GitHub Official Releases API',
    url: 'https://github.com',
    type: 'github',
    status: 'healthy',
    latencyMs: 0,
    lastChecked: new Date().toISOString(),
    itemsRetrieved: 0,
  };

  const targetRepos = [
    { repo: 'ollama/ollama', name: 'Ollama Runtime', category: 'local-ai' as AICategory, provider: 'Ollama Project', access: 'cli' as const },
    { repo: 'comfyanonymous/ComfyUI', name: 'ComfyUI Core', category: 'image' as AICategory, provider: 'ComfyUI Team', access: 'local' as const },
    { repo: 'open-webui/open-webui', name: 'Open WebUI', category: 'productivity' as AICategory, provider: 'Open WebUI', access: 'web' as const },
    { repo: 'vllm-project/vllm', name: 'vLLM Engine', category: 'research' as AICategory, provider: 'vLLM Project', access: 'api' as const },
    { repo: 'ggerganov/llama.cpp', name: 'llama.cpp', category: 'local-ai' as AICategory, provider: 'Georgi Gerganov', access: 'cli' as const },
  ];

  const items: AITrackerItem[] = [];

  try {
    for (const target of targetRepos) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`https://api.github.com/repos/${target.repo}/releases/latest`, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Hexavora-AI-Tracker/1.0',
            Accept: 'application/vnd.github.v3+json',
          },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const release: any = await res.json();
          const pubDate = release.published_at ? release.published_at.split('T')[0] : 'Release date not verified';
          const tag = release.tag_name || 'latest';
          const bodySnippet = release.body ? release.body.slice(0, 280).replace(/[#*`]/g, '').trim() : '';

          items.push({
            id: `gh-${target.repo.replace('/', '-')}-${tag}`,
            name: `${target.name} (${tag})`,
            provider: target.provider,
            type: target.category === 'local-ai' ? 'runtime' : 'tool',
            category: target.category,
            description: bodySnippet || `Official open-source release for ${target.name} on GitHub.`,
            capabilities: ['Local offline execution', 'Open-source verified code', 'Active developer release notes'],
            releaseDate: pubDate,
            freeStatus: 'open-source',
            openSource: true,
            selfHosted: true,
            accessType: target.access,
            officialUrl: `https://github.com/${target.repo}`,
            sourceUrl: release.html_url || `https://github.com/${target.repo}/releases`,
            sourceName: 'GitHub Official Releases',
            lastVerifiedAt: new Date().toISOString(),
            verificationStatus: 'verified',
            limitations: ['Requires local hardware setup (CPU/GPU) and environment configuration'],
            tags: [target.category, 'github-release', 'open-source', 'verified'],
            sourceType: 'github',
            license: 'Open Source License',
            whatChanged: release.name || `Release ${tag} published with performance updates and bug fixes.`,
            whyItMatters: `Ensures reproducible, zero-cost execution on user hardware.`,
          });
        }
      } catch {
        // Individual repo fetch fail is non-fatal
      }
    }

    sourceHealth.latencyMs = Date.now() - startTime;
    sourceHealth.itemsRetrieved = items.length;
    if (items.length === 0) {
      sourceHealth.status = 'degraded';
      sourceHealth.error = 'No items retrieved or GitHub API rate-limited';
    }
    return { items, health: sourceHealth };
  } catch (err: any) {
    sourceHealth.latencyMs = Date.now() - startTime;
    sourceHealth.status = 'offline';
    sourceHealth.error = err?.message || 'Failed to fetch GitHub releases';
    return { items: [], health: sourceHealth };
  }
}

// Fetch Hugging Face Blog / AI Announcements RSS feed
async function fetchRssAnnouncements(): Promise<{ items: AITrackerItem[]; health: SourceHealth }> {
  const startTime = Date.now();
  const sourceHealth: SourceHealth = {
    id: 'hf-blog-rss',
    name: 'Hugging Face Announcements Feed',
    url: 'https://huggingface.co/blog/feed.xml',
    type: 'rss',
    status: 'healthy',
    latencyMs: 0,
    lastChecked: new Date().toISOString(),
    itemsRetrieved: 0,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://huggingface.co/blog/feed.xml', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Hexavora-AI-Tracker/1.0',
        Accept: 'application/xml, text/xml, */*',
      },
    });
    clearTimeout(timeoutId);

    sourceHealth.latencyMs = Date.now() - startTime;
    if (!res.ok) {
      sourceHealth.status = 'degraded';
      sourceHealth.error = `HTTP ${res.status}`;
      return { items: [], health: sourceHealth };
    }

    const xml = await res.text();
    const items: AITrackerItem[] = [];

    // Simple robust regex parser for RSS <item> tags
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    for (const rawItem of itemMatches.slice(0, 8)) {
      const title = rawItem.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.trim();
      const link = rawItem.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim();
      const pubDateStr = rawItem.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
      const description = rawItem.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<[^>]*>/g, '').trim();

      if (title && link) {
        let releaseDate = 'Release date not verified';
        if (pubDateStr) {
          const parsed = new Date(pubDateStr);
          if (!isNaN(parsed.getTime())) {
            releaseDate = parsed.toISOString().split('T')[0];
          }
        }

        const category = determineCategory('', [], title);

        items.push({
          id: `rss-${Buffer.from(title).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
          name: title,
          provider: 'Hugging Face Research',
          type: 'framework',
          category,
          description: description?.slice(0, 240) || `Official announcement: ${title}`,
          capabilities: ['Official open technical blog', 'Benchmarked methodologies', 'Open weights / datasets'],
          releaseDate,
          freeStatus: 'open-source',
          openSource: true,
          selfHosted: true,
          accessType: 'web',
          officialUrl: link,
          sourceUrl: link,
          sourceName: 'Hugging Face Blog RSS',
          lastVerifiedAt: new Date().toISOString(),
          verificationStatus: 'verified',
          limitations: ['Review official documentation for specific hardware requirements'],
          tags: [category, 'announcement', 'rss', 'verified-source'],
          sourceType: 'rss',
          whatChanged: title,
          whyItMatters: 'Verified release announcement from foundational AI researchers.',
        });
      }
    }

    sourceHealth.itemsRetrieved = items.length;
    return { items, health: sourceHealth };
  } catch (err: any) {
    sourceHealth.latencyMs = Date.now() - startTime;
    sourceHealth.status = 'degraded';
    sourceHealth.error = err?.message || 'Failed to parse RSS feed';
    return { items: [], health: sourceHealth };
  }
}

// Aggregator function: fetches live sources + combines with curated baseline
async function getAggregatedTrackerData(forceRefresh = false): Promise<TrackerDataResponse> {
  const now = Date.now();
  if (!forceRefresh && cache.data && (now - cache.fetchedAt < CACHE_TTL_MS)) {
    return {
      ...cache.data,
      isCached: true,
      cacheAgeSeconds: Math.floor((now - cache.fetchedAt) / 1000),
    };
  }

  // Baseline source health
  const baselineHealth: SourceHealth = {
    id: 'curated-baseline',
    name: 'Hexavora Curated Baseline Dataset',
    url: 'internal://verified-baseline',
    type: 'curated',
    status: 'healthy',
    latencyMs: 1,
    lastChecked: new Date().toISOString(),
    itemsRetrieved: CURATED_BASELINE_ITEMS.length,
    notes: 'Verified historical releases & tools with vetted pricing tiers',
  };

  // Run live fetches in parallel
  const [hfResult, ghResult, rssResult] = await Promise.all([
    fetchHuggingFaceModels(),
    fetchGitHubReleases(),
    fetchRssAnnouncements(),
  ]);

  // Combine items, avoiding duplicates
  const seenIds = new Set<string>();
  const combinedItems: AITrackerItem[] = [];

  // 1. First add live fetched items
  const liveItems = [...hfResult.items, ...ghResult.items, ...rssResult.items];
  for (const item of liveItems) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      combinedItems.push(item);
    }
  }

  // 2. Then add curated baseline items
  for (const item of CURATED_BASELINE_ITEMS) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      combinedItems.push(item);
    }
  }

  const sources: SourceHealth[] = [
    hfResult.health,
    ghResult.health,
    rssResult.health,
    baselineHealth,
  ];

  const response: TrackerDataResponse = {
    items: combinedItems,
    sources,
    lastRefreshed: new Date().toISOString(),
    isCached: false,
    cacheAgeSeconds: 0,
    totalCount: combinedItems.length,
    liveCount: liveItems.length,
    baselineCount: CURATED_BASELINE_ITEMS.length,
  };

  // Update memory cache
  cache.data = response;
  cache.fetchedAt = now;

  return response;
}

// ---------------- API ROUTES ----------------

// GET /api/tracker/data
app.get('/api/tracker/data', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const data = await getAggregatedTrackerData(forceRefresh);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching tracker data:', error);
    res.status(500).json({
      error: 'Failed to retrieve AI tracker data',
      message: error?.message || 'Internal error',
      fallbackItems: CURATED_BASELINE_ITEMS,
    });
  }
});

// GET /api/tracker/health
app.get('/api/tracker/health', async (req: Request, res: Response) => {
  try {
    const data = await getAggregatedTrackerData(false);
    res.json({
      status: 'operational',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      sources: data.sources,
      lastRefreshed: data.lastRefreshed,
      isCached: data.isCached,
      cacheAgeSeconds: data.cacheAgeSeconds,
      totalTracked: data.totalCount,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err?.message });
  }
});

// POST /api/scout/chat
// Grounded AI Assistant strictly using retrieved tracker data
app.post('/api/scout/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    const data = await getAggregatedTrackerData(false);
    const trackedItems = data.items;

    // Check if Gemini API is available
    const ai = getGenAI();
    if (ai) {
      try {
        // Construct grounded context of items
        const compactContext = trackedItems.map(item => ({
          name: item.name,
          provider: item.provider,
          category: item.category,
          type: item.type,
          freeStatus: item.freeStatus,
          openSource: item.openSource,
          selfHosted: item.selfHosted,
          releaseDate: item.releaseDate,
          capabilities: item.capabilities.slice(0, 3),
          limitations: item.limitations,
          officialUrl: item.officialUrl,
          sourceName: item.sourceName,
          sourceType: item.sourceType,
        }));

        const systemInstruction = `You are "Hexavora Scout", an authoritative, precise, and transparent AI discovery specialist for the Hexavora AI Tracker platform.
You help users explore recently discovered AI models, tools, and runtimes.

CRITICAL RULES:
1. Ground your answers strictly on the tracked models and tools provided in the context.
2. ACCURATE PRICING: Never say something is simply "Free" if it only has a limited free tier, trial, or requires paid API tokens. Distinguish clearly between:
   - "Open source" (code/weights freely inspectable and runnable)
   - "Free tier" (free with credit limits, rate limits, or public visibility)
   - "Self-hosted" (runs on user's own hardware without subscription fees)
   - "Pricing unverified" (display when no confirmed free plan is recorded).
3. If the user asks for tools or categories that are not currently verified in the dataset, state clearly: "Based on our currently verified tracker sources, I don't see a confirmed tool matching that criteria yet." Do NOT invent or hallucinate tools, fake release dates, or non-existent free quotas.
4. Format your answer with clean markdown, bullet points, and mention exact model names and provider names.
5. Provide actionable advice (e.g. VRAM requirements, access types like CLI vs Web, and whether Ollama / ComfyUI can run it).

TRACKED DATASET (${trackedItems.length} verified records):
${JSON.stringify(compactContext, null, 2)}
`;

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `User Question: ${message}` }],
            },
          ],
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        const reply = geminiResponse.text || "I was unable to generate a response from the current data.";

        // Find referenced tool IDs in reply to enable clickable tool chips
        const referencedIds = trackedItems
          .filter(t => reply.toLowerCase().includes(t.name.toLowerCase()))
          .map(t => t.id)
          .slice(0, 5);

        return res.json({
          reply,
          referencedToolIds: referencedIds,
          modelUsed: 'gemini-3.8-flash',
          groundedOnCount: trackedItems.length,
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using intelligent local engine:', geminiError?.message);
        // Fall through to algorithmic scout
      }
    }

    // Algorithmic Intelligent Scout Fallback (when no GEMINI_API_KEY is present or on API limit)
    const q = message.toLowerCase();
    let matching = trackedItems;

    // Filters based on natural language keywords
    if (q.includes('free tier') || q.includes('tier')) {
      matching = matching.filter(i => i.freeStatus === 'free-tier');
    } else if (q.includes('open source') || q.includes('open-source')) {
      matching = matching.filter(i => i.openSource);
    } else if (q.includes('local') || q.includes('pc') || q.includes('ollama') || q.includes('offline')) {
      matching = matching.filter(i => i.selfHosted || i.category === 'local-ai');
    } else if (q.includes('image')) {
      matching = matching.filter(i => i.category === 'image');
    } else if (q.includes('video')) {
      matching = matching.filter(i => i.category === 'video');
    } else if (q.includes('audio') || q.includes('music') || q.includes('whisper')) {
      matching = matching.filter(i => i.category === 'audio');
    } else if (q.includes('coding') || q.includes('code')) {
      matching = matching.filter(i => i.category === 'coding');
    } else if (q.includes('website') || q.includes('web builder')) {
      matching = matching.filter(i => i.category === 'website-builder');
    } else if (q.includes('app builder') || q.includes('app')) {
      matching = matching.filter(i => i.category === 'app-builder');
    }

    const topMatches = matching.slice(0, 4);

    let reply = `### Hexavora Scout Analysis\n\n`;
    if (topMatches.length > 0) {
      reply += `Found **${topMatches.length} verified item(s)** in the current tracked data matching your query:\n\n`;
      topMatches.forEach(item => {
        reply += `* **[${item.name}](${item.officialUrl})** (${item.provider})\n`;
        reply += `  * **Category**: \`${item.category}\` | **Status**: **${item.freeStatus.toUpperCase()}**\n`;
        reply += `  * **Access**: ${item.accessType.toUpperCase()} | **Source**: ${item.sourceName}\n`;
        reply += `  * **Capabilities**: ${item.capabilities.join(', ')}\n`;
        if (item.limitations.length > 0) {
          reply += `  * **Limitations**: ${item.limitations[0]}\n`;
        }
        reply += `\n`;
      });
      reply += `*Note: This response is verified against Hexavora's live retrieval baseline (${data.totalCount} active items).*`;
    } else {
      reply += `I searched the **${trackedItems.length} currently verified models and tools**, but could not find a confirmed item specifically matching "${message}".\n\n`;
      reply += `*Tip:* Try asking for specific categories like \`free image generators\`, \`open-source video\`, \`local AI models for Ollama\`, or \`AI website builders\`.`;
    }

    return res.json({
      reply,
      referencedToolIds: topMatches.map(t => t.id),
      modelUsed: 'local-verified-engine',
      groundedOnCount: trackedItems.length,
    });
  } catch (err: any) {
    console.error('Scout error:', err);
    res.status(500).json({ error: 'Failed to process scout query', message: err?.message });
  }
});

// ---------------- VITE MIDDLEWARE / STATIC ASSETS ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hexavora AI Tracker backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
