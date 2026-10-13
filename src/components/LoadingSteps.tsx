'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Code2, BrainCircuit, Sparkles, Check } from 'lucide-react';

const STEPS = [
  {
    title: 'Connecting to Target Webpage',
    desc: 'Sending HTTP GET request and handling redirects...',
    icon: Globe,
  },
  {
    title: 'Scraping & DOM Extraction',
    desc: 'Removing clutter and extracting core article text with Cheerio...',
    icon: Code2,
  },
  {
    title: 'Analyzing Content with Gemini AI',
    desc: 'Evaluating key themes, context, and arguments...',
    icon: BrainCircuit,
  },
  {
    title: 'Formatting Structured Summary',
    desc: 'Synthesizing TL;DR, key takeaways, and markdown report...',
    icon: Sparkles,
  },
];

export const LoadingSteps: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStep(1), 1200);
    const timer2 = setTimeout(() => setActiveStep(2), 2600);
    const timer3 = setTimeout(() => setActiveStep(3), 5200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl animate-in fade-in duration-300">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3 animate-pulse">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">Scraping & Summarizing Webpage</h3>
        <p className="text-xs text-slate-400 mt-1">
          Extracting readable content and passing it through Gemini AI
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = activeStep > idx;
          const isCurrent = activeStep === idx;

          return (
            <div
              key={idx}
              className={`flex items-start gap-4 rounded-xl border p-3.5 transition-all duration-300 ${
                isCurrent
                  ? 'border-indigo-500/50 bg-indigo-500/10 shadow-md shadow-indigo-500/10'
                  : isDone
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-slate-800/60 bg-slate-950/40 opacity-40'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                    ? 'bg-indigo-500/20 text-indigo-300 animate-pulse'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-indigo-200' : isDone ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {isCurrent && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
