/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { playCommandSound } from '../utils/audioFeedback';

export type VoiceAction =
  | 'NEXT_STEP'
  | 'PREV_STEP'
  | 'REPEAT_INSTRUCTION'
  | 'COMPLETE_STEP'
  | 'STOP'
  | 'PAUSE';

interface VoiceCommandHandlers {
  onNext?: () => void;
  onPrevious?: () => void;
  onRepeat?: () => void;
  onComplete?: () => void;
  onStop?: () => void;
  onPause?: () => void;
}

export function useVoiceCommands(handlers: VoiceCommandHandlers, language: string = 'en-US') {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastRecognizedCommand, setLastRecognizedCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const handlersRef = useRef(handlers);
  const lastProcessedTimeRef = useRef(0);

  // Keep handlers fresh without retriggering effect
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }
  }, []);

  const parseAndExecuteCommand = useCallback((text: string) => {
    const raw = text.toLowerCase().trim();
    const now = Date.now();
    // Guard against duplicate execution within 900ms
    if (now - lastProcessedTimeRef.current < 900) return;

    // Check for EMERGENCY STOP / ABORT
    if (
      raw.includes('stop') ||
      raw.includes('emergency stop') ||
      raw.includes('halt') ||
      raw.includes('abort') ||
      raw.includes('parar') ||
      raw.includes('alto') ||
      raw.includes('stopp') ||
      raw.includes('roko') ||
      raw.includes('arrêtez')
    ) {
      lastProcessedTimeRef.current = now;
      setLastRecognizedCommand('STOP & GET HELP');
      playCommandSound('alert');
      handlersRef.current.onStop?.();
      return;
    }

    // Check for NEXT STEP
    if (
      raw.includes('next step') ||
      raw.includes('next') ||
      raw.includes('continue') ||
      raw.includes('forward') ||
      raw.includes('advance') ||
      raw.includes('siguiente') ||
      raw.includes('suivant') ||
      raw.includes('weiter') ||
      raw.includes('agla') ||
      raw.includes('arko')
    ) {
      lastProcessedTimeRef.current = now;
      setLastRecognizedCommand('Next Step');
      playCommandSound('success');
      handlersRef.current.onNext?.();
      return;
    }

    // Check for REPEAT INSTRUCTION
    if (
      raw.includes('repeat instruction') ||
      raw.includes('repeat step') ||
      raw.includes('repeat') ||
      raw.includes('read again') ||
      raw.includes('say again') ||
      raw.includes('listen again') ||
      raw.includes('what was that') ||
      raw.includes('repetir') ||
      raw.includes('répéter') ||
      raw.includes('wiederholen') ||
      raw.includes('dohraye')
    ) {
      lastProcessedTimeRef.current = now;
      setLastRecognizedCommand('Repeat Instruction');
      playCommandSound('success');
      handlersRef.current.onRepeat?.();
      return;
    }

    // Check for COMPLETE STEP
    if (
      raw.includes('complete step') ||
      raw.includes('mark complete') ||
      raw.includes('step complete') ||
      raw.includes('done') ||
      raw.includes('check') ||
      raw.includes('finished') ||
      raw.includes('completado') ||
      raw.includes('terminé') ||
      raw.includes('fertig') ||
      raw.includes('pura')
    ) {
      lastProcessedTimeRef.current = now;
      setLastRecognizedCommand('Mark Complete');
      playCommandSound('success');
      handlersRef.current.onComplete?.();
      return;
    }

    // Check for PREVIOUS STEP
    if (
      raw.includes('previous step') ||
      raw.includes('previous') ||
      raw.includes('go back') ||
      raw.includes('back') ||
      raw.includes('anterior') ||
      raw.includes('précédent') ||
      raw.includes('zurück') ||
      raw.includes('pichla')
    ) {
      lastProcessedTimeRef.current = now;
      setLastRecognizedCommand('Previous Step');
      playCommandSound('success');
      handlersRef.current.onPrevious?.();
      return;
    }

    // Check for PAUSE
    if (raw.includes('pause') || raw.includes('quiet') || raw.includes('silence')) {
      lastProcessedTimeRef.current = now;
      setLastRecognizedCommand('Pause Voice');
      playCommandSound('success');
      handlersRef.current.onPause?.();
      return;
    }
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        shouldListenRef.current = true;
        playCommandSound('listening');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0].transcript;
          currentTranscript += text;
          if (res.isFinal || text.length > 3) {
            parseAndExecuteCommand(text);
          }
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal timeout on quiet jobsite, ignore
          return;
        }
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Allow mic access to use voice commands.');
          setIsListening(false);
          shouldListenRef.current = false;
        }
      };

      recognition.onend = () => {
        // Auto-restart if user still wants hands-free mode enabled
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('SpeechRecognition failed to start:', err);
      setError('Could not start microphone.');
      setIsListening(false);
    }
  }, [language, parseAndExecuteCommand]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    lastRecognizedCommand,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
