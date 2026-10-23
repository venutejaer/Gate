/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Clock, 
  Target, 
  Trophy, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Play, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { 
  Subject, 
  UserProfile, 
  StudyTask, 
  MockAttempt, 
  WeaknessAnalysis, 
  SubjectCode 
} from '../types';
import { StudyTimer } from './StudyTimer';
import { NavTab } from './Navigation';

interface Props {
  profile: UserProfile;
  subjects: Subject[];
  tasks: StudyTask[];
  mockAttempts: MockAttempt[];
  weaknessList: WeaknessAnalysis[];
  onToggleTask: (taskId: string) => void;
  onNavigate: (tab: NavTab) => void;
  onSelectSubject: (subId: SubjectCode) => void;
  onLogSession: (minutes: number, subjectId: SubjectCode, topicName: string) => void;
  daysRemaining: number;
}

export const Dashboard: React.FC<Props> = ({
  profile,
  subjects,
  tasks,
  mockAttempts,
  weaknessList,
  onToggleTask,
  onNavigate,
  onSelectSubject,
  onLogSession,
  daysRemaining
}) => {
  // 1. Calculate syllabus completion
  let totalTopics = 0;
  let completedTopics = 0;
  subjects.forEach(s => {
    totalTopics += s.topics.length;
    completedTopics += s.topics.filter(t => t.status === 'completed').length;
  });
  const syllabusPct = Math.round((completedTopics / Math.max(totalTopics, 1)) * 100);

  // 2. Mock test statistics
  const avgMockScore = mockAttempts.length > 0
    ? (mockAttempts.reduce((acc, m) => acc + m.score, 0) / mockAttempts.length).toFixed(1)
    : '0';

  const avgMockAccuracy = mockAttempts.length > 0
    ? Math.round(mockAttempts.reduce((acc, m) => acc + m.accuracy, 0) / mockAttempts.length)
    : 0;

  // 3. Today's task progress
  const todayTasks = tasks;
  const completedToday = todayTasks.filter(t => t.completed).length;

  // 4. Strong vs Weak subjects
  const strongestSubjects = [...subjects]
    .map(s => {
      const comp = s.topics.filter(t => t.status === 'completed').length;
      return { ...s, pct: Math.round((comp / s.topics.length) * 100) };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  const weakestAnalysis = weaknessList.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Targeting GATE {profile.targetYear} AIR &lt; {profile.targetAIR}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">{profile.name}</span>!
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              You are currently at <strong className="text-amber-400">{syllabusPct}%</strong> syllabus completion. Focus today on your highest vulnerability topics in Electrical Machines & Power Systems to boost your predicted AIR.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('mock')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Take Full Mock Test</span>
            </button>
            <button
              onClick={() => onNavigate('visualizer')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs shadow transition-all"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Launch 3D EE Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Syllabus Completion */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Syllabus Covered</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{syllabusPct}%</span>
            <span className="text-xs text-slate-400">({completedTopics}/{totalTopics} topics)</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${syllabusPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Target: 100% by Dec</span>
            <span className="text-amber-400 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('subjects')}>
              View 11 Subjects →
            </span>
          </p>
        </div>

        {/* Metric 2: Current Study Streak */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Current Study Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{profile.currentStreak}</span>
            <span className="text-xs text-orange-400 font-semibold">Days Active 🔥</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full ${
                  idx < 6 ? 'bg-orange-500' : 'bg-slate-700'
                }`}
                title={day}
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Personal best: <strong className="text-slate-200">{profile.longestStreak} days</strong>
          </p>
        </div>

        {/* Metric 3: Mock Test Average Score */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Mock Test Average</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{avgMockScore}</span>
            <span className="text-xs text-slate-400">/ 100 Marks</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 text-slate-300">
            <span>Accuracy: <strong className="text-emerald-400">{avgMockAccuracy}%</strong></span>
            <span>AIR Est: <strong className="text-cyan-400">&lt; 350</strong></span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Target cutoff: <strong className="text-slate-200">{profile.targetScore} marks</strong>
          </p>
        </div>

        {/* Metric 4: Days Remaining Until GATE */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>GATE Exam Countdown</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-400">{daysRemaining}</span>
            <span className="text-xs text-slate-400">Days to Exam</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-300">
            <span>Daily Target: <strong className="text-white">{profile.dailyStudyTargetHours} hrs</strong></span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Exam Date: <strong className="text-slate-200">{profile.examDate}</strong>
          </p>
        </div>
      </div>

      {/* Main Two-Column Row: Today's Targets & Focus Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Study Targets */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>Today's Study Targets</span>
              </h2>
              <p className="text-xs text-slate-400">
                {completedToday} of {todayTasks.length} tasks completed today
              </p>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View Full Weekly Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {todayTasks.map(task => {
              const sub = subjects.find(s => s.id === task.subjectId);
              return (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`group flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 hover:border-amber-500/40'
                  }`}
                >
                  <div className="mt-0.5">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-amber-500 border-amber-500 text-slate-950'
                        : 'border-slate-600 group-hover:border-amber-400'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase"
                        style={{ backgroundColor: `${sub?.color || '#3b82f6'}20`, color: sub?.color || '#3b82f6' }}
                      >
                        {sub?.shortName || task.subjectId}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 uppercase font-semibold">
                        {task.type}
                      </span>
                      <span className="text-xs font-mono text-slate-400 ml-auto">
                        {task.durationMinutes} mins
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm font-semibold mt-1 text-slate-200 ${
                      task.completed ? 'line-through text-slate-500' : ''
                    }`}>
                      {task.topicName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Study Timer */}
        <div className="lg:col-span-1">
          <StudyTimer onLogSession={onLogSession} />
        </div>
      </div>

      {/* Special Feature: Weakness-Based Recommendations Banner & Cards */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-red-500/20 text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white">
                Weakness-Based AI Recommendations
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated algorithmic analysis of your quiz errors, mock test score gaps, and unrevised formulas.
            </p>
          </div>
          <button
            onClick={() => onNavigate('pyq')}
            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          >
            Practice Weak PYQs Now →
          </button>
        </div>

        {/* Cards for Top Weak Subjects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weakestAnalysis.map((item, idx) => {
            const sub = subjects.find(s => s.id === item.subjectId);
            return (
              <div
                key={item.subjectId}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 relative group hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {sub?.name || item.subjectName}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                    Vulnerability: {item.vulnerabilityScore}/100
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Accuracy:</span>
                    <span className="font-semibold text-slate-200">{item.accuracyPercent}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Attempted:</span>
                    <span className="font-semibold text-slate-200">{item.attemptedQuestions} PYQs</span>
                  </div>
                  {item.frequentMistakeTypes[0] && (
                    <div className="flex justify-between text-slate-400">
                      <span>Primary Gap:</span>
                      <span className="text-amber-400 font-medium">
                        {item.frequentMistakeTypes[0].reason}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-snug">
                  <strong className="text-amber-400 block mb-0.5">Recommended Action:</strong>
                  {item.recommendedAction}
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => onSelectSubject(item.subjectId)}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    View Subject Topics →
                  </button>
                  <button
                    onClick={() => onNavigate('pyq')}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                  >
                    Drill 5 PYQs
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strong Subjects Showcase */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Strongest Prepared Subjects</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {strongestSubjects.map(sub => (
            <div
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className="p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{sub.shortName}</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{sub.pct}% Done</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{sub.name}</p>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${sub.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
