import React from 'react';
import { AITrackerItem } from '../types';
import { ToolCard } from '../components/ToolCard';
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  Download,
  Share2,
  ExternalLink,
  Compass
} from 'lucide-react';
import { NavigationTab } from '../components/Sidebar';

interface SavedViewProps {
  items: AITrackerItem[];
  savedIds: Set<string>;
  onToggleSave: (item: AITrackerItem) => void;
  onClearSaved: () => void;
  onSelectTool: (item: AITrackerItem) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  isCached: boolean;
}

export const SavedView: React.FC<SavedViewProps> = ({
  items,
  savedIds,
  onToggleSave,
  onClearSaved,
  onSelectTool,
  onNavigateTab,
  isCached,
}) => {
  const savedItems = items.filter(item => savedIds.has(item.id));

  const handleExportJSON = () => {
    const exportData = savedItems.map(i => ({
      name: i.name,
      provider: i.provider,
      category: i.category,
      freeStatus: i.freeStatus,
      officialUrl: i.officialUrl,
      sourceUrl: i.sourceUrl,
      capabilities: i.capabilities,
      limitations: i.limitations,
      dateSaved: new Date().toISOString(),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hexavora-saved-tools-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    let md = `# Hexavora AI Tracker - Saved Watchlist\n\n`;
    md += `Exported on: ${new Date().toLocaleString()}\nTotal tools: ${savedItems.length}\n\n`;

    savedItems.forEach(i => {
      md += `### [${i.name}](${i.officialUrl})\n`;
      md += `- **Provider**: ${i.provider}\n`;
      md += `- **Category**: ${i.category}\n`;
      md += `- **Pricing Status**: ${i.freeStatus}\n`;
      md += `- **Open Source**: ${i.openSource ? 'Yes' : 'No'}\n`;
      md += `- **Description**: ${i.description}\n`;
      md += `- **Capabilities**: ${i.capabilities.join(', ')}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hexavora-saved-tools-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/80 border border-amber-600/40 text-amber-300 mb-1.5">
            <Bookmark className="w-3.5 h-3.5 fill-amber-500/30" />
            <span>Local Browser Watchlist</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Saved AI Models & Tools ({savedItems.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Persisted securely in your browser’s local storage. No account or login required.
          </p>
        </div>

        {savedItems.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Markdown</span>
            </button>
            <button
              onClick={onClearSaved}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-xs font-semibold text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {savedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedItems.map(item => (
            <ToolCard
              key={item.id}
              item={item}
              isSaved={true}
              onToggleSave={onToggleSave}
              onSelect={onSelectTool}
              isCached={isCached}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-[#0a1122] border border-slate-800 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Your watchlist is currently empty</h3>
            <p className="text-xs text-slate-400">
              Bookmark any AI model or tool from the live feed to track its status and access links here.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('discover')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-blue-950/40"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Tools to Save</span>
          </button>
        </div>
      )}
    </div>
  );
};
