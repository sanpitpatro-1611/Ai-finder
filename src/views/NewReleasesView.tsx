import React, { useState, useMemo } from 'react';
import { AITrackerItem } from '../types';
import { FreeStatusBadge, SourceTypeBadge, VerificationBadge } from '../components/Badges';
import { CategoryIcon } from '../components/CategoryIcon';
import {
  Calendar,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';

interface NewReleasesViewProps {
  items: AITrackerItem[];
  savedIds: Set<string>;
  onToggleSave: (item: AITrackerItem) => void;
  onSelectTool: (item: AITrackerItem) => void;
  isCached: boolean;
}

export const NewReleasesView: React.FC<NewReleasesViewProps> = ({
  items,
  savedIds,
  onToggleSave,
  onSelectTool,
  isCached,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'open-source' | 'free-only'>('all');

  // Filter items with verified release dates or recent timestamps
  const releases = useMemo(() => {
    let list = [...items].sort((a, b) => {
      const dateA = a.releaseDate && a.releaseDate !== 'Release date not verified' ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate && b.releaseDate !== 'Release date not verified' ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });

    if (filterMode === 'open-source') {
      list = list.filter(i => i.openSource);
    } else if (filterMode === 'free-only') {
      list = list.filter(i => i.freeStatus === 'free' || i.freeStatus === 'open-source' || i.freeStatus === 'free-tier');
    }

    return list;
  }, [items, filterMode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-950/80 border border-blue-600/30 text-blue-300 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Timeline Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Newly Released & Announced
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Transparent release timeline tracking what changed, why it matters, and verified license terms.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterMode === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Recent ({items.length})
          </button>
          <button
            onClick={() => setFilterMode('open-source')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterMode === 'open-source' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Open Source
          </button>
          <button
            onClick={() => setFilterMode('free-only')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterMode === 'free-only' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Free / Free Tier
          </button>
        </div>
      </div>

      {/* Release Timeline Cards */}
      <div className="space-y-4">
        {releases.map((item, index) => {
          const isSaved = savedIds.has(item.id);
          const hasDate = item.releaseDate && item.releaseDate !== 'Release date not verified';

          return (
            <div
              key={item.id}
              id={`release-row-${item.id}`}
              className="p-5 sm:p-6 rounded-2xl bg-[#0c1427]/80 hover:bg-[#101b35] border border-slate-800/80 hover:border-blue-700/60 transition-all shadow-md space-y-4"
            >
              {/* Row Top: Date, Provider, Badges & Save */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-600/30 text-blue-300 text-xs font-mono font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{hasDate ? item.releaseDate : 'Release date not verified'}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                    <CategoryIcon category={item.category} className="w-3.5 h-3.5 text-blue-400" />
                    <span className="capitalize">{item.category.replace('-', ' ')}</span>
                  </span>

                  <span className="text-xs text-slate-400 font-medium">by {item.provider}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FreeStatusBadge status={item.freeStatus} />
                  <SourceTypeBadge type={item.sourceType} isCached={isCached} />
                  <button
                    onClick={() => onToggleSave(item)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isSaved
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={isSaved ? 'Saved' : 'Save'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4 fill-blue-500/30" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <h3
                    onClick={() => onSelectTool(item)}
                    className="text-lg font-extrabold text-white hover:text-blue-300 cursor-pointer transition-colors"
                  >
                    {item.name}
                  </h3>
                  <button
                    onClick={() => onSelectTool(item)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 shrink-0"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-slate-300/90 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* What Changed & Why It Matters Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-[#080e1e] border border-blue-950">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    What Changed / Introduced
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {item.whatChanged || `Newly announced or published model under ${item.sourceName}.`}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Why It Matters
                  </span>
                  <p className="text-xs text-blue-200/90 leading-relaxed">
                    {item.whyItMatters || `Expands community capabilities in ${item.category} with verified source documentation.`}
                  </p>
                </div>
              </div>

              {/* Card Footer: Capabilities & Official Source Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-slate-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500 font-medium">Access:</span>
                  <span className="font-semibold text-slate-300 uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {item.accessType}
                  </span>
                  {item.license && (
                    <>
                      <span className="text-slate-500 font-medium">License:</span>
                      <span className="text-slate-300">{item.license}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={item.sourceUrl || item.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    <span>Official Announcement ({item.sourceName})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
