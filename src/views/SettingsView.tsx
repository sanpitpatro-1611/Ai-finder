import React, { useState } from 'react';
import {
  Settings,
  RefreshCw,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  Server
} from 'lucide-react';
import { NavigationTab } from '../components/Sidebar';

interface SettingsViewProps {
  savedCount: number;
  onClearSaved: () => void;
  onForceRefresh: () => void;
  isRefreshing: boolean;
  totalTracked: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  savedCount,
  onClearSaved,
  onForceRefresh,
  isRefreshing,
  totalTracked,
}) => {
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<string>('300');
  const [defaultTab, setDefaultTab] = useState<NavigationTab>('dashboard');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const handleClearSaved = () => {
    if (window.confirm('Are you sure you want to clear your saved tools watchlist?')) {
      onClearSaved();
      setNotificationStatus('Watchlist successfully cleared.');
      setTimeout(() => setNotificationStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 mb-1.5">
          <Settings className="w-3.5 h-3.5 text-blue-400" />
          <span>Local Configuration</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Customize your discovery feed display, auto-refresh cadence, and browser storage.
        </p>
      </div>

      {notificationStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationStatus}</span>
        </div>
      )}

      {/* Preferences Section */}
      <div className="p-5 rounded-2xl bg-[#0c1427]/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Feed & Sync Preferences
        </h3>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="font-semibold text-white block">Auto-Sync Cadence</span>
              <span className="text-slate-400 text-[11px]">
                Frequency of background checks for new models and releases
              </span>
            </div>
            <select
              value={autoRefreshInterval}
              onChange={e => setAutoRefreshInterval(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
            >
              <option value="0">Manual Only (No background sync)</option>
              <option value="300">Every 5 minutes (Recommended)</option>
              <option value="900">Every 15 minutes</option>
              <option value="1800">Every 30 minutes</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="font-semibold text-white block">Default Initial Screen</span>
              <span className="text-slate-400 text-[11px]">
                Which screen loads when launching the tracker
              </span>
            </div>
            <select
              value={defaultTab}
              onChange={e => setDefaultTab(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
            >
              <option value="dashboard">Dashboard</option>
              <option value="discover">Live Discovery Feed</option>
              <option value="new-releases">New Releases Timeline</option>
              <option value="free-finder">Free AI Finder</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="p-5 rounded-2xl bg-[#0c1427]/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Watchlist & Cache Storage
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-white block">Saved Tools in Local Storage</span>
            <span className="text-slate-400 text-[11px]">
              You currently have <strong className="text-blue-400">{savedCount} tools</strong> bookmarked locally.
            </span>
          </div>
          <button
            onClick={handleClearSaved}
            disabled={savedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-xs font-semibold text-rose-300 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Watchlist</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-white block">Ingestion Cache Reset</span>
            <span className="text-slate-400 text-[11px]">
              Force the server to invalidate memory cache and re-query Hugging Face, GitHub, and RSS.
            </span>
          </div>
          <button
            onClick={onForceRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Re-syncing...' : 'Clear Server Cache'}</span>
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="p-5 rounded-2xl bg-[#091022] border border-slate-800/80 space-y-3 text-xs">
        <h4 className="font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-400" />
          Hexavora Engine Specifications
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-400">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Engine</span>
            <span className="font-mono text-slate-200">v2.4.0-live</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Grounded AI</span>
            <span className="font-mono text-slate-200">Gemini 3.8 Flash</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Data Architecture</span>
            <span className="font-mono text-slate-200">Proxy + RSS + Cache</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Port & Host</span>
            <span className="font-mono text-slate-200">0.0.0.0:3000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
