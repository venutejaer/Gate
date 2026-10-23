/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Target, 
  Clock, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Shield, 
  Moon, 
  Sun,
  Flame,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetData: () => void;
  onLoadTopperDemo: () => void;
}

export const ProfileSettings: React.FC<Props> = ({
  profile,
  onUpdateProfile,
  onExportData,
  onImportData,
  onResetData,
  onLoadTopperDemo
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setShowSaveAlert(true);
    setTimeout(() => setShowSaveAlert(false), 3000);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const success = onImportData(importJsonText.trim());
    if (success) {
      setImportStatus('Backup restored successfully!');
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
        setImportJsonText('');
      }, 1500);
    } else {
      setImportStatus('Invalid JSON format. Please check the backup content.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-amber-400" />
          <span>Profile, Goals & Preparation Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your target AIR, exam year, target score, study pace, and data backups.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal & Exam Goals Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="w-5 h-5 text-amber-400" />
            <span>Target Exam & Goals</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Candidate Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target GATE Year
              </label>
              <select
                value={formData.targetYear}
                onChange={e => setFormData({ ...formData, targetYear: parseInt(e.target.value) })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
              >
                <option value={2025}>GATE 2025 (EE)</option>
                <option value={2026}>GATE 2026 (EE)</option>
                <option value={2027}>GATE 2027 (EE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target All India Rank (AIR)
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={formData.targetAIR}
                onChange={e => setFormData({ ...formData, targetAIR: parseInt(e.target.value) || 100 })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Score (out of 100)
              </label>
              <input
                type="number"
                min="30"
                max="100"
                value={formData.targetScore}
                onChange={e => setFormData({ ...formData, targetScore: parseInt(e.target.value) || 75 })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Study Target (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={formData.dailyStudyTargetHours}
                onChange={e => setFormData({ ...formData, dailyStudyTargetHours: parseInt(e.target.value) || 6 })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Preparation Stage
              </label>
              <select
                value={formData.currentPrepLevel}
                onChange={e => setFormData({ ...formData, currentPrepLevel: e.target.value as any })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
              >
                <option value="Beginner">Beginner (Starting syllabus)</option>
                <option value="Intermediate">Intermediate (50% covered)</option>
                <option value="Advanced">Advanced (Syllabus done, solving PYQs)</option>
                <option value="Revision Only">Revision Only (Focus on Mocks & Formulae)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Exam Date
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={e => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 text-xs text-white p-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-emerald-400 font-semibold">
              {showSaveAlert ? '✓ Settings saved successfully!' : ''}
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      </form>

      {/* Data Management & Backup Center */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span>Data Storage & Portability</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your preparation progress, question attempts, custom topics, and formula cards are saved locally in your browser. You can export a JSON backup anytime or load sample topper data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={onExportData}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import JSON Backup</span>
          </button>

          <button
            onClick={onLoadTopperDemo}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Load Topper Demo Data</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              if (window.confirm('Reset all progress and restore initial state?')) {
                onResetData();
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Application Data to Initial Default</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white">Import JSON Backup</h3>
            <p className="text-xs text-slate-400">
              Paste the exported JSON data text below to restore all syllabus progress and attempts:
            </p>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder="Paste JSON content here..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 p-3 focus:outline-none focus:border-amber-500"
            />
            {importStatus && (
              <p className={`text-xs ${importStatus.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                {importStatus}
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
              >
                Restore Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
