/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useApp } from '../context/AppContext';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  PhoneCall,
  AlertOctagon,
  X,
  UserCheck,
} from 'lucide-react';

interface CameraViewProps {
  onDiagnosisComplete: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onDiagnosisComplete }) => {
  const {
    videoRef,
    isActive,
    error: cameraError,
    facingMode,
    hasTorch,
    torchOn,
    startCamera,
    stopCamera,
    toggleTorch,
    flipCamera,
    capturePhoto,
  } = useCamera();

  const {
    trade,
    language,
    gloveMode,
    startDiagnosis,
    isDiagnosing,
    activeDiagnosis,
    t,
  } = useApp();

  const [notes, setNotes] = useState('');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Confidence & Supervisor Escalation state
  const [confidenceScore, setConfidenceScore] = useState<number | null>(
    activeDiagnosis ? activeDiagnosis.diagnosis.confidence : null
  );
  const [escalationReason, setEscalationReason] = useState<string | null>(
    activeDiagnosis?.escalation?.reason || null
  );
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);

  // Auto-start camera when on Camera tab
  useEffect(() => {
    startCamera('environment');
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Handle capture and call AI diagnosis
  const handleSnapAndDiagnose = async () => {
    let photoData = capturedPreview;
    if (!photoData) {
      photoData = capturePhoto();
    }

    if (!photoData) {
      // If camera wasn't available or couldn't capture, fallback to sample scenario
      const sample = SAMPLE_SCENARIOS.find((s) => s.trade === trade) || SAMPLE_SCENARIOS[0];
      photoData = sample.svgDataUri;
    }

    const result = await startDiagnosis(photoData, notes);
    if (result) {
      const score = result.diagnosis.confidence;
      setConfidenceScore(score);
      setEscalationReason(
        result.escalation?.reason ||
          'AI vision model confidence is below 0.60 (60%). In accordance with jobsite safety protocols, verify with a supervisor before proceeding.'
      );

      // If confidence is below 0.60, conditionally show the Escalate banner in CameraView
      if (score < 0.6) {
        // Keep worker on CameraView with prominent Escalate banner
        return;
      }

      onDiagnosisComplete();
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Load a sample scenario directly
  const handleSelectScenario = async (scenario: (typeof SAMPLE_SCENARIOS)[0]) => {
    setCapturedPreview(scenario.svgDataUri);
    setNotes(scenario.notes);
    const result = await startDiagnosis(scenario.svgDataUri, scenario.notes);
    if (result) {
      const score = result.diagnosis.confidence;
      setConfidenceScore(score);
      setEscalationReason(
        result.escalation?.reason ||
          'AI vision model confidence is below 0.60 (60%). In accordance with jobsite safety protocols, verify with a supervisor before proceeding.'
      );

      if (score < 0.6) {
        // Keep worker on CameraView with prominent Escalate banner
        return;
      }

      onDiagnosisComplete();
    }
  };

  const isLowConfidence = confidenceScore !== null && confidenceScore < 0.6;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Conditionally Rendered 'Escalate to Supervisor' Banner (When Confidence < 0.6) */}
      {isLowConfidence && (
        <div className="relative rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500 shadow-2xl p-4 sm:p-5 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center flex-shrink-0 text-red-400 animate-bounce">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white tracking-wider">
                    SAFETY ACTION REQUIRED
                  </span>
                  <span className="text-xs font-mono font-bold text-red-300 px-2 py-0.5 rounded bg-red-950/80 border border-red-700">
                    Confidence: {Math.round(confidenceScore * 100)}% (&lt; 60% Threshold)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Escalate to Supervisor
                </h3>
                <p className="text-xs sm:text-sm text-red-200 leading-relaxed font-medium">
                  {escalationReason ||
                    'AI vision confidence score is below 0.6 (60%) for this equipment. In accordance with trade safety rules, stop work and consult your field superintendent or master license holder before proceeding.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setConfidenceScore(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Dismiss Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-red-800/80">
            <button
              onClick={() => setShowSupervisorModal(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Supervisor (Dispatch)</span>
            </button>

            <button
              onClick={onDiagnosisComplete}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <span>Proceed to Guide (With Caution)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setCapturedPreview(null);
                setConfidenceScore(null);
                startCamera();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Clearer Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Viewfinder Card */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl aspect-[4/3] sm:aspect-[16/10] max-h-[580px] flex items-center justify-center">
        {/* Real Camera Stream */}
        {capturedPreview ? (
          <img
            src={capturedPreview}
            alt="Captured jobsite"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* HUD Targeting Reticle & Safety Crosshairs Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
          {/* Top HUD Header */}
          <div className="flex items-center justify-between">
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                {trade.toUpperCase()} VISION SENSOR
              </span>
            </div>

            <div className="bg-amber-500/20 backdrop-blur-md px-2.5 py-1 rounded-md border border-amber-500/40 text-[11px] font-bold text-amber-300">
              SAFETY ENGINE ACTIVE
            </div>
          </div>

          {/* Center Targeting Bracket */}
          <div className="relative flex-1 flex items-center justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 border border-amber-500/30 rounded-2xl flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

              {/* Crosshair Center */}
              <div className="w-6 h-6 border border-sky-400/80 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
              </div>

              {/* Laser Scanning Animation Bar */}
              {isDiagnosing && (
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-lg shadow-amber-400 animate-pulse" />
              )}
            </div>
          </div>

          {/* Bottom HUD Hint */}
          <div className="text-center">
            <p className="inline-block bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-300 font-medium border border-slate-800">
              {capturedPreview ? 'Image captured. Tap Diagnose to analyze.' : t('cameraPrompt')}
            </p>
          </div>
        </div>

        {/* Camera Permission or Initialization Error message banner */}
        {cameraError && !capturedPreview && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20">
            <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">Live Camera Feed Notice</h4>
            <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
              {cameraError}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Photo from Device
              </button>
              <button
                onClick={() => startCamera('environment')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs hover:bg-slate-700 flex items-center gap-2 border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Camera
              </button>
            </div>
          </div>
        )}

        {/* Analyzing / Diagnosing Full Overlay */}
        {isDiagnosing && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
              <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white mb-1">
              Analyzing Equipment & Evaluating Safety
            </h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Multimodal vision scan checking for live 240V energy, gas lines, high pressure, and NEC/OSHA safety guardrails...
            </p>
          </div>
        )}
      </div>

      {/* Main Glove-Friendly Action Buttons Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-xl">
        {/* Flip Camera */}
        <button
          onClick={flipCamera}
          title={t('flipCamera')}
          className={`rounded-xl flex items-center justify-center transition-all bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 ${
            gloveMode ? 'w-16 h-16' : 'w-12 h-12 sm:w-14 sm:h-14'
          }`}
        >
          <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Flashlight / Torch (if available) */}
        {hasTorch && (
          <button
            onClick={toggleTorch}
            title={torchOn ? t('torchOff') : t('torchOn')}
            className={`rounded-xl flex items-center justify-center transition-all border ${
              torchOn
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            } ${gloveMode ? 'w-16 h-16' : 'w-12 h-12 sm:w-14 sm:h-14'}`}
          >
            {torchOn ? <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <ZapOff className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        )}

        {/* Primary Snap & Diagnose Button (Huge 56px-64px) */}
        <button
          onClick={handleSnapAndDiagnose}
          disabled={isDiagnosing}
          className={`flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black tracking-wide flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all border-2 border-amber-300 ${
            gloveMode ? 'h-18 text-base sm:text-lg' : 'h-14 sm:h-16 text-sm sm:text-base'
          }`}
        >
          <Camera className="w-6 h-6 text-slate-950" />
          <span>{capturedPreview ? 'Diagnose Photo' : t('capturePhoto')}</span>
        </button>

        {/* Upload Custom Photo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title={t('uploadPhoto')}
          className={`rounded-xl flex items-center justify-center transition-all bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 ${
            gloveMode ? 'w-16 h-16' : 'w-12 h-12 sm:w-14 sm:h-14'
          }`}
        >
          <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Retake Button if image is loaded */}
        {capturedPreview && (
          <button
            onClick={() => {
              setCapturedPreview(null);
              setConfidenceScore(null);
              startCamera();
            }}
            title={t('retake')}
            className={`rounded-xl flex items-center justify-center bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/60 ${
              gloveMode ? 'w-16 h-16' : 'w-12 h-12 sm:w-14 sm:h-14'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Worker Observation / Symptom Notes Input */}
      <div className="bg-slate-900/70 p-3 sm:p-4 rounded-xl border border-slate-800">
        <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>Worker Jobsite Notes & Observations (Optional)</span>
          <span className="text-[10px] text-slate-500 font-normal">Passed to AI Vision diagnosis</span>
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Buzzing sound on phase B, breaker warm to touch, gas odor near burner..."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Quick Test Scenarios Carousel (P0 Jobsite Presets) */}
      <div className="bg-slate-900/60 rounded-xl p-3 sm:p-4 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {t('sampleScenarios')}
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">1-click test with real diagrams</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          {SAMPLE_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleSelectScenario(scenario)}
              className="text-left bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 p-2.5 rounded-xl transition-all flex items-center gap-3 group"
            >
              <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-700/80 overflow-hidden flex-shrink-0">
                <img
                  src={scenario.svgDataUri}
                  alt={scenario.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase px-1 rounded bg-slate-800 text-amber-300 border border-amber-500/20">
                    {scenario.trade}
                  </span>
                  {scenario.isHardStop && (
                    <span className="text-[9px] font-bold uppercase px-1 rounded bg-red-950 text-red-300 border border-red-800">
                      Hard Stop
                    </span>
                  )}
                  {scenario.id === 'scen-low-confidence' && (
                    <span className="text-[9px] font-bold uppercase px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Conf &lt; 0.6
                    </span>
                  )}
                </div>
                <h5 className="text-xs font-bold text-slate-100 truncate mt-0.5">
                  {scenario.title}
                </h5>
                <p className="text-[11px] text-slate-400 truncate">
                  {scenario.equipment}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* On-Call Supervisor Emergency Modal */}
      {showSupervisorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border-2 border-red-500 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-red-400" />
                <span>On-Call Supervisor Dispatch</span>
              </h3>
              <button
                onClick={() => setShowSupervisorModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Field Superintendent:</span>
                <p className="font-bold text-white text-sm">Dave Martinez (Master Tech)</p>
              </div>
              <div>
                <span className="text-slate-400">Direct Phone:</span>
                <p className="font-mono text-amber-400 font-bold">(800) 555-4389 • Ext. 104</p>
              </div>
              <div>
                <span className="text-slate-400">Current Jobsite Dispatch ID:</span>
                <p className="font-mono text-slate-300 text-[11px]">JOB-CONF-ESCALATE-045</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Advise superintendent that camera AI confidence was below 60% and request on-site inspection or authorized wiring submittals.
            </p>

            <button
              onClick={() => setShowSupervisorModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Contacts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
