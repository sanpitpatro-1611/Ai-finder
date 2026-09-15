import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Layers,
  Search,
  Bookmark,
  Activity,
  Settings,
  ShieldCheck,
  Zap,
  Terminal,
  X
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'discover'
  | 'new-releases'
  | 'categories'
  | 'free-finder'
  | 'saved'
  | 'sources'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  savedCount: number;
  totalCount: number;
  freeCount: number;
  newReleaseCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenScout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  savedCount,
  totalCount,
  freeCount,
  newReleaseCount,
  isOpenMobile,
  onCloseMobile,
  onOpenScout,
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'discover',
      label: 'Live Discover',
      icon: Compass,
      badge: totalCount > 0 ? totalCount : undefined,
    },
    {
      id: 'new-releases',
      label: 'New Releases',
      icon: Sparkles,
      badge: newReleaseCount > 0 ? `${newReleaseCount} new` : undefined,
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Layers,
      badge: '10',
    },
    {
      id: 'free-finder',
      label: 'Free AI Finder',
      icon: Zap,
      badge: freeCount > 0 ? `${freeCount} free` : undefined,
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
    {
      id: 'saved',
      label: 'Saved Watchlist',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : undefined,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      id: 'sources',
      label: 'Sources & Health',
      icon: Activity,
      badge: 'Live',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleSelect = (id: NavigationTab) => {
    onTabChange(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#090f1d] border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/30 border border-blue-400/30">
                H
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  Hexavora <span className="text-blue-400 font-semibold">Tracker</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Discover what’s next in AI
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-600/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Scout AI Promo Card in Sidebar */}
        <div className="p-3 space-y-3">
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#0f1b36] to-[#0b1327] border border-blue-800/40 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-blue-600/30 text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white">Hexavora Scout</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Got questions on what can run locally on your PC or for free?
            </p>
            <button
              id="sidebar-scout-btn"
              onClick={onOpenScout}
              className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-950/40"
            >
              <span>Ask Scout AI</span>
              <Terminal className="w-3 h-3" />
            </button>
          </div>

          {/* Source Status Footer */}
          <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Live Feed Connected</span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
      </aside>
    </>
  );
};
