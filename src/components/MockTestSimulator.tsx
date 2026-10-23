/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  AlertCircle, 
  RotateCcw, 
  Trophy, 
  BarChart, 
  Calculator as CalcIcon,
  Play,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { 
  MockTest, 
  MockAttempt, 
  PYQuestion, 
  PaletteStatus, 
  SubjectCode, 
  UserProfile 
} from '../types';
import { PRE_CONFIGURED_MOCKS, VERIFIED_GATE_PYQS, GATE_EE_SUBJECTS } from '../data/gateData';
import confetti from 'canvas-confetti';

interface Props {
  profile: UserProfile;
  onSaveMockAttempt: (attempt: MockAttempt) => void;
  onOpenCalculator: () => void;
}

export const MockTestSimulator: React.FC<Props> = ({
  profile,
  onSaveMockAttempt,
  onOpenCalculator
}) => {
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState<boolean>(false);
  const [latestAttempt, setLatestAttempt] = useState<MockAttempt | null>(null);

  // Active Test State
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { option?: string; nat?: number }>>({});
  const [statuses, setStatuses] = useState<Record<string, PaletteStatus>>({});
  const [qTimes, setQTimes] = useState<Record<string, number>>({});
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Active questions for selected test
  const activeQuestions: PYQuestion[] = selectedTest
    ? selectedTest.questionIds
        .map(id => VERIFIED_GATE_PYQS.find(q => q.id === id))
        .filter((q): q is PYQuestion => Boolean(q))
    : [];

  const currentQ: PYQuestion | undefined = activeQuestions[currentQIndex];

  // Start a test
  const handleStartTest = (test: MockTest) => {
    setSelectedTest(test);
    setIsTestActive(true);
    setIsTestSubmitted(false);
    setLatestAttempt(null);
    setCurrentQIndex(0);
    setSecondsRemaining(test.durationMinutes * 60);

    const initialStatuses: Record<string, PaletteStatus> = {};
    test.questionIds.forEach((id, idx) => {
      initialStatuses[id] = idx === 0 ? 'not-answered' : 'not-visited';
    });
    setStatuses(initialStatuses);
    setAnswers({});
    setQTimes({});
  };

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTestActive && !isTestSubmitted) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });

        // Track time per question
        if (currentQ) {
          setQTimes(prev => ({
            ...prev,
            [currentQ.id]: (prev[currentQ.id] || 0) + 1
          }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestActive, isTestSubmitted, currentQ?.id]);

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Question navigation actions
  const handleSaveAndNext = () => {
    if (!currentQ) return;
    const currentAns = answers[currentQ.id];
    const hasAnswered = currentAns && (currentAns.option || currentAns.nat !== undefined);

    setStatuses(prev => ({
      ...prev,
      [currentQ.id]: hasAnswered ? 'answered' : 'not-answered'
    }));

    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex(i => i + 1);
      const nextQ = activeQuestions[currentQIndex + 1];
      if (nextQ && statuses[nextQ.id] === 'not-visited') {
        setStatuses(prev => ({ ...prev, [nextQ.id]: 'not-answered' }));
      }
    }
  };

  const handleMarkForReviewAndNext = () => {
    if (!currentQ) return;
    const currentAns = answers[currentQ.id];
    const hasAnswered = currentAns && (currentAns.option || currentAns.nat !== undefined);

    setStatuses(prev => ({
      ...prev,
      [currentQ.id]: hasAnswered ? 'answered-and-marked' : 'marked-for-review'
    }));

    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex(i => i + 1);
      const nextQ = activeQuestions[currentQIndex + 1];
      if (nextQ && statuses[nextQ.id] === 'not-visited') {
        setStatuses(prev => ({ ...prev, [nextQ.id]: 'not-answered' }));
      }
    }
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
    setStatuses(prev => ({ ...prev, [currentQ.id]: 'not-answered' }));
  };

  const handleJumpToQuestion = (idx: number) => {
    setCurrentQIndex(idx);
    const targetQ = activeQuestions[idx];
    if (targetQ && statuses[targetQ.id] === 'not-visited') {
      setStatuses(prev => ({ ...prev, [targetQ.id]: 'not-answered' }));
    }
  };

  // Auto/Manual Submit and Score Calculation
  const handleAutoSubmit = () => {
    if (!selectedTest) return;

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let attemptedCount = 0;

    const subjectBreakdown: Record<SubjectCode, { total: number; scored: number; correct: number; incorrect: number }> = {
      EM: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      NT: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      EMF: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      EMC: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      PS: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      PE: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      CS: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      SS: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      EEM: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      ADE: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      GA: { total: 0, scored: 0, correct: 0, incorrect: 0 }
    };

    activeQuestions.forEach(q => {
      const b = subjectBreakdown[q.subjectId] || { total: 0, scored: 0, correct: 0, incorrect: 0 };
      b.total += 1;

      const userAns = answers[q.id];
      if (userAns && (userAns.option || userAns.nat !== undefined)) {
        attemptedCount += 1;
        let isCorrect = false;

        if (q.questionType === 'MCQ') {
          isCorrect = userAns.option === q.correctOption;
        } else if (q.questionType === 'NAT') {
          const v = userAns.nat;
          if (
            v !== undefined &&
            q.numericAnswerMin !== undefined &&
            q.numericAnswerMax !== undefined
          ) {
            isCorrect = v >= q.numericAnswerMin && v <= q.numericAnswerMax;
          }
        }

        if (isCorrect) {
          totalScore += q.marks;
          correctCount += 1;
          b.scored += q.marks;
          b.correct += 1;
        } else {
          totalScore -= q.negativeMarks;
          incorrectCount += 1;
          b.scored -= q.negativeMarks;
          b.incorrect += 1;
        }
      }
      subjectBreakdown[q.subjectId] = b;
    });

    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
    const finalScore = Math.max(0, Number(totalScore.toFixed(2)));
    const elapsedMinutes = Math.max(1, Math.round((selectedTest.durationMinutes * 60 - secondsRemaining) / 60));

    const attempt: MockAttempt = {
      id: `attempt-${Date.now()}`,
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      date: new Date().toISOString().split('T')[0],
      score: finalScore,
      totalMarks: selectedTest.totalMarks,
      accuracy: Math.round(accuracy * 10) / 10,
      timeSpentMinutes: elapsedMinutes,
      totalQuestions: activeQuestions.length,
      attempted: attemptedCount,
      correct: correctCount,
      incorrect: incorrectCount,
      subjectBreakdown
    };

    setIsTestActive(false);
    setIsTestSubmitted(true);
    setShowSubmitModal(false);
    setLatestAttempt(attempt);
    onSaveMockAttempt(attempt);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Count palette statuses
  const countStatus = (s: PaletteStatus) => Object.values(statuses).filter(v => v === s).length;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. MOCK TEST SELECTION HUB */}
      {!isTestActive && !isTestSubmitted && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-400" />
              <span>GATE EE Mock Test Hub (TCS iON Simulation)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Simulate actual GATE examination conditions with full timer, virtual scientific calculator, official color-coded question palette, and negative marking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRE_CONFIGURED_MOCKS.map(test => (
              <div
                key={test.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {test.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      {test.durationMinutes} Mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {test.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {test.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-300 font-mono pt-2">
                    <span>Questions: <strong>{test.questionIds.length}</strong></span>
                    <span>Total Marks: <strong>{test.totalMarks}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartTest(test)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Enter Examination Hall</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ACTIVE TEST SIMULATOR (TCS iON REPLICA) */}
      {isTestActive && selectedTest && currentQ && (
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
          {/* Official Top Exam Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                GATE
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedTest.title}
                </h3>
                <span className="text-[10px] text-slate-400">
                  Candidate: {profile.name} (EE)
                </span>
              </div>
            </div>

            {/* Countdown Clock & Calculator Access */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenCalculator}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-amber-400 font-semibold"
                title="Open official GATE calculator"
              >
                <CalcIcon className="w-3.5 h-3.5" />
                <span>Calculator</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-sm font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{formatCountdown(secondsRemaining)}</span>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition-colors"
              >
                Submit Test
              </button>
            </div>
          </div>

          {/* Main Exam Interface: Question Panel + Navigation Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[520px]">
            {/* Left 3 Cols: Question Details & Inputs */}
            <div className="lg:col-span-3 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-amber-400">Question {currentQIndex + 1}</span>
                    <span className="text-slate-500">of {activeQuestions.length}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-300">Marks: +{currentQ.marks}</span>
                    <span className="text-red-400">Negative: -{currentQ.negativeMarks}</span>
                    <span className="text-slate-400">[{currentQ.questionType}]</span>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed select-none">
                  {currentQ.questionText}
                </p>

                {/* Answer Input: MCQ */}
                {currentQ.questionType === 'MCQ' && currentQ.options && (
                  <div className="space-y-2.5 pt-4">
                    {currentQ.options.map(opt => {
                      const isSelected = answers[currentQ.id]?.option === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: { option: opt.id } }))}
                          className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs mt-0.5">
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Answer Input: NAT */}
                {currentQ.questionType === 'NAT' && (
                  <div className="pt-4 space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Enter Numeric Answer:
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={answers[currentQ.id]?.nat ?? ''}
                      onChange={e => setAnswers(prev => ({
                        ...prev,
                        [currentQ.id]: { nat: e.target.value === '' ? undefined : parseFloat(e.target.value) }
                      }))}
                      placeholder="Type your number..."
                      className="w-48 text-lg font-mono font-bold p-3 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Examination Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={handleClearResponse}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Clear Response
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkForReviewAndNext}
                    className="px-4 py-2 rounded-xl bg-purple-900/60 border border-purple-500/50 hover:bg-purple-900 text-purple-300 text-xs font-semibold shadow"
                  >
                    Mark for Review & Next
                  </button>

                  <button
                    onClick={handleSaveAndNext}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                  >
                    Save & Next
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Official Question Palette */}
            <div className="p-6 bg-slate-900/60 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Question Palette
                </h4>

                {/* 5 Status Legends */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white font-mono flex items-center justify-center font-bold">
                      {countStatus('answered')}
                    </span>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-red-600 text-white font-mono flex items-center justify-center font-bold">
                      {countStatus('not-answered')}
                    </span>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-purple-600 text-white font-mono flex items-center justify-center font-bold">
                      {countStatus('marked-for-review')}
                    </span>
                    <span>Marked Review</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-purple-600 text-emerald-400 font-mono flex items-center justify-center font-bold relative">
                      {countStatus('answered-and-marked')}
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <span>Ans & Marked</span>
                  </div>
                </div>

                {/* Palette Number Grid */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {activeQuestions.map((q, idx) => {
                    const st = statuses[q.id] || 'not-visited';
                    const isCur = idx === currentQIndex;

                    let btnColor = 'bg-slate-800 text-slate-400 border-slate-700'; // not-visited
                    if (st === 'answered') btnColor = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                    else if (st === 'not-answered') btnColor = 'bg-red-600 text-white border-red-500 font-bold';
                    else if (st === 'marked-for-review') btnColor = 'bg-purple-600 text-white border-purple-500 font-bold';
                    else if (st === 'answered-and-marked') btnColor = 'bg-purple-600 text-white border-purple-500 font-bold';

                    return (
                      <button
                        key={q.id}
                        onClick={() => handleJumpToQuestion(idx)}
                        className={`h-8 rounded-lg text-xs font-mono font-semibold border flex items-center justify-center relative transition-transform ${btnColor} ${
                          isCur ? 'ring-2 ring-amber-400 scale-105' : 'hover:opacity-90'
                        }`}
                      >
                        {idx + 1}
                        {st === 'answered-and-marked' && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center text-xs">
                <span className="text-slate-400">Total Questions: </span>
                <strong className="text-white font-mono">{activeQuestions.length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. POST-TEST PERFORMANCE REPORT MODAL / VIEW */}
      {isTestSubmitted && latestAttempt && selectedTest && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-black text-white">Mock Test Result & Scorecard</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedTest.title} • Completed in {latestAttempt.timeSpentMinutes} mins
              </p>
            </div>

            <button
              onClick={() => {
                setIsTestSubmitted(false);
                setSelectedTest(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
            >
              Back to Mock Test Hub
            </button>
          </div>

          {/* Top 4 Score Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Score Scored</span>
              <div className="text-3xl font-extrabold font-mono text-amber-400 mt-1">
                {latestAttempt.score}
                <span className="text-xs text-slate-400 font-sans"> / {latestAttempt.totalMarks}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Accuracy</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                {latestAttempt.accuracy}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Correct / Attempted</span>
              <div className="text-3xl font-extrabold font-mono text-white mt-1">
                {latestAttempt.correct} / {latestAttempt.attempted}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Est. All India Rank</span>
              <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
                AIR {latestAttempt.score > 70 ? '< 150' : latestAttempt.score > 55 ? '< 500' : '< 1800'}
              </div>
            </div>
          </div>

          {/* Subject-Wise Performance Breakdown Table */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart className="w-4 h-4 text-amber-400" />
              <span>Subject-Wise Performance Analysis</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2">Subject</th>
                    <th className="py-2">Questions</th>
                    <th className="py-2">Correct</th>
                    <th className="py-2">Incorrect</th>
                    <th className="py-2">Net Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {Object.entries(latestAttempt.subjectBreakdown)
                    .filter(([_, b]) => b.total > 0)
                    .map(([subId, b]) => {
                      const sub = GATE_EE_SUBJECTS.find(s => s.id === subId);
                      return (
                        <tr key={subId} className="hover:bg-slate-900/60 font-mono">
                          <td className="py-2.5 font-sans font-semibold text-white flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: sub?.color || '#3b82f6' }}
                            />
                            {sub?.shortName || subId}
                          </td>
                          <td className="py-2.5">{b.total}</td>
                          <td className="py-2.5 text-emerald-400">{b.correct}</td>
                          <td className="py-2.5 text-red-400">{b.incorrect}</td>
                          <td className="py-2.5 font-bold text-amber-400">
                            {Number(b.scored.toFixed(2))}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Confirm Test Submission</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to finalize and submit your test? You have{' '}
              <strong className="text-emerald-400">{countStatus('answered')} answered</strong> and{' '}
              <strong className="text-amber-400">{countStatus('not-answered') + countStatus('not-visited')} unattempted</strong> questions.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Return to Test
              </button>
              <button
                onClick={handleAutoSubmit}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
