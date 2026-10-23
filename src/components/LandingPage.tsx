/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Zap, 
  Sparkles, 
  Target, 
  Clock, 
  BookOpen, 
  Award, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  ShieldCheck,
  TrendingUp,
  RotateCw
} from 'lucide-react';
import { GATE_EE_SUBJECTS, GATE_EE_PSU_CUTOFFS } from '../data/gateData';
import { NavTab } from './Navigation';

interface Props {
  onGetStarted: () => void;
  onNavigateTab: (tab: NavTab) => void;
  daysRemaining: number;
}

export const LandingPage: React.FC<Props> = ({
  onGetStarted,
  onNavigateTab,
  daysRemaining
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-14 shadow-2xl">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart GATE Preparation Tracker &bull; Electrical Engineering (EE)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Engineer your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">All India Rank &lt; 100</span> with AI Precision.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Personalised GATE EE study platform that diagnoses your calculation errors, predicts your All India Rank, schedules spaced repetition revisions, and provides interactive 3D Electrical Machines cutaways.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('mock')}
              className="px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm shadow transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-current" />
              <span>Simulate Full Mock Test</span>
            </button>

            <button
              onClick={() => onNavigateTab('visualizer')}
              className="px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm shadow transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>3D EE Lab</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-black font-mono text-amber-400">{daysRemaining}</div>
              <div className="text-xs text-slate-400">Days to GATE Exam</div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-white">11</div>
              <div className="text-xs text-slate-400">EE Subjects Mapped</div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-emerald-400">100%</div>
              <div className="text-xs text-slate-400">Official Verified PYQs</div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-cyan-400">AIR 1</div>
              <div className="text-xs text-slate-400">Benchmark Modeling</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-white">
            Built Specifically for GATE Electrical Engineering
          </h2>
          <p className="text-xs text-slate-400">
            Every feature is engineered to tackle the exact pain points of GATE EE aspirants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-3 hover:border-slate-700 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interactive 3D EE Studio</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore 3D cutaway synchronous machines, power grid pylons, and the 11-subject syllabus galaxy rendered with studio PBR materials and zero external dependencies.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-3 hover:border-slate-700 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">TCS iON Mock Simulator</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experience the actual examination interface with color-coded question palette, built-in virtual scientific calculator, timer countdown, and GATE negative marking.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-3 hover:border-slate-700 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Weakness AI Recommendations</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Algorithmic diagnostic engine categorizes your mistakes (calculation error vs formula gap) and automatically prioritizes weak subjects in your daily planner.
            </p>
          </div>
        </div>
      </section>

      {/* 11 Subjects Overview */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Official GATE Electrical Engineering Subjects Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Historical weightage marks and complete topic coverage mapped for GATE.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('subjects')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Explore All Topics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GATE_EE_SUBJECTS.map(s => (
            <div
              key={s.id}
              onClick={() => onNavigateTab('subjects')}
              className="p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <div>
                  <span className="text-xs font-bold text-white block">{s.name}</span>
                  <span className="text-[10px] text-slate-400">{s.topics.length} Syllabus Modules</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                {s.approxMarks}M
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* PSU Cutoffs Banner */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">GATE EE PSU Recruitment Targets</h2>
        </div>
        <p className="text-xs text-slate-400">
          Target scores for Executive Trainee recruitment at Maharatna & Navratna PSUs:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GATE_EE_PSU_CUTOFFS.slice(0, 3).map(psu => (
            <div key={psu.org} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <span className="text-xs font-bold text-white block">{psu.org}</span>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                {psu.expectedMarks} Marks
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">{psu.posts}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
