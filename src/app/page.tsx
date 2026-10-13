'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { UrlInputForm } from '@/components/UrlInputForm';
import { LoadingSteps } from '@/components/LoadingSteps';
import { SummaryDisplay } from '@/components/SummaryDisplay';
import { ErrorCard } from '@/components/ErrorCard';
import { RecentHistory } from '@/components/RecentHistory';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { ApiResponse, SummaryMode, SummaryResult } from '@/types/scraper';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const GithubIcon = ({ className = 'h-3.5 w-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);


export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | undefined>(undefined);
  const [lastSubmittedUrl, setLastSubmittedUrl] = useState<string>('');
  const [lastSubmittedMode, setLastSubmittedMode] = useState<SummaryMode>('comprehensive');

  // API Key & Backend status
  const [hasServerKey, setHasServerKey] = useState<boolean>(true);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // History state
  const [history, setHistory] = useState<SummaryResult[]>([]);

  // Load client settings and history from localStorage
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('scrapepulse_gemini_key') || '';
      setCustomApiKey(storedKey);

      const storedHistory = localStorage.getItem('scrapepulse_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch {
      // LocalStorage access restricted
    }

    // Check backend health
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasServerKey === 'boolean') {
          setHasServerKey(data.hasServerKey);
        }
      })
      .catch(() => {
        // Fallback
      });
  }, []);

  const handleSaveCustomKey = (key: string) => {
    setCustomApiKey(key);
    try {
      if (key) {
        localStorage.setItem('scrapepulse_gemini_key', key);
      } else {
        localStorage.removeItem('scrapepulse_gemini_key');
      }
    } catch {
      // LocalStorage access restricted
    }
  };

  const saveToHistory = (item: SummaryResult) => {
    setHistory((prev) => {
      // Deduplicate by URL
      const filtered = prev.filter((p) => p.url !== item.url);
      const updated = [item, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('scrapepulse_history', JSON.stringify(updated));
      } catch {
        // LocalStorage access restricted
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('scrapepulse_history');
    } catch {
      // LocalStorage access restricted
    }
  };

  const handleSummarize = async (url: string, mode: SummaryMode) => {
    setIsLoading(true);
    setError(null);
    setErrorDetails(undefined);
    setLastSubmittedUrl(url);
    setLastSubmittedMode(mode);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          mode,
          customApiKey: customApiKey || undefined,
        }),
      });

      const json: ApiResponse<SummaryResult> = await response.json();

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || `Server returned error (${response.status})`);
      }

      setCurrentResult(json.data);
      saveToHistory(json.data);

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-600/10 blur-[130px]" />
        <div className="absolute top-[40%] -left-40 h-[400px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-40 h-[400px] w-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={Boolean(hasServerKey || customApiKey)}
        isCustomKey={Boolean(customApiKey)}
      />

      <main className="relative z-10 flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl space-y-10">
          {/* Hero Section */}
          <section className="text-center space-y-4 pt-2 sm:pt-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Full-Stack AI Web Scraper & Summarizer</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Scrape Any Webpage.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Summarize with AI.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
              Paste any article, blog post, or documentation URL. We scrape the HTML text with Cheerio,
              remove clutter, and synthesize a clean executive summary in seconds with Google Gemini.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Instant Scraping</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                <span>Free Gemini API</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>SSRF Safe</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1">
                <Layers className="h-3.5 w-3.5 text-purple-400" />
                <span>Markdown & Export</span>
              </span>
            </div>
          </section>

          {/* URL Input Form */}
          <section>
            <UrlInputForm onSubmit={handleSummarize} isLoading={isLoading} />
          </section>

          {/* Loading Animation */}
          {isLoading && (
            <section>
              <LoadingSteps />
            </section>
          )}

          {/* Error Message */}
          {error && !isLoading && (
            <section>
              <ErrorCard
                error={error}
                details={errorDetails}
                onRetry={() => handleSummarize(lastSubmittedUrl, lastSubmittedMode)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </section>
          )}

          {/* Summary Results Section */}
          {currentResult && !isLoading && (
            <section id="results-section">
              <SummaryDisplay data={currentResult} />
            </section>
          )}

          {/* Recent History */}
          {!isLoading && history.length > 0 && (
            <section>
              <RecentHistory
                history={history}
                onSelect={(item) => setCurrentResult(item)}
                onClear={handleClearHistory}
              />
            </section>
          )}

          {/* Technical Workflow & Architecture Cards */}
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <h3 className="text-base font-semibold text-white">How This Full-Stack Scraper Works</h3>
              <p className="text-xs text-slate-400 mt-1">
                A streamlined, zero-overhead pipeline designed for speed, safety, and accuracy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                  01
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Cheerio DOM Extraction</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The backend performs a safe HTTP GET, validates against SSRF vulnerabilities, and parses raw HTML using Cheerio.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 font-bold text-xs">
                  02
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Noise Removal & Filtering</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Navigation menus, footers, ad blocks, social widgets, and scripts are stripped away to isolate core article prose.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                  03
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Gemini AI Synthesis</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Google Gemini Flash processes the extracted text, structuring an executive TL;DR, key takeaways, and markdown summary.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ScrapePulse AI</span>
            <span>•</span>
            <span>Built with Next.js, Cheerio & Google Gemini API</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              Google AI Studio
            </a>
            <span>•</span>
            <a
              href="https://github.com/yashk230/ai-web-scraper"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <GithubIcon className="h-3 w-3" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        customApiKey={customApiKey}
        onSaveKey={handleSaveCustomKey}
        hasServerKey={hasServerKey}
      />
    </div>
  );
}
