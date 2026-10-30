/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CURATED_PROCEDURES } from '../data/procedures';
import { Procedure, TradeType } from '../types';
import {
  Download,
  CheckCircle2,
  HardDrive,
  Search,
  WifiOff,
  Wrench,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Filter,
} from 'lucide-react';

interface OfflineManagerProps {
  onSelectProcedure: (proc: Procedure) => void;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({ onSelectProcedure }) => {
  const {
    trade: currentTrade,
    downloadedTrades,
    downloadTradePack,
    isOnline,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>('all');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const tradesList: { id: TradeType; label: string; count: number }[] = [
    { id: 'electrical', label: 'Electrical', count: CURATED_PROCEDURES.filter((p) => p.trade === 'electrical').length },
    { id: 'plumbing', label: 'Plumbing', count: CURATED_PROCEDURES.filter((p) => p.trade === 'plumbing').length },
    { id: 'hvac', label: 'HVAC', count: CURATED_PROCEDURES.filter((p) => p.trade === 'hvac').length },
    { id: 'welding', label: 'Welding', count: CURATED_PROCEDURES.filter((p) => p.trade === 'welding').length },
    { id: 'carpentry', label: 'Carpentry', count: CURATED_PROCEDURES.filter((p) => p.trade === 'carpentry').length },
    { id: 'appliance', label: 'Appliance Repair', count: CURATED_PROCEDURES.filter((p) => p.trade === 'appliance').length },
    { id: 'roofing', label: 'Roofing', count: CURATED_PROCEDURES.filter((p) => p.trade === 'roofing').length },
    { id: 'general_maintenance', label: 'Maintenance', count: CURATED_PROCEDURES.filter((p) => p.trade === 'general_maintenance').length },
  ];

  const handleDownload = async (tradeId: string) => {
    setIsDownloading(tradeId);
    await downloadTradePack(tradeId);
    setTimeout(() => {
      setIsDownloading(null);
    }, 400);
  };

  const filteredProcedures = CURATED_PROCEDURES.filter((p) => {
    const matchesTrade = selectedTradeFilter === 'all' || p.trade === selectedTradeFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesTrade;

    const matchesQuery =
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.safety_tags.some((tag) => tag.toLowerCase().includes(q));

    return matchesTrade && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Top Banner: Local Storage & Offline Status */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                  OFFLINE FIELD PACK
                </span>
                {!isOnline && (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" /> Offline Active
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Offline Procedure Library
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Cached Procedures</span>
            <p className="text-lg font-black text-white">{CURATED_PROCEDURES.length} Guides Available</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Pre-load verified trade procedures onto your device so you never get stuck without guidance in basements, crawlspaces, or rural job sites without cellular coverage.
        </p>

        {/* Trade Pack Download Badges */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Downloadable Trade Packs:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tradesList.map((tItem) => {
              const isDownloaded = downloadedTrades.includes(tItem.id);
              const isBusy = isDownloading === tItem.id;
              return (
                <button
                  key={tItem.id}
                  onClick={() => handleDownload(tItem.id)}
                  disabled={isDownloaded || isBusy}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                    isDownloaded
                      ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{tItem.label}</div>
                    <div className="text-[10px] text-slate-400">{tItem.count} procs</div>
                  </div>
                  {isDownloaded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Download className={`w-4 h-4 text-slate-400 flex-shrink-0 ${isBusy ? 'animate-bounce' : ''}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search procedures by issue, tool, or safety tag (e.g. breaker, p-trap, flame sensor, pressure valve)..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Trade Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedTradeFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap border ${
              selectedTradeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            All Trades ({CURATED_PROCEDURES.length})
          </button>
          {tradesList.map((tItem) => (
            <button
              key={tItem.id}
              onClick={() => setSelectedTradeFilter(tItem.id)}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap border ${
                selectedTradeFilter === tItem.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              {tItem.label} ({tItem.count})
            </button>
          ))}
        </div>
      </div>

      {/* Procedures List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Showing {filteredProcedures.length} Procedures</span>
          <span>Tap to launch step-by-step voice guidance</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredProcedures.map((proc) => (
            <div
              key={proc.id}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl transition-all shadow-md group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/20">
                    {proc.trade}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {proc.category}
                  </span>
                  {proc.safety_critical && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Critical Hard Stop
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {proc.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {proc.content}
                </p>

                {/* Safety Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {proc.safety_tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-500 self-center ml-1">
                    • {proc.steps.length} Steps • {proc.tools_required.length} Tools
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectProcedure(proc)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap self-end sm:self-center"
              >
                <span>Start Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
