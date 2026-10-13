'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Key, ExternalLink } from 'lucide-react';

interface ErrorCardProps {
  error: string;
  details?: string;
  onRetry: () => void;
  onOpenSettings: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  error,
  details,
  onRetry,
  onOpenSettings,
}) => {
  const isKeyError =
    error.toLowerCase().includes('api key') ||
    error.toLowerCase().includes('missing gemini') ||
    error.toLowerCase().includes('invalid');

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-6 backdrop-blur-xl shadow-xl animate-in fade-in duration-300">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
          <AlertCircle className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-rose-200">Unable to Summarize Webpage</h3>
          <p className="mt-1 text-sm text-rose-300/90 leading-relaxed font-medium">{error}</p>

          {details && (
            <p className="mt-2 text-xs text-rose-400/80 bg-rose-950/40 border border-rose-900/40 rounded-lg p-2.5">
              {details}
            </p>
          )}

          {isKeyError && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-200 space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                <span>How to resolve this:</span>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-amber-300/90">
                <li>
                  Click the <strong>Set API Key</strong> button in the top right to paste your free Google Gemini API key.
                </li>
                <li>
                  Or create a <code className="bg-amber-950 px-1 py-0.5 rounded font-mono">.env.local</code> file with <code className="bg-amber-950 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY=your_key</code> in your project directory.
                </li>
              </ul>
              <div className="pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  <span>Get a 100% Free Gemini Key from Google AI Studio</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 px-3.5 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>

            {isKeyError && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 px-3.5 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/30 transition-all"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Open Key Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
