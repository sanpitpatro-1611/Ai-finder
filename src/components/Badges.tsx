import React from 'react';
import { FreeStatus, SourceType, VerificationStatus } from '../types';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, Sparkles, Terminal, Globe } from 'lucide-react';

export const FreeStatusBadge: React.FC<{ status: FreeStatus; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  switch (status) {
    case 'free':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Free
        </span>
      );
    case 'open-source':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Open source
        </span>
      );
    case 'free-tier':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          Free tier
        </span>
      );
    case 'free-credits':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Free credits
        </span>
      );
    case 'self-hosted':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 ${sizeClasses}`}>
          <Terminal className="w-3 h-3 text-indigo-400" />
          Self-hosted
        </span>
      );
    case 'paid':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 ${sizeClasses}`}>
          Paid
        </span>
      );
    case 'pricing-unverified':
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 ${sizeClasses}`}>
          Pricing unverified
        </span>
      );
  }
};

export const SourceTypeBadge: React.FC<{ type: SourceType; isCached?: boolean }> = ({ type, isCached }) => {
  if (isCached) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
        <Clock className="w-3 h-3 text-slate-400" />
        Cached
      </span>
    );
  }

  switch (type) {
    case 'live-api':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950/80 text-blue-300 border border-blue-600/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          Live source
        </span>
      );
    case 'github':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
          <Terminal className="w-3 h-3 text-indigo-400" />
          GitHub Release
        </span>
      );
    case 'rss':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-500/30">
          <Globe className="w-3 h-3 text-amber-400" />
          Official Feed
        </span>
      );
    case 'curated-baseline':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900 text-slate-300 border border-slate-700">
          <ShieldCheck className="w-3 h-3 text-slate-400" />
          Curated Baseline
        </span>
      );
  }
};

export const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Verified source
      </span>
    );
  }
  if (status === 'community-reported') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
        <AlertCircle className="w-3.5 h-3.5" />
        Community reported
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
      <Clock className="w-3.5 h-3.5" />
      Pending check
    </span>
  );
};
