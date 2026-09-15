import React from 'react';
import { AITrackerItem } from '../types';
import { ToolCard } from '../components/ToolCard';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from '../components/CategoryIcon';
import {
  Compass,
  Sparkles,
  Zap,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { NavigationTab } from '../components/Sidebar';

interface DashboardViewProps {
  items: AITrackerItem[];
  savedIds: Set<string>;
  onToggleSave: (item: AITrackerItem) => void;
  onSelectTool: (item: AITrackerItem) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenScout: () => void;
  isCached: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  savedIds,
  onToggleSave,
  onSelectTool,
  onNavigateTab,
  onSelectCategory,
  onOpenScout,
  isCached,
  onRefresh,
  isRefreshing,
}) => {
  // Metrics calculation
  const totalTracked = items.length;
  const openSourceCount = items.filter(i => i.openSource).length;
  const freeTierCount = items.filter(i => i.freeStatus === 'free' || i.freeStatus === 'free-tier').length;
  const localAICount = items.filter(i => i.selfHosted || i.category === 'local-ai').length;
  const liveCount = items.filter(i => i.sourceType !== 'curated-baseline').length;

  // New releases (items with release date)
  const newReleases = [...items]
    .filter(i => i.releaseDate && i.releaseDate !== 'Release date not verified')
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 6);

  // Spotlight item (e.g. first live release or top baseline item)
  const spotlightItem = items.find(i => i.sourceType === 'live-api') || items[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero / Vision Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0c1834] via-[#0e162b] to-[#0a1020] border border-blue-900/40 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/90 border border-blue-600/30 text-xs font-semibold text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hexavora AI Discovery Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Discover what’s next in AI.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Live AI models, tools, and releases—tracked with clarity. Answering:
            <span className="text-white font-semibold italic">
              {' '}"What new AI models or tools have been released recently, what can they do, and can I actually use them for free?"
            </span>
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="dashboard-explore-btn"
              onClick={() => onNavigateTab('discover')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors shadow-lg shadow-blue-950/40"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All {totalTracked} Tracked Tools</span>
            </button>

            <button
              id="dashboard-free-finder-btn"
              onClick={() => onNavigateTab('free-finder')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Free AI Finder</span>
            </button>

            <button
              id="dashboard-ask-scout-btn"
              onClick={onOpenScout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/60 border border-indigo-700/40 text-xs font-semibold text-indigo-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Ask Scout AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Honest Useful Metrics Cards (No AI Slop charts) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#0c1427]/90 border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tracked</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {totalTracked}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {liveCount} from live APIs • {totalTracked - liveCount} baseline
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0c1427]/90 border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Open Source</span>
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {openSourceCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Weights or public code repositories
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0c1427]/90 border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Free / Free Tier</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {freeTierCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Verified zero-cost access methods
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0c1427]/90 border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Local & Offline</span>
            <Cpu className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {localAICount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Runs via Ollama, llama.cpp, or GPU
          </p>
        </div>
      </div>

      {/* Discover Something New Spotlight */}
      {spotlightItem && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1731] to-[#091022] border border-blue-700/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Spotlight Discovery
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Verified by {spotlightItem.sourceName}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-extrabold text-white">
                  {spotlightItem.name}
                </h3>
                <span className="text-xs text-slate-400 font-medium">by {spotlightItem.provider}</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                  {spotlightItem.freeStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {spotlightItem.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="spotlight-view-btn"
                onClick={() => onSelectTool(spotlightItem)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-md shadow-blue-950/40"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Shortcuts Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            Explore by Category
          </h3>
          <button
            onClick={() => onNavigateTab('categories')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>View all 10 categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => {
            const count = items.filter(i => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                id={`cat-card-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-3.5 rounded-xl bg-[#0c1427]/80 hover:bg-[#111e3b] border border-slate-800/80 hover:border-blue-700/50 text-left transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-blue-700/40 text-blue-400 transition-colors">
                    <CategoryIcon category={cat.id} className="w-4 h-4" />
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                    {count}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                    {cat.shortLabel}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recently Released & Verified Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Recently Released & Verified
            </h3>
            <p className="text-xs text-slate-400">
              Live updates directly ingested from Hugging Face, GitHub, and official RSS feeds
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('new-releases')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>See timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newReleases.map(item => (
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
    </div>
  );
};
