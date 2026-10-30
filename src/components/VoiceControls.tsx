/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Mic,
  Gauge,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VoiceControlsProps {
  currentText: string;
  onAutoAdvanceNext?: () => void;
  voiceHook: {
    isSupported: boolean;
    isPlaying: boolean;
    isPaused: boolean;
    speechRate: number;
    setSpeechRate: (r: number) => void;
    autoAdvance: boolean;
    setAutoAdvance: (a: boolean | ((prev: boolean) => boolean)) => void;
    speak: (text: string, lang?: string, onFinish?: () => void) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
  };
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  currentText,
  onAutoAdvanceNext,
  voiceHook,
}) => {
  const { language, gloveMode, t } = useApp();
  const {
    isSupported,
    isPlaying,
    isPaused,
    speechRate,
    setSpeechRate,
    autoAdvance,
    setAutoAdvance,
    speak,
    pause,
    resume,
    stop,
  } = voiceHook;

  if (!isSupported) {
    return (
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <VolumeX className="w-4 h-4 text-slate-500" />
        <span>Voice TTS not supported by this browser.</span>
      </div>
    );
  }

  const handlePlayToggle = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(currentText, language, () => {
        if (autoAdvance && onAutoAdvanceNext) {
          onAutoAdvanceNext();
        }
      });
    }
  };

  const handleRepeat = () => {
    stop();
    speak(currentText, language, () => {
      if (autoAdvance && onAutoAdvanceNext) {
        onAutoAdvanceNext();
      }
    });
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-xl space-y-3">
      {/* Top Bar: Play/Pause Big Button + Wave Animation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Main Play / Pause Voice Button */}
          <button
            onClick={handlePlayToggle}
            className={`rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              isPlaying && !isPaused
                ? 'bg-amber-500 text-slate-950 border-2 border-amber-300 shadow-amber-500/25'
                : 'bg-sky-600 hover:bg-sky-500 text-white border-2 border-sky-400 shadow-sky-600/20'
            } ${gloveMode ? 'px-5 py-3 h-14' : 'px-4 py-2.5 h-12'}`}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>{t('pauseVoice')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>{isPaused ? 'Resume Voice' : t('listenStep')}</span>
              </>
            )}
          </button>

          {/* Repeat Button */}
          <button
            onClick={handleRepeat}
            title={t('repeatStep')}
            className={`rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-colors ${
              gloveMode ? 'w-14 h-14' : 'w-12 h-12'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Wave Visualizer while Speaking */}
        {isPlaying && !isPaused && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/30">
            <span className="w-1.5 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-6 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="w-1.5 h-7 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            <span className="w-1.5 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <span className="text-[10px] font-mono text-amber-300 font-bold ml-1.5 hidden sm:inline">
              SPEAKING
            </span>
          </div>
        )}
      </div>

      {/* Speed Rate & Auto Advance settings */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
        {/* Speed Rate Toggles */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            Rate:
          </span>
          {[0.8, 1.0, 1.2].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                setSpeechRate(rate);
                if (isPlaying) {
                  stop();
                  speak(currentText, language);
                }
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                speechRate === rate
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Auto-Advance with Voice Toggle */}
        <button
          onClick={() => setAutoAdvance((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
            autoAdvance
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/60'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${autoAdvance ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span>{t('autoAdvance')}</span>
        </button>
      </div>
    </div>
  );
};
