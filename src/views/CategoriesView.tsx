import React, { useState } from 'react';
import { AITrackerItem, AICategory, FreeStatus, ItemType } from '../types';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from '../components/CategoryIcon';
import { ToolCard } from '../components/ToolCard';
import {
  Layers,
  Terminal,
  Zap,
  Filter,
  CheckCircle2,
  Calendar,
  Cpu,
  Search
} from 'lucide-react';

interface CategoriesViewProps {
  items: AITrackerItem[];
  savedIds: Set<string>;
  onToggleSave: (item: AITrackerItem) => void;
  onSelectTool: (item: AITrackerItem) => void;
  isCached: boolean;
  selectedCategory?: AICategory;
  onCategoryChange?: (cat: AICategory) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  items,
  savedIds,
  onToggleSave,
  onSelectTool,
  isCached,
  selectedCategory: propCategory,
  onCategoryChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<AICategory>(propCategory || 'image');
  const [freeFilter, setFreeFilter] = useState<FreeStatus | 'all'>('all');
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [selfHostedOnly, setSelfHostedOnly] = useState(false);
  const [recentOnly, setRecentOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');

  const currentMeta = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  const handleSelectCategory = (cat: AICategory) => {
    setActiveCategory(cat);
    if (onCategoryChange) onCategoryChange(cat);
  };

  // Filter items strictly within this category
  const categoryItems = items.filter(i => i.category === activeCategory);

  const filteredItems = categoryItems.filter(item => {
    if (freeFilter !== 'all' && item.freeStatus !== freeFilter) return false;
    if (openSourceOnly && !item.openSource) return false;
    if (selfHostedOnly && !item.selfHosted) return false;
    if (recentOnly && (!item.releaseDate || item.releaseDate === 'Release date not verified')) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Category Tabs Grid */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          10 Dedicated AI Categories
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Filter and inspect models, software tools, and runtimes specialized by task domain.
        </p>
      </div>

      {/* Category Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {CATEGORIES.map(cat => {
          const isCurrent = cat.id === activeCategory;
          const count = items.filter(i => i.category === cat.id).length;
          return (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id}`}
              onClick={() => handleSelectCategory(cat.id)}
              className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-950/40 text-white'
                  : 'bg-[#0c1427]/90 hover:bg-[#111e3b] border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <CategoryIcon
                  category={cat.id}
                  className={`w-4 h-4 ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`}
                />
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                  {count}
                </span>
              </div>
              <span className="text-xs font-bold truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Domain Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0c1833] to-[#091124] border border-blue-800/40 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300">
            <CategoryIcon category={currentMeta.id} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">
              {currentMeta.label}
            </h3>
            <p className="text-xs text-slate-300">
              {currentMeta.description}
            </p>
          </div>
        </div>

        {/* Sub-Filters inside Category */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Free Status */}
            <select
              value={freeFilter}
              onChange={e => setFreeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Pricing Tiers</option>
              <option value="open-source">Open Source</option>
              <option value="free">Verified Free</option>
              <option value="free-tier">Free Tier</option>
              <option value="self-hosted">Self-Hosted</option>
            </select>

            {/* Model vs Product / Framework */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Models & Tools</option>
              <option value="model">Weights & Models only</option>
              <option value="tool">Interactive Products / Tools</option>
              <option value="runtime">Runtimes & Frameworks</option>
            </select>

            {/* Checkboxes */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={openSourceOnly}
                onChange={e => setOpenSourceOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Open source</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={selfHostedOnly}
                onChange={e => setSelfHostedOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Self-hosted</span>
            </label>
          </div>

          <span className="text-slate-400 font-medium">
            {filteredItems.length} of {categoryItems.length} items
          </span>
        </div>
      </div>

      {/* Cards in this category */}
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
        <div className="p-10 rounded-2xl bg-[#0a1122] border border-slate-800 text-center space-y-2">
          <p className="text-sm font-semibold text-white">No tools found matching current sub-filters in {currentMeta.label}</p>
          <button
            onClick={() => {
              setFreeFilter('all');
              setOpenSourceOnly(false);
              setSelfHostedOnly(false);
              setTypeFilter('all');
            }}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Reset sub-filters
          </button>
        </div>
      )}
    </div>
  );
};
