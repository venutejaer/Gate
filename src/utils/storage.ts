/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Subject, 
  UserProfile, 
  StudyTask, 
  QuestionAttempt, 
  MockAttempt, 
  FormulaCard,
  StudySessionLog
} from '../types';
import { 
  GATE_EE_SUBJECTS, 
  GATE_EE_FORMULAS 
} from '../data/gateData';

const STORAGE_KEYS = {
  PROFILE: 'gatetrack_profile_v1',
  SUBJECTS: 'gatetrack_subjects_v1',
  TASKS: 'gatetrack_tasks_v1',
  QUESTION_ATTEMPTS: 'gatetrack_q_attempts_v1',
  MOCK_ATTEMPTS: 'gatetrack_mock_attempts_v1',
  BOOKMARKED_QUESTIONS: 'gatetrack_bookmarked_q_v1',
  FORMULA_CARDS: 'gatetrack_formulas_v1',
  STUDY_SESSIONS: 'gatetrack_sessions_v1',
};

// Initial default user profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Venu Teja',
  email: 'venuteja.er.nitt@gmail.com',
  targetYear: 2025,
  targetAIR: 100,
  targetScore: 78,
  dailyStudyTargetHours: 6,
  currentPrepLevel: 'Advanced',
  preferredSlot: 'Morning',
  currentStreak: 12,
  longestStreak: 24,
  lastActiveDate: new Date().toISOString().split('T')[0],
  examDate: '2025-02-08', // Typical 2nd Saturday of February for GATE EE
  darkMode: true,
};

// Initial sample study tasks
export const INITIAL_STUDY_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    date: new Date().toISOString().split('T')[0],
    subjectId: 'EMC',
    topicName: 'Three-Phase Induction Motor Torque-Slip Calculations',
    durationMinutes: 90,
    completed: true,
    type: 'theory',
    priority: 'high'
  },
  {
    id: 'task-2',
    date: new Date().toISOString().split('T')[0],
    subjectId: 'PS',
    topicName: 'Equal Area Criterion & Critical Clearing Angle Numerical PYQs',
    durationMinutes: 60,
    completed: false,
    type: 'pyq',
    priority: 'high'
  },
  {
    id: 'task-3',
    date: new Date().toISOString().split('T')[0],
    subjectId: 'PE',
    topicName: 'Buck-Boost CCM Inductor & Capacitor Ripple Derivation',
    durationMinutes: 45,
    completed: false,
    type: 'revision',
    priority: 'medium'
  },
  {
    id: 'task-4',
    date: new Date().toISOString().split('T')[0],
    subjectId: 'CS',
    topicName: 'Root Locus Centroid & Breakaway Point PYQs (2018-2024)',
    durationMinutes: 60,
    completed: false,
    type: 'pyq',
    priority: 'high'
  }
];

// Initial mock attempt for instant analytics
export const INITIAL_MOCK_ATTEMPTS: MockAttempt[] = [
  {
    id: 'mock-att-1',
    testId: 'mock-sub-machines-power',
    testTitle: 'Core Power & Machines Mastery Mini-Mock',
    date: '2025-01-14',
    score: 28.5,
    totalMarks: 35,
    accuracy: 81.4,
    timeSpentMinutes: 52,
    totalQuestions: 6,
    attempted: 6,
    correct: 5,
    incorrect: 1,
    subjectBreakdown: {
      EMC: { total: 3, scored: 6, correct: 2, incorrect: 1 },
      PS: { total: 3, scored: 6, correct: 3, incorrect: 0 },
      EM: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      NT: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      EMF: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      PE: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      CS: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      SS: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      EEM: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      ADE: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      GA: { total: 0, scored: 0, correct: 0, incorrect: 0 }
    }
  },
  {
    id: 'mock-att-2',
    testId: 'mock-full-1',
    testTitle: 'GATE EE 2025 All India Grand Mock Test (Full Length)',
    date: '2025-01-18',
    score: 71.33,
    totalMarks: 100,
    accuracy: 78.5,
    timeSpentMinutes: 168,
    totalQuestions: 20,
    attempted: 18,
    correct: 14,
    incorrect: 4,
    subjectBreakdown: {
      EMC: { total: 4, scored: 5.33, correct: 3, incorrect: 1 },
      PS: { total: 4, scored: 7, correct: 3, incorrect: 1 },
      NT: { total: 3, scored: 5.34, correct: 2, incorrect: 1 },
      PE: { total: 2, scored: 4, correct: 2, incorrect: 0 },
      CS: { total: 2, scored: 2.34, correct: 1, incorrect: 1 },
      EM: { total: 3, scored: 5, correct: 2, incorrect: 0 },
      GA: { total: 2, scored: 2, correct: 1, incorrect: 0 },
      EMF: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      SS: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      EEM: { total: 0, scored: 0, correct: 0, incorrect: 0 },
      ADE: { total: 0, scored: 0, correct: 0, incorrect: 0 }
    }
  }
];

