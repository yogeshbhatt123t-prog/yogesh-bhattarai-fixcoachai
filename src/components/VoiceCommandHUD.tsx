/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VoiceCommandHUDProps {
  isListening: boolean;
  transcript: string;
  lastCommand: string | null;
  error: string | null;
  onToggleListening: () => void;
  onSimulateCommand?: (cmd: string) => void;
}

export const VoiceCommandHUD: React.FC<VoiceCommandHUDProps> = ({
  isListening,
  transcript,
  lastCommand,
  error,
  onToggleListening,
  onSimulateCommand,
}) => {
  const { gloveMode } = useApp();

  return (
    <div className="bg-slate-900/95 rounded-2xl p-3.5 sm:p-4 border-2 border-slate-800 shadow-xl space-y-3">
      {/* Top Status Bar: Listening Indicator + Big Mic Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Main Hands-Free Toggle Button */}
          <button
            onClick={onToggleListening}
            className={`rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              isListening
                ? 'bg-red-500 hover:bg-red-400 text-white border-2 border-red-300 shadow-red-500/25 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black border-2 border-emerald-300 shadow-emerald-500/20'
            } ${gloveMode ? 'px-5 py-3 h-14' : 'px-4 py-2.5 h-12'}`}
          >
            {isListening ? (
              <>
                <Mic className="w-5 h-5 text-white" />
                <span>Hands-Free Mic ON</span>
              </>
            ) : (
              <>
                <MicOff className="w-5 h-5 text-slate-950" />
                <span>Enable Voice Commands</span>
              </>
            )}
          </button>

          {/* Status Label */}
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                }`}
              />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                {isListening ? 'LISTENING FOR COMMANDS' : 'VOICE CONTROL STANDBY'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isListening
                ? 'Speak commands into your microphone while hands are busy'
                : 'Tap to control guide completely hands-free'}
            </p>
          </div>
        </div>

        {/* Last Recognized Command Pill */}
        {lastCommand && (
          <div className="bg-amber-500/20 border border-amber-500/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-amber-300 animate-in fade-in zoom-in-95">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Executed: {lastCommand}</span>
          </div>
        )}
      </div>

      {/* Live Transcript Stream (What the mic hears in real time) */}
      {isListening && (
        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <span className="text-amber-400 font-mono font-bold flex-shrink-0">
              Mic Hearing:
            </span>
            <span className="italic text-slate-200 truncate">
              {transcript ? `"${transcript}"` : 'Listening... say "Next Step" or "Repeat"'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 ml-2">
            Auto-Detect
          </span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Voice Commands Cheat-Sheet & Quick Simulators */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Hands-Free Speech Vocabulary:</span>
          <span className="text-slate-500 font-normal">Tap to test or speak aloud</span>
        </span>

        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Next Step', cmd: 'next step', icon: ArrowRight },
            { label: 'Repeat Instruction', cmd: 'repeat instruction', icon: RotateCcw },
            { label: 'Mark Complete', cmd: 'mark complete', icon: CheckCircle2 },
            { label: 'Previous Step', cmd: 'previous step', icon: ArrowLeft },
            { label: 'Stop & Get Help', cmd: 'stop', icon: AlertOctagon, isStop: true },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.cmd}
                onClick={() => onSimulateCommand?.(item.cmd)}
                title={`Say "${item.label}"`}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                  item.isStop
                    ? 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-800'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Icon className={`w-3 h-3 ${item.isStop ? 'text-red-400' : 'text-amber-400'}`} />
                <span>"{item.label}"</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
