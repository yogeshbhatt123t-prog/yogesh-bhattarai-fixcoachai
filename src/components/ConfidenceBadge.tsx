/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ConfidenceBadgeProps {
  score: number; // 0.0 to 1.0
  trade: string;
  shouldEscalate?: boolean;
  escalationReason?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  trade,
  shouldEscalate,
  escalationReason,
}) => {
  const { t } = useApp();
  const percentage = Math.round(score * 100);

  const isHigh = score >= 0.8;
  const isMed = score >= 0.6 && score < 0.8;
  const isLow = score < 0.6 || shouldEscalate;

  return (
    <div className="space-y-2">
      <div
        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
          isLow
            ? 'bg-red-950/40 border-red-700/80 text-red-200'
            : isMed
            ? 'bg-amber-950/40 border-amber-600/80 text-amber-200'
            : 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isLow
                ? 'bg-red-600/20 text-red-400'
                : isMed
                ? 'bg-amber-600/20 text-amber-400'
                : 'bg-emerald-600/20 text-emerald-400'
            }`}
          >
            {isLow ? (
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            ) : isMed ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider">
                {isLow ? t('confidenceLow') : isMed ? t('confidenceMed') : t('confidenceHigh')}
              </span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded bg-black/40">
                {percentage}%
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {isLow
                ? 'Procedure requires caution and supervisor confirmation'
                : isMed
                ? 'Standard field match. Verify local variations.'
                : 'High-confidence AI vision and procedure match'}
            </p>
          </div>
        </div>

        {/* Progress Pill Bar */}
        <div className="w-20 hidden sm:block">
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 ${
                isLow ? 'bg-red-500' : isMed ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Low Confidence Escalation Warning Callout */}
      {isLow && (
        <div className="bg-red-900/60 border border-red-500 p-3 rounded-xl flex items-start gap-2.5 text-xs text-red-100">
          <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-white">
              Supervisor Escalation Recommended
            </p>
            <p className="mt-0.5 text-red-200">
              {escalationReason ||
                'Because confidence is under 60% on safety-critical work, do not disassemble equipment without cross-checking with a licensed master technician.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
