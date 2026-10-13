'use client';

import React from 'react';
import { History, ArrowUpRight, Trash2, Clock } from 'lucide-react';
import { SummaryResult } from '@/types/scraper';

interface RecentHistoryProps {
  history: SummaryResult[];
  onSelect: (item: SummaryResult) => void;
  onClear: () => void;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Recent Summaries ({history.length})
          </h3>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
          title="Clear search history"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {history.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item)}
            className="group flex flex-col text-left rounded-xl border border-slate-800 bg-slate-950/50 p-3 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 truncate max-w-[140px]">
                {item.siteName}
              </span>
              <ArrowUpRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
            </div>

            <h4 className="mt-1 text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
              {item.title}
            </h4>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                <span>{item.stats.summaryReadTime}m read</span>
              </span>
              <span>{item.stats.reductionPercentage}% condensed</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
