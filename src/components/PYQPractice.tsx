/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  RotateCcw, 
  Calculator as CalcIcon,
  HelpCircle,
  AlertTriangle,
  Filter,
  Check
} from 'lucide-react';
import { 
  PYQuestion, 
  QuestionAttempt, 
  SubjectCode, 
  Subject, 
  MistakeReason 
} from '../types';
import { VERIFIED_GATE_PYQS } from '../data/gateData';
import confetti from 'canvas-confetti';

interface Props {
  subjects: Subject[];
  attempts: QuestionAttempt[];
  bookmarks: string[];
  onRecordAttempt: (attempt: QuestionAttempt) => void;
  onToggleBookmark: (questionId: string) => void;
  onOpenCalculator: () => void;
}

export const PYQPractice: React.FC<Props> = ({
  subjects,
  attempts,
  bookmarks,
  onRecordAttempt,
  onToggleBookmark,
  onOpenCalculator
}) => {
  const [selectedSubject, setSelectedSubject] = useState<'all' | SubjectCode>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  // Active question state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [numericAnswer, setNumericAnswer] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedMistakeReason, setSelectedMistakeReason] = useState<MistakeReason>('Calculation error');
  const [userNotes, setUserNotes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Filtered question pool
  const filteredQuestions = VERIFIED_GATE_PYQS.filter(q => {
    if (selectedSubject !== 'all' && q.subjectId !== selectedSubject) return false;
    if (selectedYear !== 'all' && q.year !== selectedYear) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (onlyBookmarks && !bookmarks.includes(q.id)) return false;
    if (onlyMistakes) {
      const prevAttempt = attempts.find(a => a.questionId === q.id);
      if (!prevAttempt || prevAttempt.isCorrect) return false;
    }
    return true;
  });

  const currentQ: PYQuestion | undefined = filteredQuestions[currentIndex];
  const isBookmarked = currentQ ? bookmarks.includes(currentQ.id) : false;
  const existingAttempt = currentQ ? attempts.find(a => a.questionId === currentQ.id) : undefined;

  // Active Question Timer
  useEffect(() => {
    setTimerSeconds(0);
    setIsAnswerSubmitted(false);
    setShowExplanation(false);
    setSelectedOption(null);
    setNumericAnswer('');
    setUserNotes('');
  }, [currentIndex, currentQ?.id]);

  useEffect(() => {
    let interval: any = null;
    if (!isAnswerSubmitted) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAnswerSubmitted]);

  // Handle submit answer
  const handleSubmitAnswer = () => {
    if (!currentQ) return;

    let isCorrect = false;

    if (currentQ.questionType === 'MCQ') {
      isCorrect = selectedOption === currentQ.correctOption;
    } else if (currentQ.questionType === 'NAT') {
      const numVal = parseFloat(numericAnswer);
      if (
        !isNaN(numVal) &&
        currentQ.numericAnswerMin !== undefined &&
        currentQ.numericAnswerMax !== undefined
      ) {
        isCorrect = numVal >= currentQ.numericAnswerMin && numVal <= currentQ.numericAnswerMax;
      }
    }

    setIsAnswerSubmitted(true);
    setShowExplanation(true);

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    onRecordAttempt({
      questionId: currentQ.id,
      userOption: selectedOption || undefined,
      userNumericAnswer: numericAnswer ? parseFloat(numericAnswer) : undefined,
      isCorrect,
      timeSpentSec: timerSeconds,
      timestamp: new Date().toISOString(),
      mistakeReason: !isCorrect ? selectedMistakeReason : undefined,
      notes: userNotes || undefined
    });
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>Official GATE EE PYQ Practice Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real official GATE EE questions with step-by-step verified mathematical explanations, NAT numeric answer checking, and mistake tagging.
          </p>
        </div>

        <button
          onClick={onOpenCalculator}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 shadow"
        >
          <CalcIcon className="w-4 h-4 text-amber-400" />
          <span>Virtual Calculator</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={e => {
                setSelectedSubject(e.target.value as any);
                setCurrentIndex(0);
              }}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white p-2 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All 11 Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.shortName} ({s.approxMarks}M)
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              GATE Year
            </label>
            <select
              value={selectedYear}
              onChange={e => {
                setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
                setCurrentIndex(0);
              }}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white p-2 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Years (2016 - 2024)</option>
              {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map(y => (
                <option key={y} value={y}>
                  GATE {y}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={e => {
                setSelectedDifficulty(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white p-2 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy (1 Mark Core)</option>
              <option value="Moderate">Moderate (Standard 2M)</option>
              <option value="Challenging">Challenging (Rank Decider)</option>
            </select>
          </div>

          {/* Special Toggles */}
          <div className="flex items-center gap-2 pt-5">
            <button
              onClick={() => { setOnlyBookmarks(!onlyBookmarks); setCurrentIndex(0); }}
              className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                onlyBookmarks
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarks.length})</span>
            </button>
            <button
              onClick={() => { setOnlyMistakes(!onlyMistakes); setCurrentIndex(0); }}
              className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                onlyMistakes
                  ? 'bg-red-500/20 text-red-300 border-red-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Mistakes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {!currentQ ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center space-y-3">
          <p className="text-slate-400 text-sm">
            No questions match your current filter settings.
          </p>
          <button
            onClick={() => {
              setSelectedSubject('all');
              setSelectedYear('all');
              setSelectedDifficulty('all');
              setOnlyBookmarks(false);
              setOnlyMistakes(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Top Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                {currentQ.sourcePaper}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase">
                {currentQ.questionType}
              </span>
              <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">
                {currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''} ({currentQ.negativeMarks > 0 ? `-${currentQ.negativeMarks}` : 'No negative'})
              </span>
              <span className="text-xs text-slate-400">
                • {currentQ.topicName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Question Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>

              {/* Bookmark Toggle */}
              <button
                onClick={() => onToggleBookmark(currentQ.id)}
                className={`p-2 rounded-xl border transition-colors ${
                  isBookmarked
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark for revision'}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Question Body */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-amber-400 font-mono">
                Q.{currentIndex + 1}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                of {filteredQuestions.length}
              </span>
            </div>

            <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed select-text">
              {currentQ.questionText}
            </p>
          </div>

          {/* Answer Options: MCQ */}
          {currentQ.questionType === 'MCQ' && currentQ.options && (
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQ.options.map(opt => {
                const isSelected = selectedOption === opt.id;
                let optionStyle = 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 text-slate-200';

                if (isAnswerSubmitted) {
                  if (opt.id === currentQ.correctOption) {
                    optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isSelected) {
                    optionStyle = 'bg-red-950/80 border-red-500 text-red-200 line-through';
                  } else {
                    optionStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow';
                }

                return (
                  <button
                    key={opt.id}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border text-left text-sm transition-all ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      {opt.id}
                    </span>
                    <span className="leading-relaxed flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Answer Option: NAT (Numerical Answer Type) */}
          {currentQ.questionType === 'NAT' && (
            <div className="pt-2 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Enter your numerical answer (round off as specified):
              </label>
              <div className="flex items-center gap-3 max-w-sm">
                <input
                  type="number"
                  step="any"
                  disabled={isAnswerSubmitted}
                  value={numericAnswer}
                  onChange={e => setNumericAnswer(e.target.value)}
                  placeholder="e.g. 20.0"
                  className="w-full text-base font-mono font-bold p-3 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Tip: Use the Official GATE Calculator to avoid precision round-off penalties!
              </p>
            </div>
          )}

          {/* Action Row: Check Answer, Prev, Next */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => i - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 text-xs font-semibold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={currentIndex === filteredQuestions.length - 1}
                onClick={() => setCurrentIndex(i => i + 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 text-xs font-semibold transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isAnswerSubmitted ? (
              <button
                disabled={
                  (currentQ.questionType === 'MCQ' && !selectedOption) ||
                  (currentQ.questionType === 'NAT' && !numericAnswer.trim())
                }
                onClick={handleSubmitAnswer}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                Submit & Verify
              </button>
            ) : (
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                {showExplanation ? 'Hide Explanation' : 'View Explanation'}
              </button>
            )}
          </div>

          {/* Verified Official Explanation & Mistake Tagging */}
          {showExplanation && (
            <div className="mt-6 rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Official Solution & Step-by-Step Derivation</h4>
                </div>
                <div className="text-xs font-mono font-bold">
                  {currentQ.questionType === 'MCQ' ? (
                    <span className="text-emerald-400">Correct Option: {currentQ.correctOption}</span>
                  ) : (
                    <span className="text-emerald-400">
                      Accepted Range: [{currentQ.numericAnswerMin} to {currentQ.numericAnswerMax}]
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800 font-mono">
                {currentQ.officialExplanation}
              </div>

              {/* Mistake Logging Form (if user made error) */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Self-Reflection: What caused the mistake or doubt?</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {(['Formula forgotten', 'Calculation error', 'Conceptual slip', 'Time pressure', 'Misread question', 'Unit conversion error'] as MistakeReason[]).map(r => (
                      <button
                        key={r}
                        onClick={() => setSelectedMistakeReason(r)}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          selectedMistakeReason === r
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