// Initial question attempts
export const INITIAL_QUESTION_ATTEMPTS: QuestionAttempt[] = [
  {
    questionId: 'gate-ee-2024-q1',
    userNumericAnswer: 20.0,
    isCorrect: true,
    timeSpentSec: 95,
    timestamp: '2025-01-15T10:30:00.000Z'
  },
  {
    questionId: 'gate-ee-2024-q2',
    userOption: 'A',
    isCorrect: false,
    timeSpentSec: 80,
    timestamp: '2025-01-16T11:15:00.000Z',
    mistakeReason: 'Calculation error',
    notes: 'Confused damping factor α with natural frequency ω0.'
  },
  {
    questionId: 'gate-ee-2023-q1',
    userNumericAnswer: 1800,
    isCorrect: true,
    timeSpentSec: 110,
    timestamp: '2025-01-16T14:20:00.000Z'
  },
  {
    questionId: 'gate-ee-2023-q2',
    userOption: 'A',
    isCorrect: false,
    timeSpentSec: 130,
    timestamp: '2025-01-17T09:45:00.000Z',
    mistakeReason: 'Formula forgotten',
    notes: 'Used Vo instead of (Vs - Vo) across the inductor in Buck converter.'
  },
  {
    questionId: 'gate-ee-2022-q1',
    userNumericAnswer: 0,
    isCorrect: true,
    timeSpentSec: 45,
    timestamp: '2025-01-17T16:00:00.000Z'
  },
  {
    questionId: 'gate-ee-2022-q2',
    userNumericAnswer: 79.1,
    isCorrect: true,
    timeSpentSec: 65,
    timestamp: '2025-01-18T10:00:00.000Z'
  },
  {
    questionId: 'gate-ee-2018-q1',
    userNumericAnswer: 950,
    isCorrect: false,
    timeSpentSec: 150,
    timestamp: '2025-01-18T15:20:00.000Z',
    mistakeReason: 'Conceptual slip',
    notes: 'Forgot to incorporate 10% reduction in flux Φ due to armature reaction in the denominator.'
  }
];

export const INITIAL_STUDY_SESSIONS: StudySessionLog[] = [
  { id: 's-1', date: '2025-01-14', minutes: 240, subjectId: 'EMC', topicName: 'Induction Motors' },
  { id: 's-2', date: '2025-01-15', minutes: 310, subjectId: 'PS', topicName: 'Fault Analysis' },
  { id: 's-3', date: '2025-01-16', minutes: 280, subjectId: 'NT', topicName: 'Transients' },
  { id: 's-4', date: '2025-01-17', minutes: 360, subjectId: 'PE', topicName: 'DC-DC Converters' },
  { id: 's-5', date: '2025-01-18', minutes: 420, subjectId: 'EM', topicName: 'Calculus & Algebra' },
  { id: 's-6', date: '2025-01-19', minutes: 330, subjectId: 'CS', topicName: 'Bode Plots' },
  { id: 's-7', date: new Date().toISOString().split('T')[0], minutes: 180, subjectId: 'EMC', topicName: 'Synchronous Machines' }
];

