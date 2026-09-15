import React from 'react';
import {
  Menu,
  Sparkles,
  RefreshCw,
  Bookmark,
  Search,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface NavbarProps {
  currentTab: NavigationTab;
  onOpenMobileMenu: () => void;
  onOpenScout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalCount: number;
  liveCount: number;
  isCached: boolean;
  cacheAgeSeconds: number;
  savedCount: number;
  onOpenSaved: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileMenu,
  onOpenScout,
  onRefresh,
  isRefreshing,
  totalCount,
  liveCount,
  isCached,
  cacheAgeSeconds,
  savedCount,
  onOpenSaved,
  searchQuery,
  onSearchChange,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'discover':
        return 'Live Discovery Feed';
      case 'new-releases':
        return 'New Releases & Announcements';
      case 'categories':
        return 'Explore 10 AI Categories';
      case 'free-finder':
        return 'Free AI Finder';
      case 'saved':
        return 'Saved Watchlist';
      case 'sources':
        return 'Data Health & Transparency';
      case 'settings':
        return 'Settings & Preferences';
      default:
        return 'Hexavora AI Tracker';
    }
  };

  return (
    <header
      id="app-navbar"
      className="sticky top-0 z-30 h-16 bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-3"
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-nav-toggle"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {getTabTitle()}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>{totalCount} total verified tools</span>
            <span>•</span>
            <span className="text-blue-400 font-medium">{liveCount} live API items</span>
          </div>
        </div>
      </div>

      {/* Center/Search Quick Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="navbar-search-input"
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search models, tools, or providers..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/70 transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Status indicator pill */}
        <div
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400"
          title={isCached ? `Cached data (${cacheAgeSeconds}s old)` : 'Fresh live data'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isCached ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
          <span>{isCached ? `Cached (${cacheAgeSeconds}s)` : 'Live Stream'}</span>
        </div>

        {/* Refresh Data Button */}
        <button
          id="navbar-refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Force fresh check of Hugging Face, GitHub, and RSS feeds"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Checking...' : 'Refresh'}</span>
        </button>

        {/* Scout AI Button */}
        <button
          id="navbar-scout-btn"
          onClick={onOpenScout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-blue-950/40 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scout AI</span>
        </button>

        {/* Watchlist Bookmark Icon */}
        <button
          id="navbar-saved-btn"
          onClick={onOpenSaved}
          title="Open Saved Watchlist"
          className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
          aria-label="Open saved watchlist"
        >
          <Bookmark className="w-4 h-4" />
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
