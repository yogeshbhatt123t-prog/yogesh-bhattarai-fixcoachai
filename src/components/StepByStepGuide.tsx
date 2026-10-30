/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useVoiceTTS } from '../hooks/useVoiceTTS';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { VoiceControls } from './VoiceControls';
import { VoiceCommandHUD } from './VoiceCommandHUD';
import { ConfidenceBadge } from './ConfidenceBadge';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Wrench,
  ShieldAlert,
  HelpCircle,
  AlertOctagon,
  ListOrdered,
  Camera,
  Layers,
  Sparkles,
  Mic,
} from 'lucide-react';

interface StepByStepGuideProps {
  onBackToCamera: () => void;
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ onBackToCamera }) => {
  const {
    activeJob,
    activeStepIndex,
    setActiveStepIndex,
    toggleStepComplete,
    abortCurrentJob,
    language,
    gloveMode,
    t,
  } = useApp();

  const voiceHook = useVoiceTTS();
  const [showAllStepsDrawer, setShowAllStepsDrawer] = useState(false);
  const [askNote, setAskNote] = useState('');
  const [clarificationResponse, setClarificationResponse] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  if (!activeJob || !activeJob.steps || activeJob.steps.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-400">No active job session loaded.</p>
        <button
          onClick={onBackToCamera}
          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
        >
          Return to Camera
        </button>
      </div>
    );
  }

  const currentStep = activeJob.steps[activeStepIndex] || activeJob.steps[0];
  const totalSteps = activeJob.steps.length;
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === totalSteps - 1;

  // Text to read aloud
  const voiceText = useMemo(() => {
    return `Step ${currentStep.step_number}. ${currentStep.title}. ${currentStep.instruction}. ${
      currentStep.safety_note ? `Safety notice: ${currentStep.safety_note}` : ''
    }`;
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (!isLastStep) {
      voiceHook.stop();
      setActiveStepIndex(activeStepIndex + 1);
    }
  }, [isLastStep, voiceHook, setActiveStepIndex, activeStepIndex]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      voiceHook.stop();
      setActiveStepIndex(activeStepIndex - 1);
    }
  }, [isFirstStep, voiceHook, setActiveStepIndex, activeStepIndex]);

  const handleRepeatInstruction = useCallback(() => {
    voiceHook.stop();
    voiceHook.speak(voiceText, language);
  }, [voiceHook, voiceText, language]);

  const handleCompleteCurrentStep = useCallback(() => {
    toggleStepComplete(currentStep.step_number);
  }, [toggleStepComplete, currentStep.step_number]);

  const handleEmergencyStop = useCallback(() => {
    voiceHook.stop();
    abortCurrentJob('Worker issued verbal EMERGENCY STOP voice command');
  }, [voiceHook, abortCurrentJob]);

  const handlePauseVoice = useCallback(() => {
    voiceHook.pause();
  }, [voiceHook]);

  // Hands-free Voice Commands Hook
  const voiceCommandHook = useVoiceCommands(
    {
      onNext: handleNext,
      onPrevious: handlePrev,
      onRepeat: handleRepeatInstruction,
      onComplete: handleCompleteCurrentStep,
      onStop: handleEmergencyStop,
      onPause: handlePauseVoice,
    },
    language
  );

  const handleAskClarification = async () => {
    if (!askNote.trim()) return;
    setIsAsking(true);
    try {
      const prompt = `Tradesperson working on ${activeJob.trade} job "${activeJob.title}".
Current Step #${currentStep.step_number}: ${currentStep.title} - ${currentStep.instruction}.
Worker's question or unexpected situation: "${askNote}".
Provide 2-3 direct, imperative sentences answering this with safety in mind.`;

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: prompt,
          trade: activeJob.trade,
          language: activeJob.language,
        }),
      });
      const data = await res.json();
      setClarificationResponse(
        data.diagnosis?.likely_issue ||
          `Inspect the nearest shutoff or junction box, and ensure all connections are torque-checked. If condition does not match manufacturer submittal, consult job supervisor.`
      );
    } catch {
      setClarificationResponse('Verify zero voltage/pressure and inspect terminal markings closely.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Top Header Card: Title, Trade, Return button */}
      <div className="bg-slate-900/95 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCamera}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Back to Camera"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/20">
                {activeJob.trade}
              </span>
              <span className="text-xs text-slate-400">
                Step {activeStepIndex + 1} of {totalSteps}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
              {activeJob.title}
            </h2>
          </div>
        </div>

        {/* View all steps list toggle */}
        <button
          onClick={() => setShowAllStepsDrawer((prev) => !prev)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
        >
          <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
          <span>{showAllStepsDrawer ? 'Hide Steps List' : 'All Steps'}</span>
        </button>
      </div>

      {/* Confidence Scoring Bar */}
      <ConfidenceBadge
        score={activeJob.confidence_score}
        trade={activeJob.trade}
        shouldEscalate={activeJob.status === 'escalated'}
      />

      {/* Hands-Free Voice Commands HUD (Web Speech Recognition) */}
      <VoiceCommandHUD
        isListening={voiceCommandHook.isListening}
        transcript={voiceCommandHook.transcript}
        lastCommand={voiceCommandHook.lastRecognizedCommand}
        error={voiceCommandHook.error}
        onToggleListening={voiceCommandHook.toggleListening}
        onSimulateCommand={(cmd) => {
          if (cmd === 'next step') handleNext();
          else if (cmd === 'previous step') handlePrev();
          else if (cmd === 'repeat instruction') handleRepeatInstruction();
          else if (cmd === 'mark complete') handleCompleteCurrentStep();
          else if (cmd === 'stop') handleEmergencyStop();
        }}
      />

      {/* Steps Step-List Drawer (if toggled) */}
      {showAllStepsDrawer && (
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Complete Procedure Steps:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeJob.steps.map((st, i) => (
              <button
                key={st.step_number}
                onClick={() => {
                  voiceHook.stop();
                  setActiveStepIndex(i);
                  setShowAllStepsDrawer(false);
                }}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                  activeStepIndex === i
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold'
                    : st.completed
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                  {st.step_number}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate">{st.title}</div>
                  {st.completed && (
                    <span className="text-[10px] text-emerald-400 font-semibold">Done</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hands-Free Voice Guidance Audio Player (TTS) */}
      <VoiceControls
        currentText={voiceText}
        onAutoAdvanceNext={handleNext}
        voiceHook={voiceHook}
      />

      {/* Primary Active Step Card */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-7 border-2 border-slate-800 shadow-2xl space-y-5">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20">
              {currentStep.step_number}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                ACTION REQUIRED
              </span>
              <h3 className="text-base sm:text-xl font-black text-white">
                {currentStep.title}
              </h3>
            </div>
          </div>

          {/* Step Progress Pill */}
          <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
            {activeStepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Clear Imperative Instruction (Large & Readable) */}
        <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          {currentStep.instruction}
        </div>

        {/* Safety Note Alert (if present) */}
        {currentStep.safety_note && (
          <div className="bg-amber-950/40 border-2 border-amber-600/70 p-4 rounded-2xl flex items-start gap-3 text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <span className="font-extrabold uppercase tracking-wide text-amber-300">
                Safety Guardrail:
              </span>
              <p className="font-medium text-slate-200">{currentStep.safety_note}</p>
            </div>
          </div>
        )}

        {/* Tools Needed for this step */}
        {currentStep.tools_needed && currentStep.tools_needed.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-sky-400" />
              {t('toolsNeeded')}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentStep.tools_needed.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mandatory Confirmation Prompt (if step requires confirmation) */}
        {currentStep.requires_confirmation && (
          <div className="bg-sky-950/40 border border-sky-500/60 p-4 rounded-2xl text-xs sm:text-sm space-y-2">
            <span className="font-bold text-sky-300 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              Confirmation Required:
            </span>
            <p className="text-slate-200 font-semibold">
              {currentStep.confirmation_prompt || 'Did you verify zero energy before proceeding?'}
            </p>
          </div>
        )}

        {/* Big Glove-Friendly Step Completion Checkbox */}
        <button
          onClick={() => toggleStepComplete(currentStep.step_number)}
          className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
            currentStep.completed
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
              : 'bg-slate-950/80 border-slate-700 hover:border-amber-400/60 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
                currentStep.completed
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800 border-slate-600'
              }`}
            >
              {currentStep.completed && <CheckCircle2 className="w-5 h-5" />}
            </div>
            <span className="text-xs sm:text-sm font-extrabold tracking-wide">
              {currentStep.completed
                ? `Step ${currentStep.step_number} Completed`
                : `Mark Step ${currentStep.step_number} as Completed`}
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {currentStep.completed ? 'Checked' : 'Say "Mark Complete"'}
          </span>
        </button>

        {/* Previous & Next Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className={`rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              isFirstStep
                ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-[0.98]'
            } ${gloveMode ? 'h-16' : 'h-13 sm:h-14'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('prevStep')}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isLastStep}
            className={`rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isLastStep
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-300 shadow-amber-500/20 active:scale-[0.98]'
            } ${gloveMode ? 'h-16' : 'h-13 sm:h-14'}`}
          >
            <span>{isLastStep ? 'All Steps Finished' : t('nextStep')}</span>
            {!isLastStep && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Ask AI Copilot for Step Clarification (Hands-busy quick helper) */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Unexpected Condition or Need Clarification?</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Jobsite Assistant</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={askNote}
            onChange={(e) => setAskNote(e.target.value)}
            placeholder="e.g. Screw is stripped, wire gauge looks like 10 AWG instead of 12, or odor..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleAskClarification}
            disabled={isAsking || !askNote.trim()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
          >
            {isAsking ? 'Thinking...' : 'Ask Copilot'}
          </button>
        </div>

        {clarificationResponse && (
          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 text-xs text-slate-200 leading-relaxed">
            <span className="font-bold text-amber-300">Copilot Note: </span>
            {clarificationResponse}
          </div>
        )}
      </div>
    </div>
  );
};
