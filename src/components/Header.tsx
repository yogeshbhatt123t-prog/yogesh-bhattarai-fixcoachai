/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TradeType } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/translations';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  ShieldAlert,
  Zap,
  Wrench,
  Wind,
  Hammer,
  Flame,
  Home,
  SlidersHorizontal,
  Sun,
  Hand,
  Download,
  Wifi,
  WifiOff,
  AlertOctagon,
  Languages,
  RotateCcw,
  BookOpen,
  History,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'diagnose' | 'guide' | 'offline' | 'history';
  setCurrentTab: (tab: 'diagnose' | 'guide' | 'offline' | 'history') => void;
}

const TRADE_CONFIG: Record<TradeType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  electrical: { label: 'Electrical', icon: Zap },
  plumbing: { label: 'Plumbing', icon: Wrench },
  hvac: { label: 'HVAC', icon: Wind },
  carpentry: { label: 'Carpentry', icon: Hammer },
  welding: { label: 'Welding', icon: Flame },
  roofing: { label: 'Roofing', icon: Home },
  appliance: { label: 'Appliance', icon: SlidersHorizontal },
  general_maintenance: { label: 'Maintenance', icon: Wrench },
};

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const {
    trade,
    setTrade,
    language,
    setLanguage,
    gloveMode,
    setGloveMode,
    daylightMode,
    setDaylightMode,
    isOnline,
    abortCurrentJob,
    activeJob,
    resetToCamera,
    t,
  } = useApp();

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      {/* Top Banner: Status, Emergency Abort, Offline indicator */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetToCamera();
              setCurrentTab('diagnose');
            }}
            className="flex items-center gap-2 text-left group"
          >
            <div className="relative w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <img src="/icon.svg" alt="FixCoach" className="w-full h-full object-contain" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-wide text-white flex items-center gap-1">
                  FixCoach <span className="text-amber-400 font-black">AI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Trades Safety & Voice Copilot
              </p>
            </div>
          </button>
        </div>

        {/* Action Controls: Voice Commands, Glove Mode, Daylight, Lang, Emergency Abort */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Hands-Free Voice Quick Indicator */}
          <button
            onClick={() => {
              if (currentTab !== 'guide') {
                setCurrentTab('guide');
              }
            }}
            title="Hands-Free Voice Commands"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Voice Control</span>
          </button>
          {/* Glove Mode Button */}
          <button
            onClick={() => setGloveMode((prev) => !prev)}
            title={t('gloveMode')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              gloveMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Hand className={`w-3.5 h-3.5 ${gloveMode ? 'text-slate-950 font-bold' : 'text-amber-400'}`} />
            <span className="hidden md:inline">Glove Mode</span>
          </button>

          {/* High-Contrast Daylight Mode */}
          <button
            onClick={() => setDaylightMode((prev) => !prev)}
            title={t('daylightMode')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              daylightMode
                ? 'bg-yellow-400 text-slate-950 border-yellow-300'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${daylightMode ? 'text-slate-950' : 'text-yellow-400'}`} />
            <span className="hidden md:inline">Daylight</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1"
            >
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span className="uppercase text-[11px]">{language.split('-')[0]}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-52 max-h-72 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-50 divide-y divide-slate-800">
                <div className="p-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  20 Trade Languages
                </div>
                <div className="py-1">
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, item]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLanguage(code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                        language === code
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{item.nativeName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install PWA</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">iOS Install</span>
            </button>
          )}

          {/* STOP & GET HELP Emergency Abort Button (Always Accessible) */}
          <button
            onClick={() => {
              if (window.confirm('Trigger Emergency Safety Stop and Abort Procedure?')) {
                abortCurrentJob('Worker initiated emergency STOP from top header');
              }
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shadow-md shadow-red-600/30 animate-pulse border border-red-400"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span className="font-mono tracking-tight text-[11px]">{t('stopAndGetHelp')}</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation & Trade Selection Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentTab('diagnose')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'diagnose'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Camera Vision</span>
          </button>

          <button
            onClick={() => setCurrentTab('guide')}
            disabled={!activeJob}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'guide'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                : activeJob
                ? 'text-slate-300 hover:bg-slate-800/50'
                : 'text-slate-600 cursor-not-allowed opacity-60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Active Guide {activeJob ? `(${activeJob.steps.length})` : ''}</span>
          </button>

          <button
            onClick={() => setCurrentTab('offline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'offline'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Offline Procedures</span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History & Logs</span>
          </button>
        </div>

        {/* Trade Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 hidden lg:inline">
            Active Trade:
          </span>
          {(Object.keys(TRADE_CONFIG) as TradeType[]).map((tKey) => {
            const isSelected = trade === tKey;
            const ItemIcon = TRADE_CONFIG[tKey].icon;
            return (
              <button
                key={tKey}
                onClick={() => setTrade(tKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <ItemIcon className="w-3 h-3" />
                <span>{TRADE_CONFIG[tKey].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Offline Alert Strip when disconnected */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-1 text-xs flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>{t('offlineMode')} - Ready with cached procedures & local emergency checks</span>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-400" />
              Install FixCoach on iPhone / iPad
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              1. Tap the <strong className="text-amber-400">Share</strong> icon (square with arrow up) in the Safari
              toolbar.<br />
              2. Scroll down and tap <strong className="text-amber-400">Add to Home Screen</strong>.<br />
              3. FixCoach will run full-screen offline on your jobsite.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full rounded-xl bg-amber-500 text-slate-950 font-extrabold py-2.5 text-sm hover:bg-amber-400"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
