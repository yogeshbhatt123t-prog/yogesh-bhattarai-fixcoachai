/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TradeType } from '../types';

export interface SampleScenario {
  id: string;
  trade: TradeType;
  title: string;
  equipment: string;
  notes: string;
  simulatedImagePrompt: string;
  isHardStop: boolean;
  hazardType: 'live_power' | 'gas' | 'pressure' | 'none';
  svgDataUri: string;
}

// Generate realistic technical diagram SVG data URIs for jobsite testing
function makeElectricalPanelSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="#1e293b"/>
    <rect x="80" y="40" width="440" height="370" fill="#334155" stroke="#94a3b8" stroke-width="4" rx="8"/>
    <rect x="110" y="70" width="380" height="310" fill="#0f172a" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Main Service Disconnect (200A) -->
    <rect x="240" y="90" width="120" height="60" fill="#dc2626" rx="4"/>
    <text x="300" y="125" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle">MAIN 200A [LIVE]</text>
    <!-- Busbars -->
    <line x1="260" y1="160" x2="260" y2="350" stroke="#f59e0b" stroke-width="12"/>
    <line x1="340" y1="160" x2="340" y2="350" stroke="#f59e0b" stroke-width="12"/>
    <!-- Exposed Branch Breakers -->
    <g fill="#475569" stroke="#64748b">
      <rect x="150" y="170" width="100" height="24" rx="2"/>
      <rect x="150" y="200" width="100" height="24" rx="2"/>
      <rect x="150" y="230" width="100" height="24" rx="2"/>
      <rect x="150" y="260" width="100" height="24" rx="2"/>
      <rect x="350" y="170" width="100" height="24" rx="2"/>
      <rect x="350" y="200" width="100" height="24" rx="2"/>
      <rect x="350" y="230" width="100" height="24" rx="2"/>
      <rect x="350" y="260" width="100" height="24" rx="2"/>
    </g>
    <!-- Loose / Discolored Neutral Wire -->
    <path d="M150 200 Q 180 320 220 340" stroke="#ef4444" stroke-width="6" fill="none"/>
    <circle cx="220" cy="340" r="10" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
    <text x="300" y="405" fill="#f87171" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">⚠ DANGER: 240V EXPOSED BUSBAR - HIGH RISK</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makePlumbingWaterHeaterSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="#0f172a"/>
    <!-- Water Tank -->
    <rect x="180" y="80" width="240" height="320" rx="30" fill="#3b82f6" opacity="0.3" stroke="#60a5fa" stroke-width="4"/>
    <text x="300" y="220" fill="#93c5fd" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">50-GAL WATER HEATER</text>
    <!-- T&P Valve on top right -->
    <rect x="390" y="110" width="50" height="30" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
    <!-- Discharge Pipe -->
    <rect x="425" y="140" width="16" height="220" fill="#b45309"/>
    <!-- Steam / Leaking Drops -->
    <circle cx="433" cy="375" r="8" fill="#38bdf8"/>
    <circle cx="433" cy="395" r="5" fill="#38bdf8"/>
    <!-- Pressure Warning Badge -->
    <rect x="190" y="120" width="140" height="50" rx="6" fill="#dc2626"/>
    <text x="260" y="145" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">150 PSI SCALD</text>
    <text x="260" y="160" fill="#fee2e2" font-family="sans-serif" font-size="10" text-anchor="middle">PRESSURIZED</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeHvacCapacitorSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="#020617"/>
    <!-- Outdoor AC Cabinet -->
    <rect x="60" y="40" width="480" height="370" fill="#1e293b" stroke="#475569" stroke-width="3" rx="10"/>
    <!-- Round Silver Capacitor Cylinder with Bulged Top -->
    <rect x="220" y="120" width="160" height="230" rx="40" fill="#94a3b8" stroke="#cbd5e1" stroke-width="3"/>
    <!-- Swollen top dome -->
    <ellipse cx="300" cy="120" rx="80" ry="25" fill="#f87171" stroke="#dc2626" stroke-width="3"/>
    <text x="300" y="125" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">BULGED TOP (BLOWN)</text>
    <!-- Three Terminals: C, HERM, FAN -->
    <circle cx="270" cy="95" r="12" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
    <text x="270" y="99" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">C</text>
    <circle cx="330" cy="95" r="12" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
    <text x="330" y="99" fill="#0f172a" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">HERM</text>
    <circle cx="300" cy="70" r="12" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
    <text x="300" y="74" fill="#0f172a" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">FAN</text>
    <text x="300" y="240" fill="#0f172a" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">45+5 uF 440VAC</text>
    <!-- Stored voltage alert -->
    <rect x="180" y="360" width="240" height="34" fill="#b91c1c" rx="4"/>
    <text x="300" y="382" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">⚡ STORED HIGH VOLTAGE CHARGE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeGasFurnaceSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="#0b0f19"/>
    <!-- Furnace Burner Compartment -->
    <rect x="70" y="50" width="460" height="350" fill="#1e293b" stroke="#3b82f6" stroke-width="2" rx="8"/>
    <!-- Gas Pipe & Valve -->
    <rect x="100" y="140" width="160" height="20" fill="#eab308"/>
    <!-- Yellow Gas Shutoff Valve Handle (Parallel = ON) -->
    <rect x="180" y="110" width="40" height="16" rx="3" fill="#ef4444"/>
    <text x="200" y="100" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">VALVE OPEN [GAS ON]</text>
    <!-- Burner Tube -->
    <rect x="270" y="160" width="210" height="80" fill="#334155" stroke="#64748b" rx="4"/>
    <!-- Flame Rod with Carbon film -->
    <line x1="380" y1="180" x2="380" y2="230" stroke="#94a3b8" stroke-width="6"/>
    <circle cx="380" cy="235" r="8" fill="#1e293b" stroke="#f59e0b" stroke-width="3"/>
    <text x="380" y="270" fill="#fde047" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Dirty Flame Sensor (No Microamps)</text>
    <rect x="150" y="340" width="300" height="40" rx="4" fill="#991b1b"/>
    <text x="300" y="365" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">🔥 FLAMMABLE NATURAL GAS / LPG</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeAmbiguousWiringSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="#0b0f19"/>
    <!-- Unmarked rusty enclosure -->
    <rect x="80" y="50" width="440" height="350" fill="#1e293b" stroke="#7f1d1d" stroke-width="4" rx="8"/>
    <!-- Tangled wire bundle -->
    <path d="M120 100 Q 220 280 340 180 T 480 300" stroke="#f59e0b" stroke-width="6" fill="none"/>
    <path d="M140 320 Q 280 80 360 260 T 460 120" stroke="#94a3b8" stroke-width="5" stroke-dasharray="8 4" fill="none"/>
    <path d="M160 180 Q 200 380 380 200 T 440 280" stroke="#ef4444" stroke-width="6" fill="none"/>
    <!-- Mystery Melted Relay -->
    <rect x="230" y="160" width="140" height="110" fill="#450a0a" stroke="#dc2626" stroke-width="3" rx="6"/>
    <text x="300" y="215" fill="#fca5a5" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">UNKNOWN RELAY</text>
    <text x="300" y="235" fill="#fecaca" font-family="sans-serif" font-size="11" text-anchor="middle">NO SCHEMATIC / 45% CONF</text>
    <!-- Warning Badge -->
    <rect x="150" y="340" width="300" height="40" rx="4" fill="#7f1d1d"/>
    <text x="300" y="365" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">❓ AMBIGUOUS WIRING (CONF: 0.45)</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'scen-elec-panel',
    trade: 'electrical',
    title: 'Exposed 240V Main Breaker & Arc Flash Hazard',
    equipment: 'Square D QO 200A Loadcenter with deadfront removed',
    notes: 'Worker called to investigate intermittent buzz; panel cover off with energized busbars exposed.',
    simulatedImagePrompt: 'Close-up of residential 200A circuit breaker panel with deadfront removed, showing main service lugs, 240V busbars, and loose neutral bus bar conductor.',
    isHardStop: true,
    hazardType: 'live_power',
    svgDataUri: makeElectricalPanelSvg(),
  },
  {
    id: 'scen-plumb-heater',
    trade: 'plumbing',
    title: 'Water Heater 150 PSI Relief Valve Discharge',
    equipment: 'A.O. Smith 50-Gal Gas Water Heater T&P Valve',
    notes: 'Constant scalding water drip from temperature and pressure relief pipe into drain pan.',
    simulatedImagePrompt: 'Water heater temperature and pressure relief valve dripping scalding water under tank pressure.',
    isHardStop: true,
    hazardType: 'pressure',
    svgDataUri: makePlumbingWaterHeaterSvg(),
  },
  {
    id: 'scen-hvac-cap',
    trade: 'hvac',
    title: 'Bulged Dual-Run Capacitor in AC Condenser',
    equipment: 'Carrier 3-Ton R410A Condenser - 45/5 uF 440V Capacitor',
    notes: 'Compressor humming but fan motor stalled; capacitor top dome visibly swollen with oil leak.',
    simulatedImagePrompt: 'Carrier outdoor AC condensing unit electrical compartment showing a swollen/bulged 45/5 MFD dual run capacitor with loose terminals.',
    isHardStop: true,
    hazardType: 'live_power',
    svgDataUri: makeHvacCapacitorSvg(),
  },
  {
    id: 'scen-hvac-gas',
    trade: 'hvac',
    title: 'Gas Furnace Ignition Lockout & Open Gas Valve',
    equipment: 'Lennox High-Efficiency Gas Furnace (Error Code 6+1)',
    notes: 'Furnace ignites for 3 seconds then drops flame; gas valve remains open on retry.',
    simulatedImagePrompt: 'Gas furnace burner box showing gas manifold, manual gas valve in open position, hot surface igniter, and soot-coated flame sensor rod.',
    isHardStop: true,
    hazardType: 'gas',
    svgDataUri: makeGasFurnaceSvg(),
  },
  {
    id: 'scen-low-confidence',
    trade: 'electrical',
    title: 'Unmarked Obsolete Relay Box (Low Confidence < 0.60)',
    equipment: 'Non-standard custom relay box with no schematics (Confidence: 0.45)',
    notes: 'Ambiguous unmarked wiring harness, non-OEM relays with discolored terminals, low confidence.',
    simulatedImagePrompt: 'Custom unlabelled junction enclosure with tangled non-standard wire colors and burned unmarked relays.',
    isHardStop: false,
    hazardType: 'live_power',
    svgDataUri: makeAmbiguousWiringSvg(),
  },
];
