/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubjectCode = 
  | 'EM'  // Engineering Mathematics
  | 'NT'  // Electric Circuits / Network Theory
  | 'EMF' // Electromagnetic Fields
  | 'EMC' // Electrical Machines
  | 'PS'  // Power Systems
  | 'PE'  // Power Electronics
  | 'CS'  // Control Systems
  | 'SS'  // Signals and Systems
  | 'EEM' // Electrical and Electronic Measurements
  | 'ADE' // Analog and Digital Electronics
  | 'GA'; // General Aptitude

export type TopicStatus = 'not-started' | 'in-progress' | 'completed';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface Topic {
  id: string;
  subjectId: SubjectCode;
  name: string;
  status: TopicStatus;
  priority: PriorityLevel;
  confidence: number; // 1 to 5
  revisionsCount: number;
  lastRevisedDate?: string;
  notes?: string;
  pyqTotal: number;
  pyqSolved: number;
  weightageMarks: number;
}

export interface Subject {
  id: SubjectCode;
  name: string;
  shortName: string;
  iconName: string;
  weightageRange: string; // e.g., "10 - 12 Marks"
  approxMarks: number;
  color: string;
  description: string;
  topics: Topic[];
}

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';
export type QuestionDifficulty = 'Easy' | 'Moderate' | 'Challenging';

export interface PYQuestion {
  id: string;
  year: number;
  paper: 'EE';
  subjectId: SubjectCode;
  topicName: string;
  questionType: QuestionType;
  marks: 1 | 2;
  negativeMarks: number; // 0.33 for 1-mark MCQ, 0.66 for 2-mark MCQ, 0 for NAT/MSQ
  questionText: string;
  diagramSvg?: string; // Optional SVG or ASCII schematic representation
  options?: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctOption?: 'A' | 'B' | 'C' | 'D'; // for MCQ
  correctOptions?: ('A' | 'B' | 'C' | 'D')[]; // for MSQ
  numericAnswerMin?: number; // for NAT
  numericAnswerMax?: number; // for NAT
  officialExplanation: string;
  difficulty: QuestionDifficulty;
  sourcePaper: string; // e.g. "GATE 2024 EE (Session 1)"
  tags: string[];
}

export type MistakeReason = 
  | 'Formula forgotten'
  | 'Calculation error'
  | 'Conceptual slip'
  | 'Time pressure'
  | 'Misread question'
  | 'Guesswork'
  | 'Unit conversion error';

export interface QuestionAttempt {
  questionId: string;
  userOption?: 'A' | 'B' | 'C' | 'D';
  userOptions?: ('A' | 'B' | 'C' | 'D')[];
  userNumericAnswer?: number;
  isCorrect: boolean;
  timeSpentSec: number;
  timestamp: string;
  mistakeReason?: MistakeReason;
  notes?: string;
}

export type PaletteStatus = 
  | 'not-visited'
  | 'not-answered'
  | 'answered'
  | 'marked-for-review'
  | 'answered-and-marked';

export interface MockTest {
  id: string;
  title: string;
  description: string;
  type: 'Full Mock' | 'Subject Mock' | 'Speed Drill';
  subjectId?: SubjectCode;
  durationMinutes: number;
  totalMarks: number;
  questionIds: string[];
  recommendedAIRTarget?: number;
}

export interface MockAttempt {
  id: string;
  testId: string;
  testTitle: string;
  date: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeSpentMinutes: number;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  subjectBreakdown: Record<SubjectCode, {
    total: number;
    scored: number;
    correct: number;
    incorrect: number;
  }>;
}

export interface StudyTask {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: SubjectCode;
  topicName: string;
  durationMinutes: number;
  completed: boolean;
  type: 'theory' | 'pyq' | 'revision' | 'mock';
  priority: 'high' | 'medium' | 'low';
}

export interface FormulaCard {
  id: string;
  subjectId: SubjectCode;
  topic: string;
  title: string;
  formula: string;
  variables: string;
  conditions: string;
  importance: 'Crucial' | 'High' | 'Medium';
  box: 1 | 2 | 3 | 4; // Leitner box: 1 = Daily, 2 = 3 Days, 3 = Weekly, 4 = Mastered
  lastReviewed?: string;
  bookmarked: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  targetYear: number;
  targetAIR: number;
  targetMarks?: number;
  targetScore: number;
  dailyStudyTargetHours: number;
  currentPrepLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Revision Only';
  preferredSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  examDate: string; // e.g. "2025-02-08"
  darkMode: boolean;
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  subjectId: SubjectCode;
  topicName: string;
}

export interface WeaknessAnalysis {
  subjectId: SubjectCode;
  subjectName: string;
  vulnerabilityScore: number; // 0 to 100
  accuracyPercent: number;
  attemptedQuestions: number;
  frequentMistakeTypes: { reason: MistakeReason; count: number }[];
  weakTopics: string[];
  recommendedAction: string;
  priorityRank: number;
}
