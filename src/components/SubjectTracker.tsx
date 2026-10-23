/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Subject, 
  Topic, 
  TopicStatus, 
  SubjectCode, 
  PriorityLevel 
} from '../types';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Star, 
  RotateCw,
  Zap
} from 'lucide-react';

interface Props {
  subjects: Subject[];
  selectedSubjectId: SubjectCode;
  onSelectSubjectId: (id: SubjectCode) => void;
  onUpdateTopicStatus: (subjectId: SubjectCode, topicId: string, status: TopicStatus) => void;
  onUpdateTopicConfidence: (subjectId: SubjectCode, topicId: string, confidence: number) => void;
  onIncrementRevision: (subjectId: SubjectCode, topicId: string) => void;
  onAddTopic: (subjectId: SubjectCode, topic: Partial<Topic>) => void;
  onUpdateNotes: (subjectId: SubjectCode, topicId: string, notes: string) => void;
}

export const SubjectTracker: React.FC<Props> = ({
  subjects,
  selectedSubjectId,
  onSelectSubjectId,
  onUpdateTopicStatus,
  onUpdateTopicConfidence,
  onIncrementRevision,
  onAddTopic,
  onUpdateNotes
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TopicStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicPriority, setNewTopicPriority] = useState<PriorityLevel>('high');
  const [newTopicWeight, setNewTopicWeight] = useState<number>(2);
  const [editingNotesTopicId, setEditingNotesTopicId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  // Filter topics
  const filteredTopics = currentSubject.topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || topic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate subject progress stats
  const totalTopics = currentSubject.topics.length;
  const completedTopics = currentSubject.topics.filter(t => t.status === 'completed').length;
  const inProgressTopics = currentSubject.topics.filter(t => t.status === 'in-progress').length;
  const notStartedTopics = currentSubject.topics.filter(t => t.status === 'not-started').length;
  const subjectProgress = Math.round((completedTopics / Math.max(totalTopics, 1)) * 100);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    onAddTopic(selectedSubjectId, {
      name: newTopicName.trim(),
      priority: newTopicPriority,
      weightageMarks: newTopicWeight,
      status: 'not-started',
      confidence: 3,
      revisionsCount: 0,
      pyqTotal: 10,
      pyqSolved: 0
    });
    setNewTopicName('');
    setIsAddModalOpen(false);
  };

  const handleSaveNotes = (topicId: string) => {
    onUpdateNotes(selectedSubjectId, topicId, notesText);
    setEditingNotesTopicId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>GATE EE Syllabus Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track all 11 official GATE Electrical Engineering subjects, manage topics, confidence, and revision counts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Topic</span>
        </button>
      </div>

      {/* Horizontal Subject Pill Selector (All 11 Subjects) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map(s => {
          const isSelected = s.id === selectedSubjectId;
          const completedCount = s.topics.filter(t => t.status === 'completed').length;
          const pct = Math.round((completedCount / Math.max(s.topics.length, 1)) * 100);

          return (
            <button
              key={s.id}
              onClick={() => onSelectSubjectId(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              style={{
                borderColor: isSelected ? s.color : undefined
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.shortName}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                isSelected ? 'bg-slate-700 text-amber-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {pct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Subject Overview Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${currentSubject.color}20`, color: currentSubject.color }}
              >
                {currentSubject.weightageRange}
              </span>
              <span className="text-xs text-slate-400">
                GATE EE Core Subject
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {currentSubject.name}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentSubject.description}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center shrink-0">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="text-lg font-bold font-mono text-emerald-400">{completedTopics}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Done</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="text-lg font-bold font-mono text-amber-400">{inProgressTopics}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">In Progress</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="text-lg font-bold font-mono text-slate-400">{notStartedTopics}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">To Do</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-6">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${subjectProgress}%`, backgroundColor: currentSubject.color }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            {(['all', 'not-started', 'in-progress', 'completed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s === 'not-started' ? 'To Do' : s === 'in-progress' ? 'Active' : 'Done'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topics List Table / Cards */}
      <div className="space-y-3">
        {filteredTopics.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            No topics matched your search filter.
          </div>
        ) : (
          filteredTopics.map(topic => (
            <div
              key={topic.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">
                      {topic.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      topic.priority === 'high'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {topic.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                      ~{topic.weightageMarks}M
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-4">
                    <span>PYQs Solved: <strong className="text-slate-200">{topic.pyqSolved}/{topic.pyqTotal}</strong></span>
                    <span>Revisions: <strong className="text-slate-200">{topic.revisionsCount}x</strong></span>
                    {topic.lastRevisedDate && (
                      <span>Last: <strong className="text-slate-300">{topic.lastRevisedDate}</strong></span>
                    )}
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={topic.status}
                    onChange={e => onUpdateTopicStatus(currentSubject.id, topic.id, e.target.value as TopicStatus)}
                    className={`text-xs font-bold rounded-xl px-3 py-1.5 border focus:outline-none cursor-pointer ${
                      topic.status === 'completed'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                        : topic.status === 'in-progress'
                        ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <option value="not-started">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => onIncrementRevision(currentSubject.id, topic.id)}
                    className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                    title="Increment revision count (+1)"
                  >
                    <RotateCw className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>

              {/* Confidence Rating Stars & Notes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                {/* Confidence Stars */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Self Confidence:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => onUpdateTopicConfidence(currentSubject.id, topic.id, star)}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            star <= topic.confidence
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic Notes Preview & Trigger */}
                <div className="flex items-center gap-2">
                  {editingNotesTopicId === topic.id ? (
                    <div className="flex items-center gap-2 w-full sm:w-80">
                      <input
                        type="text"
                        value={notesText}
                        onChange={e => setNotesText(e.target.value)}
                        placeholder="Add quick revision note / formula tip..."
                        className="w-full text-xs p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleSaveNotes(topic.id)}
                        className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px]"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {topic.notes && (
                        <span className="text-[11px] text-slate-400 italic truncate max-w-xs">
                          "{topic.notes}"
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setEditingNotesTopicId(topic.id);
                          setNotesText(topic.notes || '');
                        }}
                        className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{topic.notes ? 'Edit Note' : 'Add Note'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Topic Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white">
              Add New Topic to {currentSubject.shortName}
            </h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  placeholder="e.g. Nyquist Stability Criterion Contour Plots"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTopicPriority}
                    onChange={e => setNewTopicPriority(e.target.value as PriorityLevel)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Est. Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newTopicWeight}
                    onChange={e => setNewTopicWeight(parseInt(e.target.value) || 2)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                  />
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
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
