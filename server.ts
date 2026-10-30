/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { CURATED_PROCEDURES } from './src/data/procedures.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Generous payload limit for high-res jobsite camera photos
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-memory persistent session stores (mimics database for MVP)
const jobsStore: Map<string, any> = new Map();
const safetyLogsStore: any[] = [];

// Initialize Gemini SDK with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt strictly enforcing safety, imperative instructions, and professional tone
const SYSTEM_PROMPT = `# FixCoach AI - System Prompt

You are FixCoach AI, an expert AI coach built specifically for professional trades workers (plumbers, electricians, HVAC, welders, carpenters, roofers, masons, painters, landscapers, appliance repair, solar, general maintenance). You are NOT a DIY chatbot - you are a jobsite safety-focused assistant for trained/skilled workers.

## Core Principles
- SAFETY FIRST: If there is ANY ambiguity about electrical, gas, or pressurized systems, you MUST issue a HARD STOP and require explicit confirmation before proceeding.
- Clarity for the jobsite: Use short, direct instructions. Assume worker has basic trade knowledge but needs step guidance.
- Practical: Focus on real procedures, common issues, required tools/PPE.
- Honest about confidence: If uncertain, say so and recommend escalation to supervisor/human expert.
- No guessing: Better to ask for clarification or stop than guess on safety-critical items.

## Safety Rules (MANDATORY)
1. **Electrical**: If panel is open/exposed conductors visible, or power status unknown -> HARD STOP. Require: "Turn off power at breaker/disconnect", lockout/tagout if applicable, verification with tester. Demand confirmation + photo evidence if possible.
2. **Gas**: If gas line/meter/appliance involved and status unknown -> HARD STOP. Require gas shutoff confirmation.
3. **Pressure**: Boilers/water heaters under pressure -> require depressurization confirmation.
4. **Ambiguity**: On safety-critical items, err on side of stopping.
5. **Always offer abort**: Include "STOP & GET HELP" option.

## Response Format
For every diagnosis/guidance response, return structured JSON adhering to the provided schema with:
- diagnosis: summary, trade, likely_issue, confidence (0.0-1.0)
- safety: flags (type HARD_STOP, WARNING, INFO; reason, action_required), requires_hard_stop (boolean), ppe_recommended (array)
- steps: array of {step_number, title, instruction, safety_note, requires_confirmation, confirmation_prompt, tools_needed, warnings}
- escalation: should_escalate, reason, recommendation

Keep instructions concise (1-3 sentences per step). Use imperative verbs ("Turn off", "Verify", "Unthread"). Respond in the user's requested language.`;

// Safety Rules Engine Pre-Check
function assessSafetyPreCheck(trade: string, textContext: string = '') {
  const flags: any[] = [];
  const textLower = textContext.toLowerCase();

  // Electrical check
  if (
    trade === 'electrical' ||
    textLower.includes('panel') ||
    textLower.includes('breaker') ||
    textLower.includes('wire') ||
    textLower.includes('voltage') ||
    textLower.includes('shock') ||
    textLower.includes('conductor') ||
    textLower.includes('capacitor')
  ) {
    flags.push({
      type: 'HARD_STOP',
      reason: 'Potential live 120V/240V/480V electrical energy or unverified circuit de-energization.',
      action_required: 'Trip upstream breaker/disconnect, affix Lockout/Tagout hasp, and prove zero voltage with a calibrated CAT-III tester (Live-Dead-Live check).',
    });
  }

  // Gas check
  if (
    textLower.includes('gas') ||
    textLower.includes('furnace') ||
    textLower.includes('meter') ||
    textLower.includes('propane') ||
    textLower.includes('lpg') ||
    textLower.includes('pilot') ||
    textLower.includes('burner')
  ) {
    flags.push({
      type: 'HARD_STOP',
      reason: 'Combustible fuel gas (natural gas/methane or propane) hazard detected.',
      action_required: 'Close manual gas supply valve 90 degrees perpendicular to pipe. Perform bubble leak check before and after service.',
    });
  }

  // Pressure check
  if (
    trade === 'plumbing' &&
    (textLower.includes('water heater') ||
      textLower.includes('boiler') ||
      textLower.includes('t&p') ||
      textLower.includes('relief') ||
      textLower.includes('steam') ||
      textLower.includes('expansion tank'))
  ) {
    flags.push({
      type: 'HARD_STOP',
      reason: 'Closed pressurized hydraulic system under scalding heat and up to 150 PSI.',
      action_required: 'De-energize heating element/gas burner, shut cold water inlet, open nearest faucet to relieve vacuum, and drain water below port level.',
    });
  }

  return {
    requires_hard_stop: flags.some((f) => f.type === 'HARD_STOP'),
    flags,
  };
}

