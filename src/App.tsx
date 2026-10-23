/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Subject, 
  UserProfile, 
  StudyTask, 
  QuestionAttempt, 
  MockAttempt, 
  FormulaCard, 
  StudySessionLog, 
  SubjectCode, 
  TopicStatus 
} from './types';
import { 
  StorageService, 
  DEFAULT_USER_PROFILE, 
  INITIAL_STUDY_TASKS,
  INITIAL_MOCK_ATTEMPTS,
  INITIAL_QUESTION_ATTEMPTS,
  INITIAL_STUDY_SESSIONS
} from './utils/storage';
import { GATE_EE_SUBJECTS, GATE_EE_FORMULAS } from './data/gateData';
import { analyzeWeaknesses } from './utils/aiRecommender';

import { Navigation, NavTab } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SubjectTracker } from './components/SubjectTracker';
import { StudyPlanner } from './components/StudyPlanner';
import { PYQPractice } from './components/PYQPractice';
import { MockTestSimulator } from './components/MockTestSimulator';
import { ThreeEEVisualizer } from './components/ThreeEEVisualizer';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { FormulaBook } from './components/FormulaBook';
import { ProfileSettings } from './components/ProfileSettings';
import { LandingPage } from './components/LandingPage';
import { GateCalculator } from './components/GateCalculator';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Core Persistent State
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [subjects, setSubjects] = useState<Subject[]>(() => StorageService.getSubjects());
  const [tasks, setTasks] = useState<StudyTask[]>(() => StorageService.getTasks());
  const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>(() => StorageService.getQuestionAttempts());
  const [mockAttempts, setMockAttempts] = useState<MockAttempt[]>(() => StorageService.getMockAttempts());
  const [bookmarks, setBookmarks] = useState<string[]>(() => StorageService.getBookmarks());
  const [formulas, setFormulas] = useState<FormulaCard[]>(() => StorageService.getFormulas());
  const [studySessions, setStudySessions] = useState<StudySessionLog[]>(() => StorageService.getStudySessions());
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectCode>('EMC');

  // Days remaining calculation
  const daysRemaining = useMemo(() => {
    try {
      const exam = new Date(profile.examDate).getTime();
      const now = new Date().getTime();
      const diff = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
      return Math.max(0, diff);
    } catch {
      return 108;
    }
  }, [profile.examDate]);

  // Weakness Analysis (Dynamic AI algorithmic diagnostic)
  const weaknessList = useMemo(() => {
    return analyzeWeaknesses(subjects, questionAttempts, mockAttempts);
  }, [subjects, questionAttempts, mockAttempts]);

  // Handlers for Subject Management
  const handleUpdateTopicStatus = (subjectId: SubjectCode, topicId: string, status: TopicStatus) => {
    setSubjects(prev => {
      const updated = prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => (t.id === topicId ? { ...t, status } : t))
        };
      });
      StorageService.saveSubjects(updated);
      return updated;
    });
  };

  const handleUpdateTopicConfidence = (subjectId: SubjectCode, topicId: string, confidence: number) => {
    setSubjects(prev => {
      const updated = prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => (t.id === topicId ? { ...t, confidence } : t))
        };
      });
      StorageService.saveSubjects(updated);
      return updated;
    });
  };

  const handleIncrementRevision = (subjectId: SubjectCode, topicId: string) => {
    setSubjects(prev => {
      const updated = prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => (t.id === topicId ? {
            ...t,
            revisionsCount: t.revisionsCount + 1,
            lastRevisedDate: new Date().toISOString().split('T')[0]
          } : t))
        };
      });
      StorageService.saveSubjects(updated);
      return updated;
    });
  };

  const handleAddTopic = (subjectId: SubjectCode, topicData: any) => {
    setSubjects(prev => {
      const updated = prev.map(s => {
        if (s.id !== subjectId) return s;
        const newTopic = {
          ...topicData,
          id: `custom-topic-${Date.now()}`,
          subjectId
        };
        return { ...s, topics: [...s.topics, newTopic] };
      });
      StorageService.saveSubjects(updated);
      return updated;
    });
  };

  const handleUpdateNotes = (subjectId: SubjectCode, topicId: string, notes: string) => {
    setSubjects(prev => {
      const updated = prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => (t.id === topicId ? { ...t, notes } : t))
        };
      });
      StorageService.saveSubjects(updated);
      return updated;
    });
  };

  // Study Planner Handlers
  const handleToggleTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      StorageService.saveTasks(updated);
      return updated;
    });
  };

  const handleAddTask = (task: StudyTask) => {
    setTasks(prev => {
      const updated = [task, ...prev];
      StorageService.saveTasks(updated);
      return updated;
    });
  };

  const handleRescheduleTask = (taskId: string, newDate: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, date: newDate } : t);
      StorageService.saveTasks(updated);
      return updated;
    });
  };

  const handleAutoGeneratePlan = (prioritizeWeakness: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const topWeak = weaknessList.slice(0, 3);

    const generated: StudyTask[] = [
      {
        id: `auto-${Date.now()}-1`,
        date: today,
        subjectId: topWeak[0]?.subjectId || 'EMC',
        topicName: `High-Priority Drill: ${topWeak[0]?.weakTopics[0] || 'Core Machines Fundamentals'}`,
        durationMinutes: 90,
        completed: false,
        type: 'pyq',
        priority: 'high'
      },
      {
        id: `auto-${Date.now()}-2`,
        date: today,
        subjectId: topWeak[1]?.subjectId || 'PS',
        topicName: `Formula Mastery: ${topWeak[1]?.weakTopics[0] || 'Power System Stability'}`,
        durationMinutes: 60,
        completed: false,
        type: 'revision',
        priority: 'high'
      },
      {
        id: `auto-${Date.now()}-3`,
        date: today,
        subjectId: 'GA',
        topicName: 'General Aptitude Daily Speed Sprint (10 Numerical & Verbal Questions)',
        durationMinutes: 45,
        completed: false,
        type: 'pyq',
        priority: 'medium'
      }
    ];

    setTasks(prev => {
      const updated = [...generated, ...prev.filter(t => t.date !== today || t.completed)];
      StorageService.saveTasks(updated);
      return updated;
    });
  };

  // PYQ & Question Attempt Handlers
  const handleRecordAttempt = (attempt: QuestionAttempt) => {
    setQuestionAttempts(prev => {
      const updated = [attempt, ...prev.filter(a => a.questionId !== attempt.questionId)];
      StorageService.saveQuestionAttempts(updated);
      return updated;
    });
  };

  const handleToggleBookmark = (questionId: string) => {
    setBookmarks(prev => {
      const updated = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      StorageService.saveBookmarks(updated);
      return updated;
    });
  };

  // Mock Test Handler
  const handleSaveMockAttempt = (attempt: MockAttempt) => {
    setMockAttempts(prev => {
      const updated = [attempt, ...prev];
      StorageService.saveMockAttempts(updated);
      return updated;
    });
  };

  // Study Session Logger (From Timer)
  const handleLogSession = (minutes: number, subjectId: SubjectCode, topicName: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newSession: StudySessionLog = {
      id: `s-${Date.now()}`,
      date: today,
      minutes,
      subjectId,
      topicName
    };

    setStudySessions(prev => {
      const updated = [...prev, newSession];
      StorageService.saveStudySessions(updated);
      return updated;
    });

    // Update Streak
    if (profile.lastActiveDate !== today) {
      const updatedProfile: UserProfile = {
        ...profile,
        currentStreak: profile.currentStreak + 1,
        longestStreak: Math.max(profile.longestStreak, profile.currentStreak + 1),
        lastActiveDate: today
      };
      setProfile(updatedProfile);
      StorageService.saveProfile(updatedProfile);
    }
  };

  // Formula Book Handlers
  const handleAddFormula = (formula: FormulaCard) => {
    setFormulas(prev => {
      const updated = [formula, ...prev];
      StorageService.saveFormulas(updated);
      return updated;
    });
  };

  const handleUpdateFormulaBox = (formulaId: string, newBox: 1 | 2 | 3 | 4) => {
    setFormulas(prev => {
      const updated = prev.map(f => (f.id === formulaId ? { ...f, box: newBox } : f));
      StorageService.saveFormulas(updated);
      return updated;
    });
  };

  const handleToggleFormulaBookmark = (formulaId: string) => {
    setFormulas(prev => {
      const updated = prev.map(f => (f.id === formulaId ? { ...f, bookmarked: !f.bookmarked } : f));
      StorageService.saveFormulas(updated);
      return updated;
    });
  };

  // Profile and Data Handlers
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    StorageService.saveProfile(updated);
  };

  const handleExportData = () => {
    const dataStr = StorageService.exportBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gatetrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (jsonStr: string) => {
    const ok = StorageService.importBackup(jsonStr);
    if (ok) {
      setProfile(StorageService.getProfile());
      setSubjects(StorageService.getSubjects());
      setTasks(StorageService.getTasks());
      setQuestionAttempts(StorageService.getQuestionAttempts());
      setMockAttempts(StorageService.getMockAttempts());
      setBookmarks(StorageService.getBookmarks());
      setFormulas(StorageService.getFormulas());
      setStudySessions(StorageService.getStudySessions());
    }
    return ok;
  };

  const handleResetData = () => {
    StorageService.resetAll();
    setProfile(DEFAULT_USER_PROFILE);
    setSubjects(GATE_EE_SUBJECTS);
    setTasks(INITIAL_STUDY_TASKS);
    setQuestionAttempts(INITIAL_QUESTION_ATTEMPTS);
    setMockAttempts(INITIAL_MOCK_ATTEMPTS);
    setBookmarks(['gate-ee-2024-q2', 'gate-ee-2023-q1']);
    setFormulas(GATE_EE_FORMULAS);
    setStudySessions(INITIAL_STUDY_SESSIONS);
  };

  const handleLoadTopperDemo = () => {
    const topperProfile: UserProfile = {
      name: 'Venu Teja (IIT Madras M.Tech Aspirant)',
      email: 'venuteja.er.nitt@gmail.com',
      targetYear: 2025,
      targetAIR: 50,
      targetScore: 82,
      dailyStudyTargetHours: 8,
      currentPrepLevel: 'Advanced',
      preferredSlot: 'Morning',
      currentStreak: 28,
      longestStreak: 45,
      lastActiveDate: new Date().toISOString().split('T')[0],
      examDate: '2025-02-08',
      darkMode: true,
    };
    handleUpdateProfile(topperProfile);
  };

  const handleSelectSubjectAndNavigate = (subId: SubjectCode) => {
    setSelectedSubjectId(subId);
    setActiveTab('subjects');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        daysRemaining={daysRemaining}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'landing' && (
          <LandingPage
            onGetStarted={() => setActiveTab('dashboard')}
            onNavigateTab={setActiveTab}
            daysRemaining={daysRemaining}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            subjects={subjects}
            tasks={tasks}
            mockAttempts={mockAttempts}
            weaknessList={weaknessList}
            onToggleTask={handleToggleTask}
            onNavigate={setActiveTab}
            onSelectSubject={handleSelectSubjectAndNavigate}
            onLogSession={handleLogSession}
            daysRemaining={daysRemaining}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectTracker
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onSelectSubjectId={setSelectedSubjectId}
            onUpdateTopicStatus={handleUpdateTopicStatus}
            onUpdateTopicConfidence={handleUpdateTopicConfidence}
            onIncrementRevision={handleIncrementRevision}
            onAddTopic={handleAddTopic}
            onUpdateNotes={handleUpdateNotes}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner
            tasks={tasks}
            subjects={subjects}
            profile={profile}
            weaknessList={weaknessList}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onRescheduleTask={handleRescheduleTask}
            onAutoGeneratePlan={handleAutoGeneratePlan}
          />
        )}

        {activeTab === 'pyq' && (
          <PYQPractice
            subjects={subjects}
            attempts={questionAttempts}
            bookmarks={bookmarks}
            onRecordAttempt={handleRecordAttempt}
            onToggleBookmark={handleToggleBookmark}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
          />
        )}

        {activeTab === 'mock' && (
          <MockTestSimulator
            profile={profile}
            onSaveMockAttempt={handleSaveMockAttempt}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
          />
        )}

        {activeTab === 'visualizer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>3D Electrical Engineering Studio & Syllabus Galaxy</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Interactive real-time 3D models of 3-Phase AC Synchronous Machines, Grid Transmission Pylons, and the 11-Subject Syllabus Universe.
                </p>
              </div>
            </div>

            <ThreeEEVisualizer onSelectSubject={handleSelectSubjectAndNavigate} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <PerformanceAnalytics
            subjects={subjects}
            mockAttempts={mockAttempts}
            questionAttempts={questionAttempts}
            weaknessList={weaknessList}
            profile={profile}
            studySessions={studySessions}
            onNavigateToPYQ={() => setActiveTab('pyq')}
            onNavigateToRevision={() => setActiveTab('revision')}
          />
        )}

        {activeTab === 'revision' && (
          <FormulaBook
            subjects={subjects}
            formulas={formulas}
            onAddFormula={handleAddFormula}
            onUpdateFormulaBox={handleUpdateFormulaBox}
            onToggleBookmark={handleToggleFormulaBookmark}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSettings
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetData={handleResetData}
            onLoadTopperDemo={handleLoadTopperDemo}
          />
        )}
      </main>

      {/* Official GATE Virtual Scientific Calculator Modal */}
      <GateCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">GATETrack AI</span>
            <span>&bull;</span>
            <span>Electrical Engineering Preparation & Analytics</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Verified Official GATE PYQs (2016-2024)</span>
            <span>TCS iON Simulation</span>
            <span>Leitner Spaced Repetition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
