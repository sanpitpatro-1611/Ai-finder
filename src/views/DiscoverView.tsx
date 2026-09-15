import React, { useState, useMemo } from 'react';
import { AITrackerItem, AICategory, FreeStatus, ItemType } from '../types';
import { ToolCard } from '../components/ToolCard';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from '../components/CategoryIcon';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RefreshCw,
  Terminal,
  Zap,
  ArrowUpDown,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface DiscoverViewProps {
  items: AITrackerItem[];
  savedIds: Set<string>;
  onToggleSave: (item: AITrackerItem) => void;
  onSelectTool: (item: AITrackerItem) => void;
  isCached: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  initialCategory?: AICategory | 'all';
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  items,
  savedIds,
  onToggleSave,
  onSelectTool,
  isCached,
  onRefresh,
  isRefreshing,
  initialCategory = 'all',
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AICategory | 'all'>(initialCategory);
  const [selectedFreeStatus, setSelectedFreeStatus] = useState<FreeStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [selfHostedOnly, setSelfHostedOnly] = useState(false);
  const [recentlyReleasedOnly, setRecentlyReleasedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'recently-updated' | 'free-first' | 'open-source-first' | 'most-relevant'>('newest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Active filter count
  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) +
    (selectedFreeStatus !== 'all' ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0) +
    (openSourceOnly ? 1 : 0) +
    (selfHostedOnly ? 1 : 0) +
    (recentlyReleasedOnly ? 1 : 0) +
    (search ? 1 : 0);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedFreeStatus('all');
    setSelectedType('all');
    setOpenSourceOnly(false);
    setSelfHostedOnly(false);
    setRecentlyReleasedOnly(false);
    setSortBy('newest');
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search query matching
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.provider.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.capabilities.some(c => c.toLowerCase().includes(q)) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Free status filter
    if (selectedFreeStatus !== 'all') {
      result = result.filter(item => item.freeStatus === selectedFreeStatus);
    }

    // Item type
    if (selectedType !== 'all') {
      result = result.filter(item => item.type === selectedType);
    }

    // Boolean toggles
    if (openSourceOnly) {
      result = result.filter(item => item.openSource);
    }
    if (selfHostedOnly) {
      result = result.filter(item => item.selfHosted);
    }
    if (recentlyReleasedOnly) {
      result = result.filter(item => item.releaseDate && item.releaseDate !== 'Release date not verified');
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.releaseDate && a.releaseDate !== 'Release date not verified' ? new Date(a.releaseDate).getTime() : 0;
        const dateB = b.releaseDate && b.releaseDate !== 'Release date not verified' ? new Date(b.releaseDate).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'recently-updated') {
        return new Date(b.lastVerifiedAt).getTime() - new Date(a.lastVerifiedAt).getTime();
      }
      if (sortBy === 'free-first') {
        const score = (s: FreeStatus) => (s === 'free' ? 3 : s === 'open-source' ? 2 : s === 'free-tier' ? 1 : 0);
        return score(b.freeStatus) - score(a.freeStatus);
      }
      if (sortBy === 'open-source-first') {
        return (b.openSource ? 1 : 0) - (a.openSource ? 1 : 0);
      }
      return 0;
    });

    return result;
  }, [items, search, selectedCategory, selectedFreeStatus, selectedType, openSourceOnly, selfHostedOnly, recentlyReleasedOnly, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Search & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Live AI Discovery Feed
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Transparently tracking newly released models, tools, and runtimes across verified sources.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="discover-filter-toggle-mobile"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Sort:</span>
            <select
              id="discover-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#090f1d] text-white">Newest releases</option>
              <option value="recently-updated" className="bg-[#090f1d] text-white">Recently verified</option>
              <option value="free-first" className="bg-[#090f1d] text-white">Free & Free-tier first</option>
              <option value="open-source-first" className="bg-[#090f1d] text-white">Open source first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-[#0c1427] hover:bg-[#111e3b] text-slate-300 border-slate-800'
          }`}
        >
          All Categories ({items.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = items.filter(i => i.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-[#0c1427] hover:bg-[#111e3b] text-slate-300 border-slate-800'
              }`}
            >
              <CategoryIcon category={cat.id} className="w-3.5 h-3.5" />
              <span>{cat.shortLabel}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-900 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar (Desktop & Collapsible Mobile) */}
      <div className={`p-4 rounded-xl bg-[#0a1122] border border-slate-800/90 space-y-3 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box inside filter */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="discover-inline-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by name, provider, capability (e.g. 'flux', 'whisper', 'svg')..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pricing Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              id="discover-pricing-select"
              value={selectedFreeStatus}
              onChange={e => setSelectedFreeStatus(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all" className="bg-[#090f1d]">All Pricing Statuses</option>
              <option value="open-source" className="bg-[#090f1d]">Open Source Only</option>
              <option value="free" className="bg-[#090f1d]">Completely Free</option>
              <option value="free-tier" className="bg-[#090f1d]">Free Tier (Limited)</option>
              <option value="self-hosted" className="bg-[#090f1d]">Self-Hosted</option>
              <option value="free-credits" className="bg-[#090f1d]">Free Credits</option>
              <option value="pricing-unverified" className="bg-[#090f1d]">Pricing Unverified</option>
            </select>
          </div>
        </div>

        {/* Checkbox / Toggle Quick Filters */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80 flex-wrap text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={openSourceOnly}
                onChange={e => setOpenSourceOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Open source only
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={selfHostedOnly}
                onChange={e => setSelfHostedOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Self-hosted / Local PC</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={recentlyReleasedOnly}
                onChange={e => setRecentlyReleasedOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Verified date only
              </span>
            </label>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filters ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-bold">{filteredItems.length}</strong> of {items.length} tracked items
        </span>
        {search && (
          <span>
            Keyword: <span className="text-blue-400">"{search}"</span>
          </span>
        )}
      </div>

      {/* Cards Grid */}
      {filteredItems.length > 0 ? (
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
      ) : (
        <div className="p-12 rounded-2xl bg-[#0a1122] border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No tracked tools match your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing status filters, or resetting the category selection.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
