/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertOctagon,
  ShieldAlert,
  Camera,
  CheckSquare,
  Square,
  PhoneCall,
  XCircle,
  CheckCircle2,
  Lock,
  Upload,
} from 'lucide-react';

export const SafetyHardStopModal: React.FC = () => {
  const {
    safetyHardStop,
    isSafetyModalOpen,
    confirmSafetyHazard,
    abortCurrentJob,
    activeJob,
    t,
  } = useApp();

  const [checks, setChecks] = useState<{ [key: string]: boolean }>({
    isolated: false,
    verifiedZero: false,
    lotoApplied: false,
  });

  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [showSupervisorCall, setShowSupervisorCall] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isSafetyModalOpen || !safetyHardStop) return null;

  const allChecksSatisfied = checks.isolated && checks.verifiedZero && checks.lotoApplied;

  const toggleCheck = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setEvidencePhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmAndUnlock = async () => {
    if (!allChecksSatisfied) return;
    await confirmSafetyHazard(evidencePhoto || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-4 border-red-600 shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Industrial Diagonal Hazard Striping Bar */}
        <div
          className="h-4 w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #dc2626, #dc2626 15px, #f59e0b 15px, #f59e0b 30px)',
          }}
        />

        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Siren & Title */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center flex-shrink-0 text-red-500 animate-bounce">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white tracking-widest">
                  HARD STOP REQUIRED
                </span>
                <span className="text-xs text-red-400 font-bold">OSHA / NEC / NFPA 70E</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {t('hardStopTitle')}
              </h2>
            </div>
          </div>

          {/* Hazard Details Callout */}
          <div className="bg-red-950/50 border-2 border-red-700/80 rounded-2xl p-4 text-xs sm:text-sm text-red-200 space-y-2">
            <p className="font-bold text-red-100 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Identified Safety Hazard:</span>
            </p>
            <p className="leading-relaxed pl-5 font-medium text-slate-200">
              {safetyHardStop.reason}
            </p>

            <div className="pt-2 border-t border-red-800/60 pl-5">
              <span className="text-xs font-bold text-amber-300">Required Action: </span>
              <span className="text-slate-300">{safetyHardStop.action_required}</span>
            </div>
          </div>

          {/* Mandatory Checkpoints */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Mandatory Safety Checkpoints (Confirm All 3)
            </h4>

            {/* Check 1 */}
            <button
              onClick={() => toggleCheck('isolated')}
              className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                checks.isolated
                  ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {checks.isolated ? (
                <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-semibold">
                1. Upstream breaker turned OFF or gas cock turned 90°
              </span>
            </button>

            {/* Check 2 */}
            <button
              onClick={() => toggleCheck('verifiedZero')}
              className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                checks.verifiedZero
                  ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {checks.verifiedZero ? (
                <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-semibold">
                2. Live-Dead-Live meter verification reads 0.00V / 0 PSI
              </span>
            </button>

            {/* Check 3 */}
            <button
              onClick={() => toggleCheck('lotoApplied')}
              className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                checks.lotoApplied
                  ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {checks.lotoApplied ? (
                <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-semibold">
                3. Lockout/Tagout hasp and personal danger tag attached
              </span>
            </button>
          </div>

          {/* Photo Evidence Capture (Optional but recommended) */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-sky-400" />
                <span>Verification Photo Evidence</span>
              </span>
              <span className="text-[10px] text-slate-500">Multimeter 0.00V or Lockout Tag</span>
            </div>

            {evidencePhoto ? (
              <div className="relative rounded-lg overflow-hidden border border-emerald-500/50 max-h-32 flex items-center justify-center">
                <img src={evidencePhoto} alt="Evidence" className="w-full h-32 object-cover" />
                <button
                  onClick={() => setEvidencePhoto(null)}
                  className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white p-1 rounded-full text-xs"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-700 hover:border-amber-400/60 bg-slate-900/50 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Attach Photo of Meter Reading (0.00V) or Lockout Tag</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* Confirm & Unlock Guidance Button */}
            <button
              onClick={handleConfirmAndUnlock}
              disabled={!allChecksSatisfied}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                allChecksSatisfied
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.99] border-2 border-emerald-300'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('confirmAction')}</span>
            </button>

            {/* Abort & Call Supervisor Button */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => abortCurrentJob('Worker decided to abort due to high risk or lack of LOTO equipment')}
                className="w-full py-2.5 px-3 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-700/80 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{t('abortJob')}</span>
              </button>

              <button
                onClick={() => setShowSupervisorCall(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Supervisor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supervisor Emergency Card Drawer */}
        {showSupervisorCall && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              On-Call Superintendent & Master Tech
            </h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-white">Dave Martinez (Master Electrician / Field Super)</p>
              <p className="text-slate-400">Dispatch Line: (800) 555-4389 • Ext. 104</p>
              <p className="text-amber-400 font-mono text-[11px]">Safety Code: LOTO-STOP-HIGH-VOLTAGE</p>
            </div>
            <button
              onClick={() => setShowSupervisorCall(false)}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Close Contacts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
