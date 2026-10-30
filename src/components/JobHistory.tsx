/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobRecord } from '../types';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Printer,
  Trash2,
  ArrowRight,
  Camera,
} from 'lucide-react';

interface JobHistoryProps {
  onResumeJob: (job: JobRecord) => void;
}

export const JobHistory: React.FC<JobHistoryProps> = ({ onResumeJob }) => {
  const { savedJobs, safetyLogs, t } = useApp();
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(savedJobs[0] || null);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300">
              AUDIT TRAIL & SESSIONS
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Jobsite History & Safety Logs
            </h2>
          </div>
        </div>

        {selectedJob && (
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Contractor Safety Report</span>
          </button>
        )}
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-slate-900/60 rounded-2xl p-10 text-center border border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No Job Sessions Recorded Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the Camera Vision or Offline Procedures tab to diagnose equipment and execute step-by-step repairs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column: Job List */}
          <div className="md:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Recorded Jobs ({savedJobs.length})
            </h3>
            {savedJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const completedCount = job.steps?.filter((s) => s.completed).length || 0;
              const totalCount = job.steps?.length || 0;

              return (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-500/20">
                      {job.trade}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        job.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : job.status === 'aborted'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{job.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>
                      {new Date(job.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>
                      {completedCount}/{totalCount} Steps
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Job Audit Detail */}
          <div className="md:col-span-2">
            {selectedJob ? (
              <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5 print:bg-white print:text-black">
                {/* Job Title & Metadata */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                      JOB ID: {selectedJob.id}
                    </span>
                    <button
                      onClick={() => onResumeJob(selectedJob)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm print:hidden"
                    >
                      <span>Resume in Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-lg font-black text-white mt-2">
                    {selectedJob.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Jobsite Photos & Evidence Captured */}
                {selectedJob.media && selectedJob.media.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      Visual Documentation ({selectedJob.media.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedJob.media.map((med) => (
                        <div
                          key={med.id}
                          className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video relative group"
                        >
                          <img
                            src={med.dataUrl}
                            alt="Job Evidence"
                            className="w-full h-full object-cover"
                          />
                          {med.is_safety_evidence && (
                            <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-emerald-900/90 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/50">
                              Verified Evidence
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Audit Trail Logs */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Safety Verifications & Incident Trail:
                  </span>
                  {selectedJob.safety_logs && selectedJob.safety_logs.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedJob.safety_logs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start gap-2.5"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white uppercase text-[11px]">
                                {log.trigger}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-slate-300 mt-0.5">{log.reason}</p>
                            <p className="text-[11px] text-emerald-400 font-medium mt-1">
                              Action Taken: {log.action_taken}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-500">
                      Standard operation - No emergency stops triggered.
                    </div>
                  )}
                </div>

                {/* Steps Completion Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Execution Checklist:
                  </span>
                  <div className="space-y-1.5">
                    {selectedJob.steps.map((st) => (
                      <div
                        key={st.step_number}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">#{st.step_number}</span>
                          <span className={st.completed ? 'text-slate-200 font-medium' : 'text-slate-400'}>
                            {st.title}
                          </span>
                        </div>
                        {st.completed ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                Select a job from the list to review the audit trail.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
