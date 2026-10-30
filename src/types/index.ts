/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TradeType =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'carpentry'
  | 'welding'
  | 'roofing'
  | 'appliance'
  | 'general_maintenance';

export type ExperienceLevel = 'apprentice' | 'junior' | 'veteran';

export type SafetySeverity = 'HARD_STOP' | 'WARNING' | 'INFO';

export interface SafetyFlag {
  type: SafetySeverity;
  reason: string;
  action_required: string;
  confirmed?: boolean;
  evidencePhoto?: string;
  timestamp?: string;
}

export interface StepItem {
  step_number: number;
  title: string;
  instruction: string;
  safety_note?: string;
  requires_confirmation?: boolean;
  confirmation_prompt?: string;
  tools_needed?: string[];
  warnings?: string[];
  completed?: boolean;
  completed_at?: string;
}

export interface DiagnosisResult {
  summary: string;
  trade: TradeType;
  likely_issue: string;
  confidence: number; // 0.0 - 1.0
}

export interface EscalationInfo {
  should_escalate: boolean;
  reason?: string;
  recommendation?: string;
}

export interface SafetyInfo {
  flags: SafetyFlag[];
  requires_hard_stop: boolean;
  ppe_recommended: string[];
}

export interface AIResponseData {
  diagnosis: DiagnosisResult;
  safety: SafetyInfo;
  steps: StepItem[];
  escalation: EscalationInfo;
}

export interface JobRecord {
  id: string;
  trade: TradeType;
  title: string;
  description: string;
  location_context?: string;
  status: 'in_progress' | 'completed' | 'escalated' | 'aborted';
  confidence_score: number;
  language: string;
  created_at: string;
  updated_at: string;
  media: {
    id: string;
    type: 'photo' | 'video_frame' | 'evidence';
    dataUrl: string;
    is_safety_evidence?: boolean;
    timestamp: string;
  }[];
  steps: StepItem[];
  safety_flags: SafetyFlag[];
  safety_logs: {
    id: string;
    trigger: string;
    reason: string;
    action_taken: string;
    timestamp: string;
    evidence_url?: string;
  }[];
  notes?: string[];
}

export interface Procedure {
  id: string;
  trade: TradeType;
  title: string;
  category: string;
  content: string;
  safety_critical: boolean;
  safety_tags: string[]; // ["live_power", "gas", "pressure", "chemical"]
  tools_required: string[];
  ppe_required: string[];
  offline_cacheable: boolean;
  steps: StepItem[];
}
