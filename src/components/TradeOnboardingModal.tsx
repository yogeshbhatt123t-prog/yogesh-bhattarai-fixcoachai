/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TradeType, ExperienceLevel } from '../types';
import {
  Zap,
  Wrench,
  Wind,
  Hammer,
  Flame,
  Home,
  SlidersHorizontal,
  HardHat,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface TradeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRADES: { id: TradeType; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'electrical', title: 'Electrical', desc: 'Panels, 120V/240V circuits, breakers, LOTO verification', icon: Zap },
  { id: 'plumbing', title: 'Plumbing', desc: 'Water heaters, P-traps, pressure valves, pipe sweating', icon: Wrench },
  { id: 'hvac', title: 'HVAC & Heating', desc: 'Condensers, dual capacitors, gas furnaces, heat pumps', icon: Wind },
  { id: 'welding', title: 'Welding & Cutting', desc: 'Oxy-fuel, MIG/TIG, cylinder safety, high heat', icon: Flame },
  { id: 'carpentry', title: 'Carpentry & Framing', desc: 'Load-bearing walls, temporary shoring, fasteners', icon: Hammer },
  { id: 'appliance', title: 'Appliance Repair', desc: 'Washers, dryers, pumps, coin traps, motors', icon: SlidersHorizontal },
  { id: 'roofing', title: 'Roofing & Flashing', desc: 'Chimney flashing, shingles, OSHA fall protection', icon: Home },
  { id: 'general_maintenance', title: 'General Maintenance', desc: 'Commercial doors, hydraulics, facilities', icon: Wrench },
];

export const TradeOnboardingModal: React.FC<TradeOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { trade, setTrade, experienceLevel, setExperienceLevel, t } = useApp();
  const [selectedTrade, setSelectedTrade] = useState<TradeType>(trade);
  const [selectedExp, setSelectedExp] = useState<ExperienceLevel>(experienceLevel);

  if (!isOpen) return null;

  const handleFinish = () => {
    setTrade(selectedTrade);
    setExperienceLevel(selectedExp);
    localStorage.setItem('fixcoach_onboarded', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            <HardHat className="w-4 h-4" />
            <span>WELCOME TO FIXCOACH AI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Set Your Jobsite Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            FixCoach AI prioritizes safety rules and tailors step-by-step guidance based on your trade discipline and experience.
          </p>
        </div>

        {/* Trade Selection Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Select Your Primary Trade:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {TRADES.map((item) => {
              const isSelected = selectedTrade === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedTrade(item.id)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-sm'
                      : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Experience Level:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'apprentice' as ExperienceLevel, label: 'Apprentice', sub: 'Detailed Steps' },
              { id: 'junior' as ExperienceLevel, label: 'Journeyman', sub: 'Standard Specs' },
              { id: 'veteran' as ExperienceLevel, label: 'Master / Vet', sub: 'Fast Diagnosis' },
            ].map((lvl) => {
              const isSel = selectedExp === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedExp(lvl.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSel
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs">{lvl.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lvl.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Enter Jobsite Button */}
        <button
          onClick={handleFinish}
          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
        >
          <span>Launch FixCoach Copilot</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
