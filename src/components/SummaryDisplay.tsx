'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ExternalLink,
  Copy,
  Check,
  Download,
  Clock,
  FileText,
  Percent,
  Cpu,
  Sparkles,
  CheckCircle2,
  Tag,
  Eye,
  FileCode,
} from 'lucide-react';
import { SummaryResult } from '@/types/scraper';

interface SummaryDisplayProps {
  data: SummaryResult;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ data }) => {
  const [copiedType, setCopiedType] = useState<'text' | 'markdown' | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

  const handleCopy = async (type: 'text' | 'markdown') => {
    let contentToCopy = '';
    if (type === 'markdown') {
      contentToCopy = `# ${data.title}\nSource: ${data.url}\n\n## TL;DR\n${data.tldr}\n\n## Key Takeaways\n${data.keyTakeaways
        .map((k) => `- ${k}`)
        .join('\n')}\n\n## Full Summary\n${data.summary}`;
    } else {
      contentToCopy = `${data.title}\nSource: ${data.url}\n\nTL;DR: ${data.tldr}\n\nKey Takeaways:\n${data.keyTakeaways
        .map((k) => `• ${k}`)
        .join('\n')}\n\nSummary:\n${data.summary.replace(/[#*`]/g, '')}`;
    }

    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Clipboard write failed
    }
  };

  const handleDownload = () => {
    const textContent = `PAGE TITLE: ${data.title}\nSOURCE URL: ${data.url}\nDATE: ${data.scrapedAt}\n\n=== TL;DR ===\n${data.tldr}\n\n=== KEY TAKEAWAYS ===\n${data.keyTakeaways
      .map((k, i) => `${i + 1}. ${k}`)
      .join('\n')}\n\n=== FULL SUMMARY ===\n${data.summary}\n`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `summary-${data.siteName || 'webpage'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Metadata Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            {/* Site domain & favicon */}
            <div className="flex items-center gap-2">
              {data.favicon && (
                <img
                  src={data.favicon}
                  alt={data.siteName}
                  className="h-4 w-4 rounded-sm object-contain"
                  onError={(e) => {
                    // Hide broken image
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {data.siteName}
              </span>
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
                title="Visit original article"
              >
                <span>Visit site</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {data.title}
            </h2>

            {data.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {data.description}
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy('text')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-850 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              title="Copy plain text summary"
            >
              {copiedType === 'text' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopy('markdown')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-850 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              title="Copy markdown formatted summary"
            >
              {copiedType === 'markdown' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-850 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              title="Download as text file"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span>Original Words</span>
            </div>
            <div className="mt-1 text-base font-semibold text-white">
              {data.stats.originalWordCount.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Reading Time</span>
            </div>
            <div className="mt-1 text-base font-semibold text-white">
              ~{data.stats.summaryReadTime}m{' '}
              <span className="text-xs text-slate-400 font-normal">
                (was ~{data.stats.originalReadTime}m)
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Percent className="h-3.5 w-3.5 text-cyan-400" />
              <span>Condensed By</span>
            </div>
            <div className="mt-1 text-base font-semibold text-white">
              {data.stats.reductionPercentage}%
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
              <span>AI Engine</span>
            </div>
            <div className="mt-1 text-xs font-semibold text-white truncate" title={data.modelUsed}>
              {data.modelUsed || 'Gemini Flash'}
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'summary'
              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Summary & Takeaways</span>
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'raw'
              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Extracted Raw Text Preview</span>
        </button>
      </div>

      {activeTab === 'summary' ? (
        <div className="space-y-6">
          {/* TL;DR Highlight Card */}
          {data.tldr && (
            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Executive TL;DR
                </span>
              </div>
              <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                {data.tldr}
              </p>
            </div>
          )}

          {/* Key Takeaways */}
          {data.keyTakeaways && data.keyTakeaways.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Key Insights & Takeaways</span>
              </h3>
              <ul className="space-y-3">
                {data.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-200 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comprehensive Narrative Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Full Narrative Summary</span>
            </h3>

            <div className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm leading-relaxed space-y-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {data.summary}
              </ReactMarkdown>
            </div>
          </div>

          {/* Topics & Tags */}
          {data.topics && data.topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
                <Tag className="h-3 w-3" />
                <span>Topics:</span>
              </span>
              {data.topics.map((topic, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300 shadow-sm"
                >
                  #{topic}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Raw Scraped Text Inspector */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileCode className="h-4 w-4 text-indigo-400" />
              <span>Extracted Clean Text from Webpage</span>
            </h3>
            <span className="text-xs text-slate-500">
              Showing first 1,500 characters
            </span>
          </div>
          <p className="text-xs text-slate-400">
            This is the sanitized text scraped by the backend before being processed by the AI model.
          </p>
          <pre className="mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
            {data.scrapedTextPreview}
          </pre>
        </div>
      )}
    </div>
  );
};