// Fallback generator when offline or API key absent
function generateFallbackDiagnosis(trade: string, notes: string = '', language: string = 'en-US') {
  const matchingProcs = CURATED_PROCEDURES.filter((p) => p.trade === trade);
  const selectedProc = matchingProcs[0] || CURATED_PROCEDURES[0];

  const safetyCheck = assessSafetyPreCheck(trade, `${notes} ${selectedProc.title} ${selectedProc.content}`);

  const isAmbiguous =
    notes.toLowerCase().includes('ambiguous') ||
    notes.toLowerCase().includes('unmarked') ||
    notes.toLowerCase().includes('low confidence');
  const confidenceScore = isAmbiguous ? 0.45 : 0.92;

  return {
    diagnosis: {
      summary: `${selectedProc.title} - ${selectedProc.category}`,
      trade: selectedProc.trade,
      likely_issue: notes || `Standard field maintenance and diagnostic protocol for ${selectedProc.category}.`,
      confidence: confidenceScore,
    },
    safety: {
      flags: safetyCheck.flags.length > 0
        ? safetyCheck.flags
        : [
            {
              type: 'WARNING',
              reason: 'Standard jobsite safety protocols apply.',
              action_required: 'Wear designated PPE and verify work area is free of tripping or pinch hazards.',
            },
          ],
      requires_hard_stop: safetyCheck.requires_hard_stop || selectedProc.safety_critical,
      ppe_recommended: selectedProc.ppe_required,
    },
    steps: selectedProc.steps,
    escalation: {
      should_escalate: confidenceScore < 0.6,
      reason: confidenceScore < 0.6 ? 'Low model confidence score under 0.60 on ambiguous equipment.' : '',
      recommendation: confidenceScore < 0.6 ? 'Escalate to licensed master tradesperson or job superintendent.' : 'Verify against local code requirements.',
    },
  };
}

// ---------------- API ROUTES ----------------

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'FixCoach AI',
    version: '1.0.0',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Current User Profile / Mock Auth
app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({
    id: 'user_master_tech_001',
    name: 'Field Tradesperson',
    trade: 'electrical',
    experience_level: 'veteran',
    language: 'en-US',
    crew_id: 'crew_chicago_metro_4',
  });
});

// Multimodal Diagnosis Endpoint
app.post('/api/diagnose', async (req: Request, res: Response) => {
  try {
    const { imageBase64, trade = 'electrical', language = 'en-US', notes = '', locationContext = '' } = req.body;

    const safetyPreCheck = assessSafetyPreCheck(trade, `${notes} ${locationContext}`);

    if (!ai) {
      // Fallback seamlessly to procedure matching
      const fallbackResult = generateFallbackDiagnosis(trade, notes, language);
      return res.json(fallbackResult);
    }

    // Call Gemini 3.8 Flash model
    const promptText = `
Tradesperson Job Information:
- Primary Trade: ${trade}
- Requested Language: ${language}
- Worker Observation / Problem Note: ${notes || 'No worker notes provided'}
- Location Context: ${locationContext || 'Jobsite'}

Analyze the equipment shown in the image with extreme attention to jobsite safety hazards (live electrical, combustible gas, pressure, fall risks, structural compromise).
If safety is in question, enforce a HARD STOP immediately.
Respond strictly in JSON matching the defined schema in ${language}.
`;

    const contents: any = [];

    if (imageBase64 && imageBase64.includes(',')) {
      const [header, base64Data] = imageBase64.split(',');
      const mimeMatch = header.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                trade: { type: Type.STRING },
                likely_issue: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['summary', 'trade', 'likely_issue', 'confidence'],
            },
            safety: {
              type: Type.OBJECT,
              properties: {
                flags: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      action_required: { type: Type.STRING },
                    },
                    required: ['type', 'reason', 'action_required'],
                  },
                },
                requires_hard_stop: { type: Type.BOOLEAN },
                ppe_recommended: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['flags', 'requires_hard_stop', 'ppe_recommended'],
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step_number: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  instruction: { type: Type.STRING },
                  safety_note: { type: Type.STRING },
                  requires_confirmation: { type: Type.BOOLEAN },
                  confirmation_prompt: { type: Type.STRING },
                  tools_needed: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  warnings: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['step_number', 'title', 'instruction'],
              },
            },
            escalation: {
              type: Type.OBJECT,
              properties: {
                should_escalate: { type: Type.BOOLEAN },
                reason: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ['should_escalate'],
            },
          },
          required: ['diagnosis', 'safety', 'steps', 'escalation'],
        },
      },
    });

    const responseText = response.text || '{}';
    let parsedData = JSON.parse(responseText);

    // Enforce our mandatory safety rules engine pre-check on top of model output
    if (safetyPreCheck.requires_hard_stop) {
      parsedData.safety.requires_hard_stop = true;
      safetyPreCheck.flags.forEach((flag) => {
        if (!parsedData.safety.flags.some((f: any) => f.reason === flag.reason)) {
          parsedData.safety.flags.unshift(flag);
        }
      });
    }

    // Gating: If confidence is lower than 0.60 on safety-critical trade, flag escalation
    if (parsedData.diagnosis.confidence < 0.6) {
      parsedData.escalation.should_escalate = true;
      parsedData.escalation.reason = 'Low model confidence score under 0.60 in safety-sensitive environment.';
      parsedData.escalation.recommendation = 'Stop work. Contact job superintendent or master license holder for physical inspection.';
    }

    res.json(parsedData);
  } catch (err: any) {
    console.error('Error in /api/diagnose:', err);
    // Graceful fallback to procedure dataset
    const fallbackResult = generateFallbackDiagnosis(
      req.body.trade || 'electrical',
      req.body.notes || '',
      req.body.language || 'en-US'
    );
    res.json(fallbackResult);
  }
});

