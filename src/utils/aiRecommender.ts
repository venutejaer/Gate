/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Subject, 
  QuestionAttempt, 
  MockAttempt, 
  WeaknessAnalysis, 
  MistakeReason,
  SubjectCode 
} from '../types';
import { VERIFIED_GATE_PYQS } from '../data/gateData';

export function analyzeWeaknesses(
  subjects: Subject[],
  attempts: QuestionAttempt[],
  mockAttempts: MockAttempt[]
): WeaknessAnalysis[] {
  return subjects.map(subject => {
    // 1. Gather all questions for this subject
    const subjectQuestions = VERIFIED_GATE_PYQS.filter(q => q.subjectId === subject.id);
    const subjectQIds = new Set(subjectQuestions.map(q => q.id));

    // 2. Gather user question attempts in this subject
    const subjectAttempts = attempts.filter(a => subjectQIds.has(a.questionId));
    const totalAttempted = subjectAttempts.length;
    const correctCount = subjectAttempts.filter(a => a.isCorrect).length;
    const incorrectCount = totalAttempted - correctCount;

    // 3. Mock test performance in this subject
    let mockTotalQuestions = 0;
    let mockScored = 0;
    let mockMaxMarks = 0;

    mockAttempts.forEach(mock => {
      const b = mock.subjectBreakdown?.[subject.id];
      if (b && b.total > 0) {
        mockTotalQuestions += b.total;
        mockScored += b.scored;
        mockMaxMarks += b.total * 2; // approx 2 marks avg
      }
    });

    // 4. Syllabus completion & confidence
    const topics = subject.topics;
    const completedTopics = topics.filter(t => t.status === 'completed').length;
    const lowConfidenceTopics = topics.filter(t => t.confidence <= 2 || t.status === 'not-started');

    // 5. Accuracy calculation
    const baseAccuracy = totalAttempted > 0 ? (correctCount / totalAttempted) * 100 : 65; // default moderate if no attempts yet

    // 6. Mistake reasons taxonomy
    const mistakeMap: Record<MistakeReason, number> = {
      'Formula forgotten': 0,
      'Calculation error': 0,
      'Conceptual slip': 0,
      'Time pressure': 0,
      'Misread question': 0,
      'Guesswork': 0,
      'Unit conversion error': 0
    };

    subjectAttempts.forEach(a => {
      if (!a.isCorrect && a.mistakeReason) {
        mistakeMap[a.mistakeReason] = (mistakeMap[a.mistakeReason] || 0) + 1;
      }
    });

    const frequentMistakes = (Object.keys(mistakeMap) as MistakeReason[])
      .map(reason => ({ reason, count: mistakeMap[reason] }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);

    // 7. Calculate Vulnerability Score (0 to 100, higher means more vulnerable/weaker)
    // Formula components:
    // - Inaccuracy penalty (up to 40 pts)
    // - Weightage multiplier (high weightage subjects like Machines/PS need urgent attention) (up to 25 pts)
    // - Uncompleted/Low confidence topics ratio (up to 25 pts)
    // - Mock test error penalty (up to 10 pts)
    const inaccuracyFactor = (100 - baseAccuracy) * 0.40;
    const weightageFactor = (subject.approxMarks / 15) * 25;
    const syllabusIncompleteRatio = (topics.length - completedTopics) / Math.max(topics.length, 1);
    const syllabusFactor = syllabusIncompleteRatio * 25;
    const mockDeficit = mockTotalQuestions > 0 ? Math.max(0, (1 - (mockScored / Math.max(mockMaxMarks, 1))) * 10) : 5;

    const vulnerabilityScore = Math.min(
      100,
      Math.max(10, Math.round(inaccuracyFactor + (weightageFactor * 0.5) + syllabusFactor + mockDeficit))
    );

    // 8. Generate Specific Recommended Action
    let recommendedAction = '';
    const topWeakTopic = lowConfidenceTopics[0]?.name || topics[0]?.name || 'Core Fundamentals';

    if (frequentMistakes[0]?.reason === 'Calculation error') {
      recommendedAction = `High calculation errors detected. Practise NAT questions in ${topWeakTopic} using the GATE virtual calculator.`;
    } else if (frequentMistakes[0]?.reason === 'Formula forgotten') {
      recommendedAction = `Formula recall gaps. Revise formula cards for ${subject.shortName} and test yourself with spaced repetition flashcards.`;
    } else if (frequentMistakes[0]?.reason === 'Conceptual slip') {
      recommendedAction = `Conceptual revision needed for ${topWeakTopic}. Re-study derivations before attempting further PYQs.`;
    } else if (syllabusIncompleteRatio > 0.5) {
      recommendedAction = `${Math.round(syllabusIncompleteRatio * 100)}% syllabus uncompleted in this high-yield subject. Schedule daily 90-min theory sessions.`;
    } else {
      recommendedAction = `Maintain strength! Solve 5 high-difficulty PYQs from 2022-2024 to lock in 100% accuracy.`;
    }

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      vulnerabilityScore,
      accuracyPercent: Math.round(baseAccuracy),
      attemptedQuestions: totalAttempted,
      frequentMistakeTypes: frequentMistakes,
      weakTopics: lowConfidenceTopics.map(t => t.name).slice(0, 3),
      recommendedAction,
      priorityRank: 0
    };
  })
  .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore)
  .map((item, idx) => ({ ...item, priorityRank: idx + 1 }));
}
