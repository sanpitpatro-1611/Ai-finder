import React, { useState, useMemo } from 'react';
import { AITrackerItem, FreeStatus } from '../types';
import { ToolCard } from '../components/ToolCard';
import { FreeStatusBadge } from '../components/Badges';
import {
  Zap,
  Search,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface FreeFinderViewProps {
  items: AITrackerItem[];
  savedIds: Set<string>;
  onToggleSave: (item: AITrackerItem) => void;
  onSelectTool: (item: AITrackerItem) => void;
  isCached: boolean;
}

const PRESET_QUERIES = [
  { label: 'Free AI Image Generators', query: 'image', status: 'open-source' as FreeStatus },
  { label: 'Open-Source Video Models', query: 'video', status: 'open-source' as FreeStatus },
  { label: 'Free AI Website Builders', query: 'website', status: 'free-tier' as FreeStatus },
  { label: 'AI Coding Tools with Free Tier', query: 'coding', status: 'all' as const },
  { label: 'Local AI Models to Run on PC', query: 'local', status: 'open-source' as FreeStatus },
];

export const FreeFinderView: React.FC<FreeFinderViewProps> = ({
  items,
  savedIds,
  onToggleSave,
  onSelectTool,
  isCached,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTier, setActiveTier] = useState<FreeStatus | 'all'>('all');
  const [selfHostedOnly, setSelfHostedOnly] = useState(false);

  // Filter actual tracked data with strict pricing truth
  const filteredItems = useMemo(() => {
    let list = [...items];

    // Restrict to free/open-source/free-tier unless 'all' is explicitly chosen
    if (activeTier === 'all') {
      list = list.filter(i =>
        i.freeStatus === 'free' ||
        i.freeStatus === 'free-tier' ||
        i.freeStatus === 'open-source' ||
        i.freeStatus === 'self-hosted' ||
        i.freeStatus === 'free-credits'
      );
    } else {
      list = list.filter(i => i.freeStatus === activeTier);
    }

    if (selfHostedOnly) {
      list = list.filter(i => i.selfHosted);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.capabilities.some(c => c.toLowerCase().includes(q)) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [items, activeTier, selfHostedOnly, searchQuery]);

  const handleApplyPreset = (preset: typeof PRESET_QUERIES[0]) => {
    setSearchQuery(preset.query);
    if (preset.status !== 'all') {
      setActiveTier(preset.status);
    } else {
      setActiveTier('all');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 border border-emerald-600/40 text-emerald-300">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero-Cost & Free-Tier Intelligence</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Free AI Finder
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Find out what AI tools and models you can <span className="text-emerald-400 font-semibold">actually use for free</span>.
          No marketing smoke and mirrors: we rigorously separate genuine open source and local weights from promotional free trials and restricted credit tiers.
        </p>
      </div>

      {/* Preset Discovery Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          One-Click Discoveries:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-blue-950/50 border border-slate-800 hover:border-blue-700/50 text-xs font-semibold text-slate-200 hover:text-blue-300 transition-colors whitespace-nowrap"
            >
              <span>{preset.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Nuance Matrix Box */}
      <div className="p-4 rounded-xl bg-[#091122] border border-blue-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/30 space-y-1">
          <span className="font-bold text-blue-300 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" />
            Open Source Weights
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Free forever under licenses like Apache 2.0 or MIT. You supply the local GPU/CPU compute (e.g. via Ollama or ComfyUI).
          </p>
        </div>

        <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/30 space-y-1">
          <span className="font-bold text-cyan-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Free Tier (Hosted)
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Web service provides continuous zero-cost access, but typically imposes daily/monthly credit caps or public visibility.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <span className="font-bold text-slate-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            Pricing Unverified
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            When an AI company has not officially documented their ongoing free policy, we honestly label it unverified rather than guessing.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#0a1122] border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search free tools (e.g. 'coding', 'ollama', 'flux')..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => setActiveTier('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTier === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Zero-Cost ({items.filter(i => i.freeStatus !== 'paid' && i.freeStatus !== 'pricing-unverified').length})
            </button>

            <button
              onClick={() => setActiveTier('open-source')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTier === 'open-source'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Open Source Only
            </button>

            <button
              onClick={() => setActiveTier('free-tier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTier === 'free-tier'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Free Tier (Cloud)
            </button>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300 ml-auto sm:ml-2">
              <input
                type="checkbox"
                checked={selfHostedOnly}
                onChange={e => setSelfHostedOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Runs on Local PC</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <ToolCard
            key={item.id}
            item={item}
            isSaved={savedIds.has(item.id)}
            onToggleSave={onToggleSave}
            onSelect={onSelectTool}
            isCached={isCached}
          />
        ))}
      </div>
    </div>
  );
};
