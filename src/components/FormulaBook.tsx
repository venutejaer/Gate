/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bookmark, 
  Search, 
  Plus, 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  BookOpen, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FormulaCard, SubjectCode, Subject } from '../types';

interface Props {
  subjects: Subject[];
  formulas: FormulaCard[];
  onAddFormula: (formula: FormulaCard) => void;
  onUpdateFormulaBox: (formulaId: string, newBox: 1 | 2 | 3 | 4) => void;
  onToggleBookmark: (formulaId: string) => void;
}

export const FormulaBook: React.FC<Props> = ({
  subjects,
  formulas,
  onAddFormula,
  onUpdateFormulaBox,
  onToggleBookmark
}) => {
  const [activeTab, setActiveTab] = useState<'book' | 'flashcards'>('book');
  const [selectedSubject, setSelectedSubject] = useState<'all' | SubjectCode>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBox, setSelectedBox] = useState<'all' | 1 | 2 | 3 | 4>('all');

  // Flashcard mode state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Add formula modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSub, setNewSub] = useState<SubjectCode>('EMC');
  const [newTopic, setNewTopic] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newFormula, setNewFormula] = useState('');
  const [newVariables, setNewVariables] = useState('');
  const [newConditions, setNewConditions] = useState('');
  const [newImportance, setNewImportance] = useState<'Crucial' | 'High' | 'Medium'>('Crucial');

  // Filter formulas
  const filteredFormulas = formulas.filter(f => {
    if (selectedSubject !== 'all' && f.subjectId !== selectedSubject) return false;
    if (selectedBox !== 'all' && f.box !== selectedBox) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.topic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCard: FormulaCard | undefined = filteredFormulas[cardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    if (cardIndex < filteredFormulas.length - 1) {
      setCardIndex(i => i + 1);
    } else {
      setCardIndex(0);
    }
  };

  const handleBoxReview = (success: boolean) => {
    if (!activeCard) return;
    const currentBox = activeCard.box;
    const nextBox = success ? Math.min(4, currentBox + 1) : 1;
    onUpdateFormulaBox(activeCard.id, nextBox as any);
    handleNextCard();
  };

  const handleCreateFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFormula.trim()) return;

    onAddFormula({
      id: `form-${Date.now()}`,
      subjectId: newSub,
      topic: newTopic.trim() || 'General Formula',
      title: newTitle.trim(),
      formula: newFormula.trim(),
      variables: newVariables.trim(),
      conditions: newConditions.trim(),
      importance: newImportance,
      box: 1,
      bookmarked: true
    });

    setNewTitle('');
    setNewFormula('');
    setNewVariables('');
    setNewConditions('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-400" />
            <span>GATE EE Formula Book & Leitner Spaced Repetition</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Master high-yield GATE Electrical Engineering formulas using the scientific 4-box Leitner spaced repetition technique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'book' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Formula Library
            </button>
            <button
              onClick={() => { setActiveTab('flashcards'); setIsFlipped(false); setCardIndex(0); }}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'flashcards' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Flashcard Drill
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs shadow"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Formula</span>
          </button>
        </div>
      </div>

      {/* Leitner 4-Box Summary Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { box: 1 as const, title: 'Box 1: Daily', count: formulas.filter(f => f.box === 1).length, color: 'text-red-400', border: 'border-red-500/30' },
          { box: 2 as const, title: 'Box 2: Every 3 Days', count: formulas.filter(f => f.box === 2).length, color: 'text-amber-400', border: 'border-amber-500/30' },
          { box: 3 as const, title: 'Box 3: Weekly', count: formulas.filter(f => f.box === 3).length, color: 'text-cyan-400', border: 'border-cyan-500/30' },
          { box: 4 as const, title: 'Box 4: Mastered', count: formulas.filter(f => f.box === 4).length, color: 'text-emerald-400', border: 'border-emerald-500/30' },
        ].map(item => (
          <button
            key={item.box}
            onClick={() => setSelectedBox(selectedBox === item.box ? 'all' : item.box)}
            className={`p-3 rounded-2xl bg-slate-900 border text-left transition-all ${
              selectedBox === item.box ? `${item.border} ring-2 ring-amber-500/30` : 'border-slate-800'
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">
              {item.title}
            </span>
            <div className={`text-2xl font-mono font-bold mt-1 ${item.color}`}>
              {item.count} Cards
            </div>
          </button>
        ))}
      </div>

      {/* 1. FLASHCARD REPETITION DRILL MODE */}
      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {!activeCard ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              No flashcards in this filter category. Try selecting another Leitner box!
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Card {cardIndex + 1} of {filteredFormulas.length}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                  Leitner Box {activeCard.box}
                </span>
              </div>

              {/* 3D Flip Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[300px] rounded-3xl bg-slate-900 border border-slate-700/80 p-8 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-amber-500/50 transition-all select-none text-center relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold uppercase">
                    {activeCard.topic}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Click to flip
                  </span>
                </div>

                <div className="my-auto py-6 space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {activeCard.title}
                  </h3>

                  {isFlipped ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-base sm:text-lg font-bold text-amber-400 whitespace-pre-line">
                        {activeCard.formula}
                      </div>
                      {activeCard.variables && (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <strong>Variables:</strong> {activeCard.variables}
                        </p>
                      )}
                      {activeCard.conditions && (
                        <p className="text-[11px] text-amber-300/80 italic">
                          <strong>Note:</strong> {activeCard.conditions}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic">
                      [ Tap card to reveal formula derivation & variables ]
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500">
                  Importance: <strong className="text-slate-300">{activeCard.importance}</strong>
                </div>
              </div>

              {/* Leitner Action Buttons */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => handleBoxReview(false)}
                  className="flex-1 py-3 rounded-2xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Need Review (Demote to Box 1)</span>
                </button>

                <button
                  onClick={() => handleBoxReview(true)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Got It! (Promote to Box {Math.min(4, activeCard.box + 1)})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. FORMULA LIBRARY GRID VIEW */}
      {activeTab === 'book' && (
        <div className="space-y-4">
          {/* Search & Subject Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search formulas by name or symbol..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSubject === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                All Subjects
              </button>
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedSubject === s.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {s.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Formulas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormulas.map(f => {
              const sub = subjects.find(s => s.id === f.subjectId);
              return (
                <div
                  key={f.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase"
                        style={{ backgroundColor: `${sub?.color || '#3b82f6'}20`, color: sub?.color || '#3b82f6' }}
                      >
                        {sub?.shortName || f.subjectId} • {f.topic}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Box {f.box}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {f.title}
                    </h4>

                    {/* Formula Text Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm font-bold text-amber-400 whitespace-pre-line leading-relaxed">
                      {f.formula}
                    </div>

                    {f.variables && (
                      <p className="text-[11px] text-slate-400 leading-snug">
                        <strong className="text-slate-300">Variables:</strong> {f.variables}
                      </p>
                    )}

                    {f.conditions && (
                      <p className="text-[11px] text-amber-300/80 italic leading-snug">
                        <strong className="text-amber-400">Condition:</strong> {f.conditions}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-500">
                      Importance: <strong className="text-slate-300">{f.importance}</strong>
                    </span>
                    <button
                      onClick={() => onToggleBookmark(f.id)}
                      className={`text-xs font-semibold ${
                        f.bookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Formula Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white">Save Custom GATE Formula</h3>
            <form onSubmit={handleCreateFormula} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={newSub}
                  onChange={e => setNewSub(e.target.value as SubjectCode)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic & Formula Title
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    placeholder="Topic (e.g. Synchronous Reactance)"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Title (e.g. Potier Triangle Method)"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Formula Expression (Text / Math)
                </label>
                <textarea
                  required
                  rows={3}
                  value={newFormula}
                  onChange={e => setNewFormula(e.target.value)}
                  placeholder="e.g. Xs = Zs * sin(θ) = sqrt(Voc² / Isc² - Ra²)"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-300 font-mono p-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Variables & Conditions
                </label>
                <input
                  type="text"
                  value={newVariables}
                  onChange={e => setNewVariables(e.target.value)}
                  placeholder="Voc: open circuit voltage, Isc: short circuit current"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
                />
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
                  Save to Formula Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
