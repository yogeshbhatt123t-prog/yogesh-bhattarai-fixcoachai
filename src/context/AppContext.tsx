/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  TradeType,
  ExperienceLevel,
  AIResponseData,
  JobRecord,
  SafetyFlag,
  StepItem,
  Procedure,
} from '../types';
import { CURATED_PROCEDURES } from '../data/procedures';
import { getTranslation } from '../data/translations';

interface AppContextValue {
  trade: TradeType;
  setTrade: (t: TradeType) => void;
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (l: ExperienceLevel) => void;
  language: string;
  setLanguage: (lang: string) => void;
  gloveMode: boolean;
  setGloveMode: (g: boolean | ((prev: boolean) => boolean)) => void;
  daylightMode: boolean;
  setDaylightMode: (d: boolean | ((prev: boolean) => boolean)) => void;
  isOnline: boolean;
  isDiagnosing: boolean;
  activeDiagnosis: AIResponseData | null;
  activeJob: JobRecord | null;
  activeStepIndex: number;
  setActiveStepIndex: (idx: number) => void;
  safetyHardStop: SafetyFlag | null;
  isSafetyModalOpen: boolean;
  setIsSafetyModalOpen: (open: boolean) => void;
  savedJobs: JobRecord[];
  downloadedTrades: string[];
  safetyLogs: any[];
  startDiagnosis: (imageBase64: string, notes?: string) => Promise<AIResponseData | null>;
  confirmSafetyHazard: (evidencePhoto?: string) => Promise<void>;
  abortCurrentJob: (reason?: string) => Promise<void>;
  toggleStepComplete: (stepNumber: number) => void;
  downloadTradePack: (targetTrade: string) => Promise<void>;
  loadProcedureDirectly: (proc: Procedure) => void;
  resetToCamera: () => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trade, setTradeState] = useState<TradeType>('electrical');
  const [experienceLevel, setExperienceLevelState] = useState<ExperienceLevel>('apprentice');
  const [language, setLanguageState] = useState<string>('en-US');
  const [gloveMode, setGloveMode] = useState<boolean>(false);
  const [daylightMode, setDaylightMode] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [activeDiagnosis, setActiveDiagnosis] = useState<AIResponseData | null>(null);
  const [activeJob, setActiveJob] = useState<JobRecord | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [safetyHardStop, setSafetyHardStop] = useState<SafetyFlag | null>(null);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<JobRecord[]>([]);
  const [downloadedTrades, setDownloadedTrades] = useState<string[]>(['electrical', 'plumbing']);
  const [safetyLogs, setSafetyLogs] = useState<any[]>([]);

  // Connectivity monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hydrate preferences from LocalStorage
  useEffect(() => {
    try {
      const storedTrade = localStorage.getItem('fixcoach_trade') as TradeType;
      if (storedTrade) setTradeState(storedTrade);

      const storedExp = localStorage.getItem('fixcoach_exp') as ExperienceLevel;
      if (storedExp) setExperienceLevelState(storedExp);

      const storedLang = localStorage.getItem('fixcoach_lang');
      if (storedLang) setLanguageState(storedLang);

      const storedGlove = localStorage.getItem('fixcoach_glove');
      if (storedGlove) setGloveMode(storedGlove === 'true');

      const storedDaylight = localStorage.getItem('fixcoach_daylight');
      if (storedDaylight) setDaylightMode(storedDaylight === 'true');

      const storedTrades = localStorage.getItem('fixcoach_downloaded_trades');
      if (storedTrades) setDownloadedTrades(JSON.parse(storedTrades));

      const storedJobs = localStorage.getItem('fixcoach_saved_jobs');
      if (storedJobs) setSavedJobs(JSON.parse(storedJobs));
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }, []);

  const setTrade = (t: TradeType) => {
    setTradeState(t);
    localStorage.setItem('fixcoach_trade', t);
  };

  const setExperienceLevel = (l: ExperienceLevel) => {
    setExperienceLevelState(l);
    localStorage.setItem('fixcoach_exp', l);
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('fixcoach_lang', lang);
  };

  // Translation helper
  const t = useCallback(
    (key: string): string => {
      const locale = getTranslation(language);
      return (locale.strings as any)[key] || (getTranslation('en-US').strings as any)[key] || key;
    },
    [language]
  );

  // Multimodal Diagnosis Runner
  const startDiagnosis = async (imageBase64: string, notes: string = ''): Promise<AIResponseData | null> => {
    setIsDiagnosing(true);
    try {
      let data: AIResponseData;

      if (!isOnline) {
        // Run completely offline with curated procedural knowledge
        const match = CURATED_PROCEDURES.find((p) => p.trade === trade) || CURATED_PROCEDURES[0];
        data = {
          diagnosis: {
            summary: `[OFFLINE] ${match.title}`,
            trade: match.trade,
            likely_issue: notes || `Offline protocol for ${match.category}`,
            confidence: 0.9,
          },
          safety: {
            flags: match.safety_critical
              ? [
                  {
                    type: 'HARD_STOP',
                    reason: 'Equipment de-energization and isolation required before touching components.',
                    action_required: 'Open main disconnect/shutoff valve and test with calibrated meter.',
                  },
                ]
              : [],
            requires_hard_stop: match.safety_critical,
            ppe_recommended: match.ppe_required,
          },
          steps: match.steps,
          escalation: {
            should_escalate: false,
            recommendation: 'Verify against local code requirements.',
          },
        };
      } else {
        const res = await fetch('/api/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            trade,
            language,
            notes,
            locationContext: 'Field jobsite',
          }),
        });
        data = await res.json();
      }

      setActiveDiagnosis(data);
      setActiveStepIndex(0);

      // Create new Job Session
      const newJob: JobRecord = {
        id: `job_${Date.now()}`,
        trade,
        title: data.diagnosis.summary,
        description: data.diagnosis.likely_issue,
        status: data.escalation.should_escalate ? 'escalated' : 'in_progress',
        confidence_score: data.diagnosis.confidence,
        language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        media: [
          {
            id: `media_${Date.now()}`,
            type: 'photo',
            dataUrl: imageBase64,
            timestamp: new Date().toISOString(),
          },
        ],
        steps: data.steps,
        safety_flags: data.safety.flags,
        safety_logs: [],
        notes: notes ? [notes] : [],
      };

      setActiveJob(newJob);

      // Check if Safety Hard Stop is required
      const hardStop = data.safety.flags.find((f) => f.type === 'HARD_STOP');
      if (data.safety.requires_hard_stop || hardStop) {
        setSafetyHardStop(
          hardStop || {
            type: 'HARD_STOP',
            reason: 'Mandatory zero-energy state verification required for this procedure.',
            action_required: 'Switch OFF main energy feed and verify zero energy before beginning.',
          }
        );
        setIsSafetyModalOpen(true);
      } else {
        setSafetyHardStop(null);
        setIsSafetyModalOpen(false);
      }

      // Sync job session
      setSavedJobs((prev) => {
        const next = [newJob, ...prev.filter((j) => j.id !== newJob.id)];
        localStorage.setItem('fixcoach_saved_jobs', JSON.stringify(next));
        return next;
      });

      return data;
    } catch (err) {
      console.error('Diagnosis failed:', err);
      return null;
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Direct Procedure Loader (For offline procedures or quick training)
  const loadProcedureDirectly = (proc: Procedure) => {
    const data: AIResponseData = {
      diagnosis: {
        summary: proc.title,
        trade: proc.trade,
        likely_issue: proc.content,
        confidence: 0.98,
      },
      safety: {
        flags: proc.safety_critical
          ? [
              {
                type: 'HARD_STOP',
                reason: `High risk ${proc.safety_tags.join(', ')} hazard present.`,
                action_required: 'De-energize/depressurize and confirm before handling.',
              },
            ]
          : [],
        requires_hard_stop: proc.safety_critical,
        ppe_recommended: proc.ppe_required,
      },
      steps: proc.steps,
      escalation: {
        should_escalate: false,
        recommendation: 'Check manufacturer submittal and local code.',
      },
    };

    setActiveDiagnosis(data);
    setActiveStepIndex(0);

    const newJob: JobRecord = {
      id: `job_${Date.now()}`,
      trade: proc.trade,
      title: proc.title,
      description: proc.content,
      status: 'in_progress',
      confidence_score: 0.98,
      language,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media: [],
      steps: proc.steps,
      safety_flags: data.safety.flags,
      safety_logs: [],
    };

    setActiveJob(newJob);

    if (proc.safety_critical) {
      setSafetyHardStop(data.safety.flags[0]);
      setIsSafetyModalOpen(true);
    } else {
      setSafetyHardStop(null);
      setIsSafetyModalOpen(false);
    }
  };

  // Confirm Safety Hard Stop (Unlock guidance)
  const confirmSafetyHazard = async (evidencePhoto?: string) => {
    if (!safetyHardStop) return;

    const logRecord = {
      id: `safety_log_${Date.now()}`,
      trigger: safetyHardStop.type,
      reason: safetyHardStop.reason,
      action_taken: 'CONFIRMED_ZERO_ENERGY_WITH_CHECKLIST',
      timestamp: new Date().toISOString(),
      evidence_url: evidencePhoto,
    };

    setSafetyLogs((prev) => [logRecord, ...prev]);

    if (activeJob) {
      const updatedJob: JobRecord = {
        ...activeJob,
        updated_at: new Date().toISOString(),
        safety_logs: [logRecord, ...(activeJob.safety_logs || [])],
        media: evidencePhoto
          ? [
              ...(activeJob.media || []),
              {
                id: `evidence_${Date.now()}`,
                type: 'evidence',
                dataUrl: evidencePhoto,
                is_safety_evidence: true,
                timestamp: new Date().toISOString(),
              },
            ]
          : activeJob.media,
      };
      setActiveJob(updatedJob);
      setSavedJobs((prev) => {
        const next = [updatedJob, ...prev.filter((j) => j.id !== updatedJob.id)];
        localStorage.setItem('fixcoach_saved_jobs', JSON.stringify(next));
        return next;
      });
    }

    // Report to backend audit log
    try {
      fetch('/api/safety/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJob?.id,
          trigger: safetyHardStop.type,
          reason: safetyHardStop.reason,
          action_taken: 'VERIFIED_SAFE',
          evidence_url: evidencePhoto,
        }),
      }).catch(() => {});
    } catch {}

    setSafetyHardStop(null);
    setIsSafetyModalOpen(false);
  };

  // Emergency Abort Job
  const abortCurrentJob = async (reason: string = 'Worker initiated emergency stop') => {
    const logRecord = {
      id: `safety_log_${Date.now()}`,
      trigger: 'EMERGENCY_ABORT',
      reason,
      action_taken: 'ABORTED_WORK_ESCALATED_SUPERVISOR',
      timestamp: new Date().toISOString(),
    };

    setSafetyLogs((prev) => [logRecord, ...prev]);

    if (activeJob) {
      const updatedJob: JobRecord = {
        ...activeJob,
        status: 'aborted',
        updated_at: new Date().toISOString(),
        safety_logs: [logRecord, ...(activeJob.safety_logs || [])],
      };
      setActiveJob(updatedJob);
      setSavedJobs((prev) => {
        const next = [updatedJob, ...prev.filter((j) => j.id !== updatedJob.id)];
        localStorage.setItem('fixcoach_saved_jobs', JSON.stringify(next));
        return next;
      });
    }

    try {
      fetch('/api/safety/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJob?.id,
          trigger: 'EMERGENCY_ABORT',
          reason,
          action_taken: 'ABORTED',
        }),
      }).catch(() => {});
    } catch {}

    setIsSafetyModalOpen(false);
    setSafetyHardStop(null);
  };

  // Toggle step completion checkbox
  const toggleStepComplete = (stepNumber: number) => {
    if (!activeJob) return;
    const updatedSteps = activeJob.steps.map((st) => {
      if (st.step_number === stepNumber) {
        return {
          ...st,
          completed: !st.completed,
          completed_at: !st.completed ? new Date().toISOString() : undefined,
        };
      }
      return st;
    });

    const allCompleted = updatedSteps.every((s) => s.completed);

    const updatedJob: JobRecord = {
      ...activeJob,
      steps: updatedSteps,
      status: allCompleted ? 'completed' : activeJob.status,
      updated_at: new Date().toISOString(),
    };

    setActiveJob(updatedJob);
    setSavedJobs((prev) => {
      const next = [updatedJob, ...prev.filter((j) => j.id !== updatedJob.id)];
      localStorage.setItem('fixcoach_saved_jobs', JSON.stringify(next));
      return next;
    });
  };

  // Download trade procedure pack for offline storage
  const downloadTradePack = async (targetTrade: string) => {
    if (!downloadedTrades.includes(targetTrade)) {
      const next = [...downloadedTrades, targetTrade];
      setDownloadedTrades(next);
      localStorage.setItem('fixcoach_downloaded_trades', JSON.stringify(next));
    }
  };

  const resetToCamera = () => {
    setActiveDiagnosis(null);
    setActiveJob(null);
    setActiveStepIndex(0);
    setSafetyHardStop(null);
    setIsSafetyModalOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        trade,
        setTrade,
        experienceLevel,
        setExperienceLevel,
        language,
        setLanguage,
        gloveMode,
        setGloveMode,
        daylightMode,
        setDaylightMode,
        isOnline,
        isDiagnosing,
        activeDiagnosis,
        activeJob,
        activeStepIndex,
        setActiveStepIndex,
        safetyHardStop,
        isSafetyModalOpen,
        setIsSafetyModalOpen,
        savedJobs,
        downloadedTrades,
        safetyLogs,
        startDiagnosis,
        confirmSafetyHazard,
        abortCurrentJob,
        toggleStepComplete,
        downloadTradePack,
        loadProcedureDirectly,
        resetToCamera,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
