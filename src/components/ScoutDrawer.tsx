import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { ScoutMessage, AITrackerItem } from '../types';
import {
  Sparkles,
  Send,
  X,
  RefreshCw,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Bot,
  User,
  Zap,
  HelpCircle
} from 'lucide-react';

interface ScoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trackedItems: AITrackerItem[];
  onSelectTool: (tool: AITrackerItem) => void;
}

const DEFAULT_PROMPTS = [
  'Which free image models were released recently?',
  'Compare website builders v0 vs Bolt.new',
  'Which tools are verified 100% open source?',
  'Show local AI models I can run on my PC with Ollama',
  'Find an AI tool for making videos with a free tier',
];

export const ScoutDrawer: React.FC<ScoutDrawerProps> = ({
  isOpen,
  onClose,
  trackedItems,
  onSelectTool,
}) => {
  const [messages, setMessages] = useState<ScoutMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **Hexavora Scout**, your verified AI discovery specialist.

I am grounded directly on the **${trackedItems.length} active AI models, tools, and runtimes** in Hexavora's live tracker.

Ask me about:
* **Verified Free & Open Source**: What can you run locally or for zero cost?
* **Pricing Nuances**: True differences between Free vs. Limited Free Tiers.
* **Direct Comparisons**: Specs, licenses, and access methods across models.`,
      timestamp: new Date().toISOString(),
      suggestedPrompts: DEFAULT_PROMPTS,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ScoutMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/scout/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ScoutMessage = {
        id: `scout-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I couldn't find verified data matching your inquiry.",
        timestamp: new Date().toISOString(),
        referencedToolIds: data.referencedToolIds || [],
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ScoutMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, an error occurred while analyzing the tracked dataset: ${err?.message || 'Network error'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="scout-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="scout-drawer-panel"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg h-full bg-[#0a1020] border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/90 bg-[#0e172e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">Hexavora Scout</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/50">
                  Grounded AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live reasoning over {trackedItems.length} verified records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="scout-clear-btn"
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome-reset',
                    role: 'assistant',
                    content: `Conversation refreshed. How can I assist your discovery across the **${trackedItems.length} tracked tools**?`,
                    timestamp: new Date().toISOString(),
                    suggestedPrompts: DEFAULT_PROMPTS,
                  },
                ]);
              }}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="scout-close-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            const referencedTools = (msg.referencedToolIds || [])
              .map(id => trackedItems.find(t => t.id === id))
              .filter((t): t is AITrackerItem => Boolean(t));

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 border border-slate-700 text-blue-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 ${
                    isUser
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                      : 'bg-[#0f182c] border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                  }`}
                >
                  <div className="markdown-body prose prose-invert prose-sm max-w-none text-xs sm:text-sm leading-relaxed">
                    <Markdown>{msg.content}</Markdown>
                  </div>

                  {/* Referenced Clickable Tool Chips */}
                  {referencedTools.length > 0 && (
                    <div className="pt-2.5 mt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Direct Tracker Links:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {referencedTools.map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => onSelectTool(tool)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 hover:bg-blue-900/40 border border-slate-700/80 hover:border-blue-500 text-blue-300 transition-colors"
                          >
                            <span>{tool.name}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompt Suggestions */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-800/60 space-y-1.5">
                      <span className="text-[11px] text-slate-400 font-medium block">
                        Quick suggestions:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {msg.suggestedPrompts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(p)}
                            className="text-left text-xs text-slate-300 hover:text-white p-2 rounded-lg bg-slate-900/60 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-700/50 transition-colors flex items-center justify-between"
                          >
                            <span className="line-clamp-1">{p}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-blue-400">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#0f182c] border border-slate-800 rounded-xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Scouting verified tracker dataset...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800/90 bg-[#0e172e]">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="scout-input-field"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about free models, local runtimes, tools..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              id="scout-submit-btn"
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-colors shrink-0"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-500 text-center mt-2">
            Scout only reasons from live verified data. It never invents release dates or pricing.
          </p>
        </div>
      </div>
    </div>
  );
};