export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading from localStorage [${key}]:`, e);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving to localStorage [${key}]:`, e);
  }
}

export const StorageService = {
  getProfile: (): UserProfile => getStoredData(STORAGE_KEYS.PROFILE, DEFAULT_USER_PROFILE),
  saveProfile: (p: UserProfile) => saveStoredData(STORAGE_KEYS.PROFILE, p),

  getSubjects: (): Subject[] => getStoredData(STORAGE_KEYS.SUBJECTS, GATE_EE_SUBJECTS),
  saveSubjects: (s: Subject[]) => saveStoredData(STORAGE_KEYS.SUBJECTS, s),

  getTasks: (): StudyTask[] => getStoredData(STORAGE_KEYS.TASKS, INITIAL_STUDY_TASKS),
  saveTasks: (t: StudyTask[]) => saveStoredData(STORAGE_KEYS.TASKS, t),

  getQuestionAttempts: (): QuestionAttempt[] => getStoredData(STORAGE_KEYS.QUESTION_ATTEMPTS, INITIAL_QUESTION_ATTEMPTS),
  saveQuestionAttempts: (a: QuestionAttempt[]) => saveStoredData(STORAGE_KEYS.QUESTION_ATTEMPTS, a),

  getBookmarks: (): string[] => getStoredData(STORAGE_KEYS.BOOKMARKED_QUESTIONS, ['gate-ee-2024-q2', 'gate-ee-2023-q1']),
  saveBookmarks: (b: string[]) => saveStoredData(STORAGE_KEYS.BOOKMARKED_QUESTIONS, b),

  getMockAttempts: (): MockAttempt[] => getStoredData(STORAGE_KEYS.MOCK_ATTEMPTS, INITIAL_MOCK_ATTEMPTS),
  saveMockAttempts: (m: MockAttempt[]) => saveStoredData(STORAGE_KEYS.MOCK_ATTEMPTS, m),

  getFormulas: (): FormulaCard[] => getStoredData(STORAGE_KEYS.FORMULA_CARDS, GATE_EE_FORMULAS),
  saveFormulas: (f: FormulaCard[]) => saveStoredData(STORAGE_KEYS.FORMULA_CARDS, f),

  getStudySessions: (): StudySessionLog[] => getStoredData(STORAGE_KEYS.STUDY_SESSIONS, INITIAL_STUDY_SESSIONS),
  saveStudySessions: (s: StudySessionLog[]) => saveStoredData(STORAGE_KEYS.STUDY_SESSIONS, s),

  // Reset to initial defaults
  resetAll: () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.QUESTION_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.MOCK_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKED_QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.FORMULA_CARDS);
    localStorage.removeItem(STORAGE_KEYS.STUDY_SESSIONS);
  },

  // Export full JSON backup
  exportBackup: () => {
    return JSON.stringify({
      profile: StorageService.getProfile(),
      subjects: StorageService.getSubjects(),
      tasks: StorageService.getTasks(),
      questionAttempts: StorageService.getQuestionAttempts(),
      mockAttempts: StorageService.getMockAttempts(),
      bookmarks: StorageService.getBookmarks(),
      formulas: StorageService.getFormulas(),
      sessions: StorageService.getStudySessions(),
      exportTimestamp: new Date().toISOString()
    }, null, 2);
  },

  // Import JSON backup
  importBackup: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) StorageService.saveProfile(data.profile);
      if (data.subjects) StorageService.saveSubjects(data.subjects);
      if (data.tasks) StorageService.saveTasks(data.tasks);
      if (data.questionAttempts) StorageService.saveQuestionAttempts(data.questionAttempts);
      if (data.mockAttempts) StorageService.saveMockAttempts(data.mockAttempts);
      if (data.bookmarks) StorageService.saveBookmarks(data.bookmarks);
      if (data.formulas) StorageService.saveFormulas(data.formulas);
      if (data.sessions) StorageService.saveStudySessions(data.sessions);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }
};
