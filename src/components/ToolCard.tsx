import React from 'react';
import { AITrackerItem } from '../types';
import { FreeStatusBadge, SourceTypeBadge, VerificationBadge } from './Badges';
import { CategoryIcon } from './CategoryIcon';
import { Bookmark, BookmarkCheck, ExternalLink, ArrowUpRight, Cpu, Calendar, ShieldCheck } from 'lucide-react';

interface ToolCardProps {
  item: AITrackerItem;
  isSaved: boolean;
  onToggleSave: (item: AITrackerItem) => void;
  onSelect: (item: AITrackerItem) => void;
  isCached?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  item,
  isSaved,
  onToggleSave,
  onSelect,
  isCached = false,
}) => {
  const formattedDate = item.releaseDate && item.releaseDate !== 'Release date not verified'
    ? item.releaseDate
    : 'Release date not verified';

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 60) return `${Math.max(1, mins)}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'recent';
    }
  };

  return (
    <div
      id={`tool-card-${item.id}`}
      onClick={() => onSelect(item)}
      className="group relative flex flex-col justify-between rounded-xl bg-[#0c1427]/80 hover:bg-[#101b35] border border-slate-800/80 hover:border-blue-700/60 p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-blue-950/20"
    >
      <div>
        {/* Card Header: Category, Provider & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-700/60 text-slate-300">
              <CategoryIcon category={item.category} className="w-3.5 h-3.5 text-blue-400" />
              <span className="capitalize">{item.category.replace('-', ' ')}</span>
            </span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[140px]">
              {item.provider}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <button
              id={`save-btn-${item.id}`}
              onClick={() => onToggleSave(item)}
              title={isSaved ? 'Remove from saved watchlist' : 'Save to watchlist'}
              aria-label={isSaved ? 'Remove from saved' : 'Save tool'}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-blue-500/30" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Tool Name & Capability Summary */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
              {item.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
          </div>
          <p className="mt-1.5 text-sm text-slate-300/90 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Capabilities Pills */}
        {item.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.capabilities.slice(0, 3).map((cap, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-900/90 text-slate-300 border border-slate-800/80"
              >
                {cap}
              </span>
            ))}
            {item.capabilities.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[11px] text-slate-300 bg-slate-900/50">
                +{item.capabilities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Badges & Source Transparency */}
      <div className="pt-3 border-t border-slate-800/70">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <FreeStatusBadge status={item.freeStatus} />
          <SourceTypeBadge type={item.sourceType} isCached={isCached} />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1 text-slate-300" title={`Release: ${formattedDate}`}>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[120px]">{formattedDate}</span>
          </span>
          <span className="text-[11px] text-slate-300" title={`Verified: ${item.lastVerifiedAt}`}>
            Checked {timeAgo(item.lastVerifiedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