// Search Procedures
app.post('/api/search/procedures', (req: Request, res: Response) => {
  const { query = '', trade } = req.body;
  const q = String(query).toLowerCase();

  let results = CURATED_PROCEDURES;
  if (trade) {
    results = results.filter((p) => p.trade === trade);
  }
  if (q.trim()) {
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.safety_tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  res.json({ results, total: results.length });
});

// Offline Manifest
app.get('/api/offline/manifest', (req: Request, res: Response) => {
  const tradeGroups: Record<string, number> = {};
  CURATED_PROCEDURES.forEach((p) => {
    tradeGroups[p.trade] = (tradeGroups[p.trade] || 0) + 1;
  });

  res.json({
    version: '1.2.0',
    total_procedures: CURATED_PROCEDURES.length,
    trades: tradeGroups,
    storage_size_approx: '245 KB',
  });
});

// Offline Sync (Procedure Bundle Download)
app.post('/api/offline/sync', (req: Request, res: Response) => {
  const { trade } = req.body;
  let pack = CURATED_PROCEDURES;
  if (trade) {
    pack = pack.filter((p) => p.trade === trade);
  }
  res.json({
    trade: trade || 'all',
    synced_at: new Date().toISOString(),
    procedures: pack,
  });
});

// Log Safety Incidents / Confirmations (Audit Trail)
app.post('/api/safety/report', (req: Request, res: Response) => {
  const { jobId, trigger, reason, action_taken, evidence_url } = req.body;
  const record = {
    id: `safety_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    jobId: jobId || 'unassigned_job',
    trigger: trigger || 'HARD_STOP',
    reason,
    action_taken,
    evidence_url,
    timestamp: new Date().toISOString(),
  };

  safetyLogsStore.unshift(record);

  if (jobId && jobsStore.has(jobId)) {
    const job = jobsStore.get(jobId);
    job.safety_logs = job.safety_logs || [];
    job.safety_logs.unshift(record);
    jobsStore.set(jobId, job);
  }

  res.json({ success: true, record });
});

// Job History & Save Job
app.get('/api/jobs/history', (req: Request, res: Response) => {
  const jobs = Array.from(jobsStore.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.json({ jobs, count: jobs.length });
});

app.post('/api/jobs/history', (req: Request, res: Response) => {
  const job = req.body;
  if (!job.id) {
    job.id = `job_${Date.now()}`;
  }
  job.updated_at = new Date().toISOString();
  if (!job.created_at) {
    job.created_at = job.updated_at;
  }
  jobsStore.set(job.id, job);
  res.json({ success: true, job });
});

import http from 'http';

// ---------------- DEVELOPMENT & PRODUCTION STATIC SERVING ----------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProduction) {
    // Mount Vite middlewares in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`FixCoach AI server listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  startServer();
}
