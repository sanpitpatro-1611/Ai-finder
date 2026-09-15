import React, { useState } from 'react';
import { AITrackerItem } from '../types';
import { FreeStatusBadge, SourceTypeBadge, VerificationBadge } from './Badges';
import { CategoryIcon } from './CategoryIcon';
import {
  X,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  Terminal,
  Clock,
  Shield,
  Copy,
  Check,
  Zap,
  Info
} from 'lucide-react';

interface ToolDetailModalProps {
  item: AITrackerItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (item: AITrackerItem) => void;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
  item,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.officialUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate actionable "Who it is useful for" dynamically based on category & capabilities
  const getUsefulFor = () => {
    switch (item.category) {
      case 'image':
        return 'Digital artists, game developers, UI designers, and creators seeking commercial-grade visuals without recurring SaaS fees.';
      case 'video':
        return 'Animators, video editors, social media creators, and motion designers seeking generative b-roll and AI video synthesis.';
      case 'audio':
        return 'Podcasters, transcriptionists, musicians, and developers integrating multilingual voice models.';
      case 'coding':
        return 'Software engineers, DevOps developers, and programmers seeking offline or private code assistance.';
      case 'website-builder':
        return 'Frontend engineers, founders, and growth marketers prototyping responsive web applications and landing pages.';
      case 'app-builder':
        return 'Full-stack developers and solopreneurs building prototypes and database-backed web applications.';
      case 'local-ai':
        return 'Privacy-focused users, local hardware enthusiasts, and teams requiring strict air-gapped LLM inference on PC/Mac.';
      case 'research':
        return 'AI researchers, STEM students, data scientists, and academics evaluating frontier benchmarks and model weights.';
      case 'design':
        return 'Graphic designers, UX specialists, and branding agencies creating scalable vectors and UI layouts.';
      case 'productivity':
      default:
        return 'Knowledge workers, product managers, and automated workflow builders optimizing repetitive digital tasks.';
    }
  };

  return (
    <div
      id="tool-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="tool-detail-modal-card"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0b1325] border border-slate-700/80 rounded-2xl shadow-2xl shadow-blue-950/40 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-800 bg-[#0e172e]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300">
                <CategoryIcon category={item.category} className="w-3.5 h-3.5 text-blue-400" />
                <span className="capitalize">{item.category.replace('-', ' ')}</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">by {item.provider}</span>
              <SourceTypeBadge type={item.sourceType} />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {item.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="detail-save-btn"
              onClick={() => onToggleSave(item)}
              className={`p-2 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save to watchlist'}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5 fill-blue-500/30" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button
              id="detail-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Overview
            </h4>
            <p className="text-slate-200 text-base leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Pricing & Free Access Breakdown */}
          <div className="p-4 rounded-xl bg-[#070d1c] border border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Verified Free & Access Status
              </span>
              <FreeStatusBadge status={item.freeStatus} size="md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-slate-500">Access Method:</span>{' '}
                <span className="font-semibold text-slate-200 uppercase">{item.accessType}</span>
              </div>
              <div>
                <span className="text-slate-500">Open Source Code/Weights:</span>{' '}
                <span className="font-semibold text-slate-200">{item.openSource ? 'Yes (Public weights/repo)' : 'No (Proprietary service)'}</span>
              </div>
              <div>
                <span className="text-slate-500">Self-Hostable:</span>{' '}
                <span className="font-semibold text-slate-200">{item.selfHosted ? 'Yes (Local hardware supported)' : 'No (Cloud service only)'}</span>
              </div>
              {item.license && (
                <div>
                  <span className="text-slate-500">License:</span>{' '}
                  <span className="font-semibold text-slate-200">{item.license}</span>
                </div>
              )}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Verified Capabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {item.capabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200 text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Who it is useful for */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Who It Is Useful For
            </h4>
            <p className="text-slate-300 leading-relaxed text-sm bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
              {getUsefulFor()}
            </p>
          </div>

          {/* Release / What Changed / Why It Matters */}
          {(item.whatChanged || item.whyItMatters) && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Release & Update Timeline
              </h4>

              <div className="space-y-2 text-xs">
                <div className="text-slate-300">
                  <span className="text-slate-500 font-medium">Release Date:</span>{' '}
                  <span className="font-semibold text-white">{item.releaseDate}</span>
                </div>
                {item.whatChanged && (
                  <div>
                    <span className="text-slate-500 font-medium">What Changed:</span>{' '}
                    <p className="text-slate-200 mt-0.5 font-normal leading-relaxed">{item.whatChanged}</p>
                  </div>
                )}
                {item.whyItMatters && (
                  <div>
                    <span className="text-slate-500 font-medium">Why It Matters:</span>{' '}
                    <p className="text-blue-300 mt-0.5 font-normal leading-relaxed">{item.whyItMatters}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Limitations */}
          {item.limitations.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Known Limitations & Requirements
              </h4>
              <ul className="space-y-1.5">
                {item.limitations.map((lim, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-amber-200/90 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-lg"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Audit Trail */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <VerificationBadge status={item.verificationStatus} />
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Verified at: {new Date(item.lastVerifiedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Footer: Action Links */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0e172e] flex items-center justify-between gap-3 flex-wrap">
          <button
            id="detail-copy-link-btn"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied' : 'Copy Official Link'}</span>
          </button>

          <div className="flex items-center gap-2">
            {item.sourceUrl && item.sourceUrl !== item.officialUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <Terminal className="w-4 h-4 text-slate-400" />
                <span>{item.sourceName}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}

            <a
              id="detail-visit-btn"
              href={item.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors shadow-md shadow-blue-900/30"
            >
              <span>Visit Official Site</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
