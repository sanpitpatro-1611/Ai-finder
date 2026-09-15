import { CategoryMeta } from '../types';

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'image',
    label: 'Image Generation',
    shortLabel: 'Image',
    description: 'Diffusion models, image synthesis, photo enhancement, and visual editing engines.',
    iconName: 'Image',
    accentColor: '#3b82f6',
    keywords: ['diffusion', 'text-to-image', 'flux', 'stable-diffusion', 'upscaling', 'inpaint']
  },
  {
    id: 'video',
    label: 'Video Generation',
    shortLabel: 'Video',
    description: 'Text-to-video, image-to-video animation, video motion transfer, and cinematic synthesis.',
    iconName: 'Video',
    accentColor: '#8b5cf6',
    keywords: ['text-to-video', 'cinematic', 'motion', 'video-gen', 'diffusion-transformer']
  },
  {
    id: 'audio',
    label: 'Audio / Music',
    shortLabel: 'Audio',
    description: 'Speech recognition, voice cloning, music generation, and audio stem separation.',
    iconName: 'Music',
    accentColor: '#06b6d4',
    keywords: ['speech-recognition', 'tts', 'audio-synthesis', 'music', 'whisper', 'voice']
  },
  {
    id: 'coding',
    label: 'Coding Assistants',
    shortLabel: 'Coding',
    description: 'Code completion, autonomous agents, repo-level refactoring, and code LLMs.',
    iconName: 'Code2',
    accentColor: '#10b981',
    keywords: ['code-generation', 'ide', 'terminal', 'copilot', 'debugger', 'autocomplete']
  },
  {
    id: 'website-builder',
    label: 'Website Builders',
    shortLabel: 'Website',
    description: 'Generative web layout creators, landing page builders, and HTML/React designers.',
    iconName: 'Globe',
    accentColor: '#f59e0b',
    keywords: ['website-builder', 'landing-page', 'v0', 'bolt', 'html', 'tailwind']
  },
  {
    id: 'app-builder',
    label: 'App Builders',
    shortLabel: 'App Builder',
    description: 'Full-stack application synthesis, prototype generators, and database scaffolding.',
    iconName: 'Layers',
    accentColor: '#ec4899',
    keywords: ['fullstack', 'prototype', 'mobile-app', 'crud-generator', 'workflow']
  },
  {
    id: 'design',
    label: 'Design & UI/UX',
    shortLabel: 'Design',
    description: 'Vector generation, design system tokens, 3D asset creation, and visual styling tools.',
    iconName: 'Palette',
    accentColor: '#a855f7',
    keywords: ['ui-ux', 'vector', 'figma-ai', 'svg', 'canvas', 'textures', '3d']
  },
  {
    id: 'research',
    label: 'Research & Reasoning',
    shortLabel: 'Research',
    description: 'Deep reasoning models, paper summarization, citation verification, and knowledge search.',
    iconName: 'BookOpen',
    accentColor: '#6366f1',
    keywords: ['reasoning', 'math', 'arxiv', 'literature-review', 'citations', 'deep-research']
  },
  {
    id: 'local-ai',
    label: 'Local AI Runtimes',
    shortLabel: 'Local AI',
    description: 'Models and runtimes optimized to execute completely offline on consumer GPUs/CPUs via Ollama or llama.cpp.',
    iconName: 'Cpu',
    accentColor: '#14b8a6',
    keywords: ['ollama', 'llama-cpp', 'gguf', 'offline', 'consumer-gpu', 'on-premise']
  },
  {
    id: 'productivity',
    label: 'Productivity & Agents',
    shortLabel: 'Productivity',
    description: 'Automated note-taking, browser workflow agents, meeting summarizers, and executive assistants.',
    iconName: 'CheckSquare',
    accentColor: '#38bdf8',
    keywords: ['workflow', 'automation', 'notes', 'meeting-summary', 'agentic', 'browser-use']
  }
];

export function getCategoryMeta(categoryId: string): CategoryMeta | undefined {
  return CATEGORIES.find(c => c.id === categoryId);
}
