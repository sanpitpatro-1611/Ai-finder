import React, { useState, useEffect, useCallback } from 'react';
import { AITrackerItem, SourceHealth, AICategory } from './types';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToolDetailModal } from './components/ToolDetailModal';
import { ScoutDrawer } from './components/ScoutDrawer';
import { DashboardView } from './views/DashboardView';
import { DiscoverView } from './views/DiscoverView';
import { NewReleasesView } from './views/NewReleasesView';
import { CategoriesView } from './views/CategoriesView';
import { FreeFinderView } from './views/FreeFinderView';
import { SavedView } from './views/SavedView';
import { DataHealthView } from './views/DataHealthView';
import { SettingsView } from './views/SettingsView';
import { RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

const STORAGE_KEY_SAVED = 'hexavora_saved_tools_ids';

export default function App() {
  const [items, setItems] = useState<AITrackerItem[]>([]);
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [cacheAgeSeconds, setCacheAgeSeconds] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [targetCategory, setTargetCategory] = useState<AICategory>('image');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [selectedTool, setSelectedTool] = useState<AITrackerItem | null>(null);
  const [isScoutOpen, setIsScoutOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Saved Watchlist State
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  // Persist saved IDs
  const persistSavedIds = (newSet: Set<string>) => {
    setSavedIds(newSet);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(Array.from(newSet)));
    } catch {
      // ignore
    }
  };

  const handleToggleSave = useCallback((tool: AITrackerItem) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(tool.id)) {
        next.delete(tool.id);
      } else {
        next.add(tool.id);
      }
      try {
        localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const handleClearSaved = useCallback(() => {
    persistSavedIds(new Set<string>());
  }, []);

  // Fetch tracker data from backend
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const url = forceRefresh ? '/api/tracker/data?forceRefresh=true' : '/api/tracker/data';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Tracker API responded with status ${res.status}`);
      }
      const data = await res.json();
      setItems(data.items || []);
      setSources(data.sources || []);
      setIsCached(data.isCached || false);
      setCacheAgeSeconds(data.cacheAgeSeconds || 0);
      setLastRefreshed(data.lastRefreshed || new Date().toISOString());
      setHasGeminiKey(data.hasGeminiKey !== false);
    } catch (err: any) {
      console.error('Failed to load tracker data:', err);
      setError(err?.message || 'Failed to fetch live AI tracker data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigate to category
  const handleSelectCategory = (catId: string) => {
    setTargetCategory(catId as AICategory);
    setCurrentTab('categories');
  };

  // Metrics for badges
  const freeCount = items.filter(i => i.freeStatus === 'free' || i.freeStatus === 'open-source' || i.freeStatus === 'free-tier').length;
  const newReleaseCount = items.filter(i => i.releaseDate && i.releaseDate !== 'Release date not verified').length;
  const liveCount = items.filter(i => i.sourceType !== 'curated-baseline').length;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        savedCount={savedIds.size}
        totalCount={items.length}
        freeCount={freeCount}
        newReleaseCount={newReleaseCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenScout={() => setIsScoutOpen(true)}
      />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Navbar */}
        <Navbar
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenScout={() => setIsScoutOpen(true)}
          onRefresh={() => fetchData(true)}
          isRefreshing={isRefreshing}
          totalCount={items.length}
          liveCount={liveCount}
          isCached={isCached}
          cacheAgeSeconds={cacheAgeSeconds}
          savedCount={savedIds.size}
          onOpenSaved={() => setCurrentTab('saved')}
          searchQuery={searchQuery}
          onSearchChange={q => {
            setSearchQuery(q);
            if (currentTab !== 'discover') {
              setCurrentTab('discover');
            }
          }}
        />

        {/* Content Area */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading && items.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Connecting to live AI sources...</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Querying Hugging Face Hub, GitHub Official Releases, and verified announcement feeds.
                </p>
              </div>
            </div>
          ) : error && items.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-600/40 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Data Ingestion Failed</h3>
                <p className="text-xs text-slate-400">{error}</p>
              </div>
              <button
                onClick={() => fetchData(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
              >
                Retry Live Ingestion
              </button>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  items={items}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                  onSelectTool={setSelectedTool}
                  onNavigateTab={setCurrentTab}
                  onSelectCategory={handleSelectCategory}
                  onOpenScout={() => setIsScoutOpen(true)}
                  isCached={isCached}
                  onRefresh={() => fetchData(true)}
                  isRefreshing={isRefreshing}
                />
              )}

              {currentTab === 'discover' && (
                <DiscoverView
                  items={items}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                  onSelectTool={setSelectedTool}
                  isCached={isCached}
                  onRefresh={() => fetchData(true)}
                  isRefreshing={isRefreshing}
                />
              )}

              {currentTab === 'new-releases' && (
                <NewReleasesView
                  items={items}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                  onSelectTool={setSelectedTool}
                  isCached={isCached}
                />
              )}

              {currentTab === 'categories' && (
                <CategoriesView
                  items={items}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                  onSelectTool={setSelectedTool}
                  isCached={isCached}
                  selectedCategory={targetCategory}
                  onCategoryChange={setTargetCategory}
                />
              )}

              {currentTab === 'free-finder' && (
                <FreeFinderView
                  items={items}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                  onSelectTool={setSelectedTool}
                  isCached={isCached}
                />
              )}

              {currentTab === 'saved' && (
                <SavedView
                  items={items}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                  onClearSaved={handleClearSaved}
                  onSelectTool={setSelectedTool}
                  onNavigateTab={setCurrentTab}
                  isCached={isCached}
                />
              )}

              {currentTab === 'sources' && (
                <DataHealthView
                  sources={sources}
                  isCached={isCached}
                  cacheAgeSeconds={cacheAgeSeconds}
                  lastRefreshed={lastRefreshed}
                  totalTracked={items.length}
                  onForceRefresh={() => fetchData(true)}
                  isRefreshing={isRefreshing}
                  hasGeminiKey={hasGeminiKey}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  savedCount={savedIds.size}
                  onClearSaved={handleClearSaved}
                  onForceRefresh={() => fetchData(true)}
                  isRefreshing={isRefreshing}
                  totalTracked={items.length}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Tool Detail Modal */}
      <ToolDetailModal
        item={selectedTool}
        onClose={() => setSelectedTool(null)}
        isSaved={selectedTool ? savedIds.has(selectedTool.id) : false}
        onToggleSave={handleToggleSave}
      />

      {/* Hexavora Scout AI Assistant Drawer */}
      <ScoutDrawer
        isOpen={isScoutOpen}
        onClose={() => setIsScoutOpen(false)}
        trackedItems={items}
        onSelectTool={tool => {
          setSelectedTool(tool);
          setIsScoutOpen(false);
        }}
      />
    </div>
  );
}
