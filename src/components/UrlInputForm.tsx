'use client';

import React, { useState } from 'react';
import { Globe, ArrowRight, Loader2, Clipboard, X, BookOpen, ListOrdered, Briefcase, FileText } from 'lucide-react';
import { SummaryMode } from '@/types/scraper';

interface UrlInputFormProps {
  onSubmit: (url: string, mode: SummaryMode) => void;
  isLoading: boolean;
}

const SAMPLE_URLS = [
  {
    label: 'Wikipedia: Web Scraping',
    url: 'https://en.wikipedia.org/wiki/Web_scraping',
    category: 'Tech Concept',
  },
  {
    label: 'Wikipedia: Artificial Intelligence',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    category: 'Science',
  },
  {
    label: 'MDN: How the Web Works',
    url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work',
    category: 'Documentation',
  },
  {
    label: 'BBC: Deep Sea Mysteries',
    url: 'https://www.bbc.com/future/article/20230215-the-mysteries-of-the-deep-ocean-trenches',
    category: 'Article',
  },
];

const MODES: { id: SummaryMode; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'comprehensive',
    label: 'Comprehensive',
    icon: <FileText className="h-3.5 w-3.5" />,
    desc: 'Balanced narrative summary with context',
  },
  {
    id: 'bullet-points',
    label: 'Key Takeaways',
    icon: <ListOrdered className="h-3.5 w-3.5" />,
    desc: 'Laser-focused bullet points and stats',
  },
  {
    id: 'executive',
    label: 'Executive TL;DR',
    icon: <Briefcase className="h-3.5 w-3.5" />,
    desc: 'High-level briefing for decision makers',
  },
  {
    id: 'deep-dive',
    label: 'Deep Dive',
    icon: <BookOpen className="h-3.5 w-3.5" />,
    desc: 'In-depth analysis of implications and nuances',
  },
];

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [selectedMode, setSelectedMode] = useState<SummaryMode>('comprehensive');
  const [inputError, setInputError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setInputError('Please enter a valid webpage URL.');
      return;
    }
    setInputError('');
    onSubmit(cleanUrl, selectedMode);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setInputError('');
      }
    } catch {
      // Clipboard access denied or unsupported
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setInputError('');
  };

  return (
    <div className="w-full">
      {/* Form Card */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/90 p-2 sm:p-2.5 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl transition-all focus-within:border-indigo-500/80 focus-within:ring-4 focus-within:ring-indigo-500/10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Input with Icon */}
            <div className="relative flex flex-1 items-center">
              <div className="pointer-events-none pl-3 text-slate-400">
                <Globe className="h-5 w-5 text-indigo-400 transition-colors group-focus-within:text-indigo-300" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (inputError) setInputError('');
                }}
                disabled={isLoading}
                placeholder="Paste any webpage URL (e.g., https://en.wikipedia.org/...)"
                className="w-full bg-transparent py-3 pl-3 pr-16 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />

              {/* Paste & Clear action buttons inside input */}
              <div className="absolute right-2 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    disabled={isLoading}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    title="Clear input"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    disabled={isLoading}
                    className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-850 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="h-3 w-3" />
                    <span>Paste</span>
                  </button>
                )}
              </div>
            </div>

            {/* Summarize Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-purple-500 hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scraping...</span>
                </>
              ) : (
                <>
                  <span>Summarize</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {inputError && (
          <p className="mt-2 text-xs font-medium text-rose-400 pl-1">{inputError}</p>
        )}
      </form>

      {/* Mode Selector */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400 mr-1">Summary Mode:</span>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setSelectedMode(mode.id)}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              selectedMode === mode.id
                ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200 shadow-sm shadow-indigo-500/20'
                : 'border-slate-800/80 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
            title={mode.desc}
          >
            {mode.icon}
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Sample Links */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1">Try Samples:</span>
        {SAMPLE_URLS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample.url)}
            disabled={isLoading}
            className="rounded-lg border border-slate-800/60 bg-slate-900/40 px-2.5 py-1 text-xs text-slate-400 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all truncate max-w-[220px]"
            title={sample.url}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
};
