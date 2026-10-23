/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check, Sparkles, Clock } from 'lucide-react';
import { SubjectCode } from '../types';
import { GATE_EE_SUBJECTS } from '../data/gateData';

interface Props {
  onLogSession: (minutes: number, subjectId: SubjectCode, topicName: string) => void;
}

export const StudyTimer: React.FC<Props> = ({ onLogSession }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode>('EMC');
  const [topicName, setTopicName] = useState<string>('Electrical Machines Core Review');
  const [showLogSuccess, setShowLogSuccess] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (timerMode === 'pomodoro') {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsRunning(false);
              onLogSession(25, selectedSubject, topicName);
              setShowLogSuccess(true);
              setTimeout(() => setShowLogSuccess(false), 4000);
              return 25 * 60;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerMode, selectedSubject, topicName, onLogSession]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') {
      setSecondsLeft(25 * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const handleManualLogStopwatch = () => {
    const mins = Math.max(1, Math.round(stopwatchSeconds / 60));
    onLogSession(mins, selectedSubject, topicName);
    setIsRunning(false);
    setStopwatchSeconds(0);
    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 4000);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-sm">Focus Study Timer</h3>
        </div>
        <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
          <button
            onClick={() => { setTimerMode('pomodoro'); setIsRunning(false); }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              timerMode === 'pomodoro' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            25m Pomodoro
          </button>
          <button
            onClick={() => { setTimerMode('stopwatch'); setIsRunning(false); }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              timerMode === 'stopwatch' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* Main Big Timer Display */}
      <div className="text-center my-3">
        <div className="text-5xl font-extrabold font-mono text-slate-100 tracking-wider">
          {timerMode === 'pomodoro' ? formatTime(secondsLeft) : formatTime(stopwatchSeconds)}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {isRunning ? 'Session in progress — stay focused!' : 'Ready to begin preparation session'}
        </p>
      </div>

      {/* Subject & Topic Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value as SubjectCode)}
            className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 p-2 focus:outline-none focus:border-amber-500"
          >
            {GATE_EE_SUBJECTS.map(s => (
              <option key={s.id} value={s.id}>
                {s.shortName} ({s.approxMarks}M)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Topic Focus
          </label>
          <input
            type="text"
            value={topicName}
            onChange={e => setTopicName(e.target.value)}
            className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 p-2 focus:outline-none focus:border-amber-500"
            placeholder="e.g. Thevenin Theorem PYQ"
          />
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>

        <button
          onClick={handleReset}
          className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {timerMode === 'stopwatch' && stopwatchSeconds > 60 && (
          <button
            onClick={handleManualLogStopwatch}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Log ({Math.round(stopwatchSeconds / 60)}m)</span>
          </button>
        )}
      </div>

      {/* Success notification */}
      {showLogSuccess && (
        <div className="mt-3 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Study session logged to your streak and daily hours!</span>
        </div>
      )}
    </div>
  );
};
