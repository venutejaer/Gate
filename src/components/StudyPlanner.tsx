/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  AlertTriangle, 
  ChevronRight, 
  ArrowRight,
  Flame,
  Filter
} from 'lucide-react';
import { 
  StudyTask, 
  Subject, 
  UserProfile, 
  WeaknessAnalysis, 
  SubjectCode 
} from '../types';

interface Props {
  tasks: StudyTask[];
  subjects: Subject[];
  profile: UserProfile;
  weaknessList: WeaknessAnalysis[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: StudyTask) => void;
  onRescheduleTask: (taskId: string, newDate: string) => void;
  onAutoGeneratePlan: (prioritizeWeakness: boolean) => void;
}

export const StudyPlanner: React.FC<Props> = ({
  tasks,
  subjects,
  profile,
  weaknessList,
  onToggleTask,
  onAddTask,
  onRescheduleTask,
  onAutoGeneratePlan
}) => {
  const [activeView, setActiveView] = useState<'today' | 'weekly'>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskSubject, setTaskSubject] = useState<SubjectCode>('EMC');
  const [taskTopic, setTaskTopic] = useState('');
  const [taskDuration, setTaskDuration] = useState<number>(60);
  const [taskType, setTaskType] = useState<'theory' | 'pyq' | 'revision' | 'mock'>('pyq');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('high');

  const todayStr = new Date().toISOString().split('T')[0];

  // Group tasks
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const upcomingTasks = tasks.filter(t => t.date > todayStr);
  const missedTasks = tasks.filter(t => t.date < todayStr && !t.completed);

  const completedTodayCount = todayTasks.filter(t => t.completed).length;
  const todayTotalMinutes = todayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTopic.trim()) return;

    onAddTask({
      id: `task-${Date.now()}`,
      date: todayStr,
      subjectId: taskSubject,
      topicName: taskTopic.trim(),
      durationMinutes: taskDuration,
      completed: false,
      type: taskType,
      priority: taskPriority
    });

    setTaskTopic('');
    setIsAddModalOpen(false);
  };

  const handleRescheduleAllMissedToToday = () => {
    missedTasks.forEach(task => {
      onRescheduleTask(task.id, todayStr);
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-400" />
            <span>Smart Study Planner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic AI-driven study timetable weighted by syllabus progress, weak subjects, and daily {profile.dailyStudyTargetHours}h targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onAutoGeneratePlan(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            title="Re-balance study plan based on weak subjects"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Prioritize Weak Topics</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Task</span>
          </button>
        </div>
      </div>

      {/* Missed Tasks Warning Banner (if any) */}
      {missedTasks.length > 0 && (
        <div className="rounded-2xl bg-amber-950/60 border border-amber-500/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              You have <strong className="text-white font-bold">{missedTasks.length} uncompleted tasks</strong> from earlier dates.
            </span>
          </div>
          <button
            onClick={handleRescheduleAllMissedToToday}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow whitespace-nowrap"
          >
            Reschedule All to Today
          </button>
        </div>
      )}

      {/* View Toggle Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView('today')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeView === 'today' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Today's Schedule ({todayTasks.length})
          </button>
          <button
            onClick={() => setActiveView('weekly')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeView === 'weekly' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Timeline & Upcoming
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Today: {Math.round(todayTotalMinutes / 60 * 10) / 10}h planned / {profile.dailyStudyTargetHours}h target
        </div>
      </div>

      {/* Today View */}
      {activeView === 'today' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Today's Time-Blocked Schedule</span>
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {completedTodayCount} of {todayTasks.length} Completed
              </span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tasks scheduled for today yet. Click "Prioritize Weak Topics" or "Add Study Task" above.
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task, idx) => {
                  const sub = subjects.find(s => s.id === task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                        task.completed
                          ? 'bg-slate-950/50 border-slate-800/80 opacity-60'
                          : 'bg-slate-850/60 bg-slate-800/40 hover:bg-slate-800 border-slate-700/70'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className={`mt-0.5 w-6 h-6 rounded-xl border flex items-center justify-center transition-colors ${
                            task.completed
                              ? 'bg-amber-500 border-amber-500 text-slate-950'
                              : 'border-slate-600 hover:border-amber-400 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase"
                              style={{ backgroundColor: `${sub?.color || '#3b82f6'}20`, color: sub?.color || '#3b82f6' }}
                            >
                              {sub?.shortName || task.subjectId}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold uppercase">
                              {task.type}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              task.priority === 'high' ? 'text-red-400 bg-red-500/10' : 'text-slate-400 bg-slate-800'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className={`text-sm font-semibold text-white ${task.completed ? 'line-through text-slate-500' : ''}`}>
                            {task.topicName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <span className="text-xs font-mono text-slate-400 font-semibold">
                          {task.durationMinutes} mins
                        </span>
                        {!task.completed && (
                          <button
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() + 1);
                              onRescheduleTask(task.id, d.toISOString().split('T')[0]);
                            }}
                            className="text-[11px] font-semibold text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            Postpone →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly View */}
      {activeView === 'weekly' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {[0, 1, 2, 3, 4, 5, 6].map(offset => {
              const d = new Date();
              d.setDate(d.getDate() + offset);
              const dateStr = d.toISOString().split('T')[0];
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
              const dayTasks = tasks.filter(t => t.date === dateStr);

              return (
                <div
                  key={dateStr}
                  className={`rounded-2xl border p-3 flex flex-col space-y-2 min-h-[220px] ${
                    offset === 0
                      ? 'bg-slate-900 border-amber-500/50 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="border-b border-slate-800 pb-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={offset === 0 ? 'text-amber-400' : 'text-slate-300'}>
                        {dayName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{dayNum}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1 overflow-y-auto">
                    {dayTasks.length === 0 ? (
                      <div className="text-[11px] text-slate-600 italic text-center pt-6">
                        No tasks
                      </div>
                    ) : (
                      dayTasks.map(t => {
                        const sub = subjects.find(s => s.id === t.subjectId);
                        return (
                          <div
                            key={t.id}
                            onClick={() => onToggleTask(t.id)}
                            className={`p-2 rounded-xl text-[11px] border cursor-pointer transition-all ${
                              t.completed
                                ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
                            }`}
                          >
                            <span
                              className="font-bold block text-[10px]"
                              style={{ color: sub?.color || '#3b82f6' }}
                            >
                              {sub?.shortName || t.subjectId}
                            </span>
                            <span className="line-clamp-2 leading-tight">{t.topicName}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Study Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white">Create New Study Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={taskSubject}
                  onChange={e => setTaskSubject(e.target.value as SubjectCode)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.approxMarks} Marks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic / Task Description
                </label>
                <input
                  type="text"
                  required
                  value={taskTopic}
                  onChange={e => setTaskTopic(e.target.value)}
                  placeholder="e.g. Transformers Open Circuit & Short Circuit Tests PYQs"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="360"
                    step="15"
                    value={taskDuration}
                    onChange={e => setTaskDuration(parseInt(e.target.value) || 60)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={taskType}
                    onChange={e => setTaskType(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="pyq">PYQ Practice</option>
                    <option value="theory">Theory Study</option>
                    <option value="revision">Formula Revision</option>
                    <option value="mock">Mock Test</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
