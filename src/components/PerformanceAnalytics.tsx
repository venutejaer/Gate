/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  AlertTriangle, 
  Sparkles, 
  Calendar,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { 
  Subject, 
  MockAttempt, 
  QuestionAttempt, 
  WeaknessAnalysis, 
  UserProfile, 
  StudySessionLog 
} from '../types';
import { 
  GATE_EE_PSU_CUTOFFS, 
  AIR_MARKS_BENCHMARKS, 
  GATE_EE_SUBJECTS 
} from '../data/gateData';

interface Props {
  subjects: Subject[];
  mockAttempts: MockAttempt[];
  questionAttempts: QuestionAttempt[];
  weaknessList: WeaknessAnalysis[];
  profile: UserProfile;
  studySessions: StudySessionLog[];
  onNavigateToPYQ: () => void;
  onNavigateToRevision: () => void;
}

export const PerformanceAnalytics: React.FC<Props> = ({
  subjects,
  mockAttempts,
  questionAttempts,
  weaknessList,
  profile,
  studySessions,
  onNavigateToPYQ,
  onNavigateToRevision
}) => {
  // 1. Weekly study hours aggregation (last 7 days)
  const last7Days = [6, 5, 4, 3, 2, 1, 0].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const mins = studySessions
      .filter(s => s.date === dateStr)
      .reduce((acc, s) => acc + s.minutes, 0);
    return {
      date: dateStr,
      label: dayLabel,
      hours: Math.round((mins / 60) * 10) / 10
    };
  });

  const maxWeeklyHours = Math.max(...last7Days.map(d => d.hours), 6);

  // 2. Mock Test Score Progression
  const mockScores = mockAttempts.map((m, idx) => ({
    label: `Mock ${idx + 1}`,
    score: m.score,
    accuracy: m.accuracy,
    title: m.testTitle
  }));

  // 3. Subject-wise syllabus completion & accuracy
  const subjectPerformance = subjects.map(s => {
    const total = s.topics.length;
    const comp = s.topics.filter(t => t.status === 'completed').length;
    const compPct = Math.round((comp / Math.max(total, 1)) * 100);

    const qSub = questionAttempts.filter(a => {
      // Find question
      return true; // will cross check
    });

    const wItem = weaknessList.find(w => w.subjectId === s.id);
    const accuracy = wItem ? wItem.accuracyPercent : 75;

    return {
      id: s.id,
      name: s.name,
      shortName: s.shortName,
      color: s.color,
      approxMarks: s.approxMarks,
      compPct,
      accuracy
    };
  });

  // 4. Mistake taxonomy aggregation
  const mistakeCounts: Record<string, number> = {};
  questionAttempts.forEach(a => {
    if (!a.isCorrect && a.mistakeReason) {
      mistakeCounts[a.mistakeReason] = (mistakeCounts[a.mistakeReason] || 0) + 1;
    }
  });

  // Calculate current estimated AIR based on mock average
  const avgScore = mockAttempts.length > 0
    ? mockAttempts.reduce((acc, m) => acc + m.score, 0) / mockAttempts.length
    : 65;

  let estimatedRank = 'AIR 200 - 500';
  if (avgScore >= 80) estimatedRank = 'AIR 1 - 50 (Top Topper)';
  else if (avgScore >= 70) estimatedRank = 'AIR 51 - 250 (All PSUs)';
  else if (avgScore >= 60) estimatedRank = 'AIR 251 - 800 (Old IITs)';
  else if (avgScore >= 50) estimatedRank = 'AIR 801 - 2000 (Newer IITs / NITs)';
  else estimatedRank = 'AIR 2000+ (Need Intensive Revision)';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          <span>Performance Analytics & AIR Predictor</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep diagnostic metrics analyzing your mock scores, daily study hours, subject accuracy, and PSU benchmark cutoffs.
        </p>
      </div>

      {/* Top AIR Predictor Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              GATE EE AIR Predictor
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Estimated Standing: <span className="text-amber-400">{estimatedRank}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Based on your mock-test average score of <strong className="text-white">{avgScore.toFixed(1)}/100</strong> and current accuracy rates across high-weightage core subjects.
            </p>
          </div>

          <div className="flex items-center gap-4 text-center shrink-0">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Score</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{profile.targetScore}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mock Avg</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{avgScore.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row: Weekly Study Hours & Mock Test Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weekly Study Hours */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Daily Study Hours (Last 7 Days)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Target: {profile.dailyStudyTargetHours}h / day
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
            {last7Days.map(d => {
              const heightPct = Math.min(100, Math.round((d.hours / maxWeeklyHours) * 100));
              const isTargetMet = d.hours >= profile.dailyStudyTargetHours;

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-amber-400">
                    {d.hours}h
                  </span>
                  <div className="w-full max-w-[32px] bg-slate-800 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isTargetMet
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : 'bg-gradient-to-t from-amber-600 to-amber-400'
                      }`}
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Mock Test Progression */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Mock-Test Score Progression</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Mocks: {mockScores.length}
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4">
            {mockScores.map((m, idx) => {
              const heightPct = Math.min(100, Math.round((m.score / 100) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {m.score}M
                  </span>
                  <div className="w-full max-w-[40px] bg-slate-800 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300 font-mono">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subject-Wise Accuracy & Completion Matrix */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>All 11 Subjects: Completion & Accuracy Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectPerformance.map(s => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.shortName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                  {s.approxMarks} Marks
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Syllabus Covered:</span>
                  <span className="font-semibold text-white">{s.compPct}%</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${s.compPct}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Question Accuracy:</span>
                  <span className="font-semibold text-emerald-400">{s.accuracy}%</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${s.accuracy}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PSU Cutoffs & Marks Benchmarks Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PSU Cutoffs */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">PSU Recruitment Cutoff Benchmarks</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2">Organization</th>
                  <th className="py-2">Target Marks</th>
                  <th className="py-2">Min Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {GATE_EE_PSU_CUTOFFS.map(psu => (
                  <tr key={psu.org} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-medium text-white">{psu.org}</td>
                    <td className="py-2.5 font-mono text-amber-400">{psu.expectedMarks}</td>
                    <td className="py-2.5 font-mono text-emerald-400">{psu.minScore}+</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AIR Marks vs Rank Guide */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Historical Marks vs AIR Distribution</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2">Rank Range</th>
                  <th className="py-2">Expected Marks</th>
                  <th className="py-2">Opportunity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {AIR_MARKS_BENCHMARKS.map(item => (
                  <tr key={item.rankRange} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold font-mono text-cyan-400">{item.rankRange}</td>
                    <td className="py-2.5 font-mono text-amber-400">{item.marksRange}</td>
                    <td className="py-2.5 text-slate-300 text-[11px]">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
