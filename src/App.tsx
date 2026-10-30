/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { StepByStepGuide } from './components/StepByStepGuide';
import { SafetyHardStopModal } from './components/SafetyHardStopModal';
import { OfflineManager } from './components/OfflineManager';
import { JobHistory } from './components/JobHistory';
import { TradeOnboardingModal } from './components/TradeOnboardingModal';
import { Procedure, JobRecord } from './types';
import {
  Camera,
  Wrench,
  BookOpen,
  History,
  ShieldAlert,
  HardHat,
  Volume2,
  WifiOff,
} from 'lucide-react';

function AppContent() {
  const {
    activeJob,
    loadProcedureDirectly,
    gloveMode,
    daylightMode,
    isOnline,
    t,
  } = useApp();

  const [currentTab, setCurrentTab] = useState<'diagnose' | 'guide' | 'offline' | 'history'>('diagnose');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if first-time visitor
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('fixcoach_onboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  // When a diagnosis finishes, switch to guide view
  const handleDiagnosisComplete = () => {
    setCurrentTab('guide');
  };

  // When a procedure is selected from the offline browser
  const handleSelectProcedure = (proc: Procedure) => {
    loadProcedureDirectly(proc);
    setCurrentTab('guide');
  };

  // When a past job is resumed
  const handleResumeJob = (job: JobRecord) => {
    setCurrentTab('guide');
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        daylightMode
          ? 'bg-amber-100 text-slate-950 contrast-125'
          : 'bg-[#090d16] text-slate-100'
      } ${gloveMode ? 'glove-friendly-mode' : ''}`}
    >
      {/* Top Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main App Content Viewport */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {currentTab === 'diagnose' && (
          <CameraView onDiagnosisComplete={handleDiagnosisComplete} />
        )}

        {currentTab === 'guide' && (
          <StepByStepGuide onBackToCamera={() => setCurrentTab('diagnose')} />
        )}

        {currentTab === 'offline' && (
          <OfflineManager onSelectProcedure={handleSelectProcedure} />
        )}

        {currentTab === 'history' && (
          <JobHistory onResumeJob={handleResumeJob} />
        )}
      </main>

      {/* Mandatory Safety Hard Stop Modal (Blocks guidance until zero energy verified) */}
      <SafetyHardStopModal />

      {/* Initial Trade Onboarding Modal */}
      <TradeOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Persistent Bottom Mobile Nav for Gloves & One-Handed Field Use */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-3 sm:hidden flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setCurrentTab('diagnose')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'diagnose' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Camera</span>
        </button>

        <button
          onClick={() => activeJob && setCurrentTab('guide')}
          disabled={!activeJob}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'guide'
              ? 'text-amber-400 font-bold'
              : activeJob
              ? 'text-slate-300'
              : 'text-slate-600 opacity-50'
          }`}
        >
          <Wrench className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Guide</span>
        </button>

        <button
          onClick={() => setCurrentTab('offline')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'offline' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Procedures</span>
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'history' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">History</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
