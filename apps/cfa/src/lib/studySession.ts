// Study session management for enhanced learning experience
import { ExamProfile } from './certifications';

export interface QuestionAttempt {
  questionId: string;
  objectiveId: string;
  correct: boolean;
  timeSpent: number; // seconds
  attempt: number; // 1st, 2nd, 3rd attempt, etc.
  timestamp: Date;
  difficulty?: 'easy' | 'medium' | 'hard';
  relatedFlashcardId?: string; // If question was generated from a flashcard
}

export interface FlashcardAttempt {
  flashcardId: string;
  objectiveId: string;
  difficulty: 'easy' | 'medium' | 'hard'; // User-rated difficulty
  timeSpent: number; // seconds viewing the flashcard
  masteryLevel: 'again' | 'hard' | 'good' | 'easy'; // Spaced repetition rating
  timestamp: Date;
  attempt: number;
  relatedQuestionId?: string; // If flashcard was generated from a question
}

export interface LearningRelationship {
  id: string;
  sourceType: 'question' | 'flashcard';
  sourceId: string;
  targetType: 'question' | 'flashcard';
  targetId: string;
  createdAt: Date;
  objectiveId: string;
}

export interface ObjectiveProgress {
  objectiveId: string;
  questionsAttempted: number;
  questionsCorrect: number;
  flashcardsAttempted: number;
  totalTimeSpent: number;
  averageScore: number;
  flashcardMasteryScore: number; // Average mastery across flashcards
  masteryLevel: 'novice' | 'developing' | 'proficient' | 'mastery';
  lastStudied: Date;
  attempts: QuestionAttempt[];
  flashcardAttempts: FlashcardAttempt[];
  needsReview: boolean; // For spaced repetition
  nextReviewDate?: Date;
}

export interface StudySession {
  sessionId: string;
  examId: string;
  examProfile: ExamProfile;
  currentObjectiveId: string;
  currentObjectiveIndex: number;
  questionsPerObjective: number;
  startTime: Date;
  endTime?: Date;
  objectives: ObjectiveProgress[];
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalFlashcardsStudied: number;
  sessionScore: number;
  studyMode: 'focus' | 'review' | 'comprehensive' | 'weakness';
  examMode: 'prep' | 'efficient' | 'mock'; // New exam modes
  examConditions: ExamConditions;
  activeMode: 'quiz' | 'flashcards' | 'flashcard-questions' | 'history' | 'efficient' | 'mock';
  learningRelationships: LearningRelationship[];
  currentFlashcardSource?: string; // ID of flashcard when in flashcard-questions mode
  // Exam timing fields
  timeRemaining?: number; // seconds remaining for timed exams
  isBreakActive?: boolean; // For mock exams with breaks
  breakStartTime?: Date;
  breakEndTime?: Date;
  isPaused?: boolean;
  pausedAt?: Date;
}

export interface StudySessionConfig {
  examId: string;
  questionsPerObjective?: number;
  studyMode: 'focus' | 'review' | 'comprehensive' | 'weakness';
  examMode: 'prep' | 'efficient' | 'mock'; // New exam modes
  targetObjectiveIds?: string[]; // For focused study
  timeLimit?: number; // minutes
  adaptiveDifficulty: boolean;
  spaceRepetition: boolean;
}

export interface ObjectiveQuestionDistribution {
  objectiveId: string;
  questionCount: number;
  weight: number; // Percentage of total questions
}

export interface ExamConditions {
  totalQuestions: number;
  timeAllotted: number; // minutes
  questionSampling?: ObjectiveQuestionDistribution[];
  strictTiming: boolean;
  hasBreaks?: boolean;
  sessionBreakAt?: number; // Question number for break (mock exams)
}

export class StudySessionManager {
  private static readonly STORAGE_KEY = 'cfa-study-sessions';
  private static readonly PROGRESS_KEY = 'cfa-study-progress';

  static createStudySession(config: StudySessionConfig, examProfile: ExamProfile): StudySession {
    const sessionId = `session-${Date.now()}`;
    const questionsPerObjective = config.questionsPerObjective || examProfile.studySettings?.defaultQuestionsPerObjective || 10;
    
    // Determine which objectives to study
    const targetObjectives = config.targetObjectiveIds 
      ? examProfile.objectives.filter(obj => config.targetObjectiveIds!.includes(obj.id))
      : examProfile.objectives;

    // Create exam conditions based on mode
    const examConditions = StudySessionManager.createExamConditions(config.examMode, examProfile);

    // Initialize objective progress
    const objectives: ObjectiveProgress[] = targetObjectives.map(objective => ({
      objectiveId: objective.id,
      questionsAttempted: 0,
      questionsCorrect: 0,
      flashcardsAttempted: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      flashcardMasteryScore: 0,
      masteryLevel: 'novice',
      lastStudied: new Date(),
      attempts: [],
      flashcardAttempts: [],
      needsReview: false
    }));

    const session: StudySession = {
      sessionId,
      examId: config.examId,
      examProfile,
      currentObjectiveId: targetObjectives[0]?.id || '',
      currentObjectiveIndex: 0,
      questionsPerObjective,
      startTime: new Date(),
      objectives,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      totalFlashcardsStudied: 0,
      sessionScore: 0,
      studyMode: config.studyMode,
      examMode: config.examMode,
      examConditions,
      activeMode: config.examMode === 'prep' ? 'quiz' : config.examMode,
      learningRelationships: [],
      timeRemaining: examConditions.strictTiming ? examConditions.timeAllotted * 60 : undefined, // Convert to seconds
      isPaused: false
    };

    return session;
  }

  static createExamConditions(examMode: 'prep' | 'efficient' | 'mock', examProfile: ExamProfile): ExamConditions {
    const totalQuestions = examProfile.constraints?.totalQuestions || 180;
    const totalTime = examProfile.constraints?.timeMinutes || 270;

    switch (examMode) {
      case 'prep':
        return {
          totalQuestions: Infinity, // Unlimited questions
          timeAllotted: 0, // No time limit
          strictTiming: false,
          hasBreaks: false
        };
      
      case 'efficient':
        // 30% of total questions, proportionally distributed
        const efficientQuestions = Math.round(totalQuestions * 0.3);
        return {
          totalQuestions: efficientQuestions,
          timeAllotted: Math.round(totalTime * 0.3), // Proportional time
          strictTiming: false, // Suggested pace only
          hasBreaks: false,
          questionSampling: StudySessionManager.createQuestionSampling(examProfile, efficientQuestions)
        };
      
      case 'mock':
        return {
          totalQuestions,
          timeAllotted: totalTime,
          strictTiming: true,
          hasBreaks: true,
          sessionBreakAt: Math.floor(totalQuestions / 2), // Break halfway through
          questionSampling: StudySessionManager.createQuestionSampling(examProfile, totalQuestions)
        };
      
      default:
        throw new Error(`Unknown exam mode: ${examMode}`);
    }
  }

  static createQuestionSampling(examProfile: ExamProfile, totalQuestions: number): ObjectiveQuestionDistribution[] {
    const objectives = examProfile.objectives;
    const totalWeight = objectives.reduce((sum, obj) => sum + obj.weight, 0);
    
    return objectives.map(objective => {
      const weight = objective.weight / totalWeight;
      const questionCount = Math.max(1, Math.round(totalQuestions * weight));
      
      return {
        objectiveId: objective.id,
        questionCount,
        weight: weight * 100 // Convert to percentage
      };
    });
  }

  static recordQuestionAttempt(session: StudySession, attempt: QuestionAttempt): StudySession {
    const updatedSession = { ...session };
    const objectiveProgress = updatedSession.objectives.find(obj => obj.objectiveId === attempt.objectiveId);
    
    if (objectiveProgress) {
      // Add the attempt
      objectiveProgress.attempts.push(attempt);
      objectiveProgress.questionsAttempted++;
      objectiveProgress.totalTimeSpent += attempt.timeSpent;
      objectiveProgress.lastStudied = new Date();

      if (attempt.correct) {
        objectiveProgress.questionsCorrect++;
        updatedSession.totalCorrectAnswers++;
      }

      // Update average score
      objectiveProgress.averageScore = (objectiveProgress.questionsCorrect / objectiveProgress.questionsAttempted) * 100;

      // Update mastery level based on recent performance
      objectiveProgress.masteryLevel = this.calculateMasteryLevel(objectiveProgress);

      // Update session totals
      updatedSession.totalQuestionsAnswered++;
      updatedSession.sessionScore = (updatedSession.totalCorrectAnswers / updatedSession.totalQuestionsAnswered) * 100;
    }

    return updatedSession;
  }

  static recordFlashcardAttempt(session: StudySession, attempt: FlashcardAttempt): StudySession {
    const updatedSession = { ...session };
    const objectiveProgress = updatedSession.objectives.find(obj => obj.objectiveId === attempt.objectiveId);
    
    if (objectiveProgress) {
      // Add the flashcard attempt
      objectiveProgress.flashcardAttempts.push(attempt);
      objectiveProgress.flashcardsAttempted++;
      objectiveProgress.totalTimeSpent += attempt.timeSpent;
      objectiveProgress.lastStudied = new Date();

      // Update flashcard mastery score based on spaced repetition ratings
      const masteryScores = objectiveProgress.flashcardAttempts.map(att => {
        switch (att.masteryLevel) {
          case 'easy': return 4;
          case 'good': return 3;
          case 'hard': return 2;
          case 'again': return 1;
          default: return 2;
        }
      });
      objectiveProgress.flashcardMasteryScore = masteryScores.reduce((sum, score) => sum + score, 0) / masteryScores.length;

      // Update session totals
      updatedSession.totalFlashcardsStudied++;
    }

    return updatedSession;
  }

  static addLearningRelationship(session: StudySession, relationship: LearningRelationship): StudySession {
    const updatedSession = { ...session };
    updatedSession.learningRelationships.push(relationship);
    return updatedSession;
  }

  static switchActiveMode(session: StudySession, mode: 'quiz' | 'flashcards' | 'flashcard-questions' | 'history' | 'efficient' | 'mock', flashcardSource?: string): StudySession {
    const updatedSession = { ...session };
    updatedSession.activeMode = mode;
    if (mode === 'flashcard-questions' && flashcardSource) {
      updatedSession.currentFlashcardSource = flashcardSource;
    } else if (mode !== 'flashcard-questions') {
      updatedSession.currentFlashcardSource = undefined;
    }
    return updatedSession;
  }

  static shouldMoveToNextObjective(session: StudySession, currentObjectiveId: string): boolean {
    const objectiveProgress = session.objectives.find(obj => obj.objectiveId === currentObjectiveId);
    if (!objectiveProgress) return true;

    const objective = session.examProfile.objectives.find(obj => obj.id === currentObjectiveId);
    const questionsPerSession = objective?.questionsPerSession || session.questionsPerObjective;

    // Check if we've reached the question limit for this objective
    if (objectiveProgress.questionsAttempted >= questionsPerSession) {
      return true;
    }

    // Check if mastery threshold is reached (optional early completion)
    const masteryThreshold = session.examProfile.studySettings?.masteryThreshold || 80;
    if (objectiveProgress.averageScore >= masteryThreshold && objectiveProgress.questionsAttempted >= Math.min(5, questionsPerSession)) {
      return true;
    }

    return false;
  }

  static getNextObjective(session: StudySession): { objectiveId: string; objectiveIndex: number } | null {
    const currentIndex = session.currentObjectiveIndex;
    const nextIndex = currentIndex + 1;

    if (nextIndex >= session.objectives.length) {
      return null; // All objectives completed
    }

    const nextObjective = session.objectives[nextIndex];
    return {
      objectiveId: nextObjective.objectiveId,
      objectiveIndex: nextIndex
    };
  }

  static getObjectivesToReview(session: StudySession): ObjectiveProgress[] {
    return session.objectives.filter(obj => 
      obj.needsReview || 
      obj.masteryLevel === 'novice' || 
      obj.masteryLevel === 'developing'
    );
  }

  static getWeakObjectives(session: StudySession): ObjectiveProgress[] {
    return session.objectives
      .filter(obj => obj.questionsAttempted > 0)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3); // Top 3 weakest areas
  }

  private static calculateMasteryLevel(progress: ObjectiveProgress): 'novice' | 'developing' | 'proficient' | 'mastery' {
    const { averageScore, questionsAttempted, flashcardMasteryScore, flashcardsAttempted } = progress;

    // Need some activity to assess mastery
    if (questionsAttempted === 0 && flashcardsAttempted === 0) return 'novice';
    
    // Combined score considers both questions and flashcards
    let combinedScore = 0;
    let totalWeight = 0;
    
    if (questionsAttempted > 0) {
      combinedScore += averageScore * questionsAttempted;
      totalWeight += questionsAttempted;
    }
    
    if (flashcardsAttempted > 0) {
      // Convert flashcard mastery score (1-4) to percentage (25-100)
      const flashcardPercentage = (flashcardMasteryScore - 1) * 25;
      combinedScore += flashcardPercentage * flashcardsAttempted;
      totalWeight += flashcardsAttempted;
    }
    
    const overallScore = totalWeight > 0 ? combinedScore / totalWeight : 0;
    const totalAttempts = questionsAttempted + flashcardsAttempted;
    
    if (totalAttempts < 3) return 'developing';
    
    if (overallScore >= 90) return 'mastery';
    if (overallScore >= 75) return 'proficient';
    if (overallScore >= 60) return 'developing';
    return 'novice';
  }

  // Persistence methods
  static saveSession(session: StudySession): void {
    const sessions = this.loadSessions();
    const existingIndex = sessions.findIndex(s => s.sessionId === session.sessionId);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
  }

  static loadSessions(): StudySession[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static loadSession(sessionId: string): StudySession | null {
    const sessions = this.loadSessions();
    return sessions.find(s => s.sessionId === sessionId) || null;
  }

  static getStudyProgress(examId: string): ObjectiveProgress[] {
    const sessions = this.loadSessions();
    const examSessions = sessions.filter(s => s.examId === examId);
    
    if (examSessions.length === 0) return [];

    // Aggregate progress across all sessions for this exam
    const aggregatedProgress = new Map<string, ObjectiveProgress>();

    examSessions.forEach(session => {
      session.objectives.forEach(objProgress => {
        const existing = aggregatedProgress.get(objProgress.objectiveId);
        
        if (!existing) {
          aggregatedProgress.set(objProgress.objectiveId, { ...objProgress });
        } else {
          // Merge progress data
          existing.questionsAttempted += objProgress.questionsAttempted;
          existing.questionsCorrect += objProgress.questionsCorrect;
          existing.flashcardsAttempted += objProgress.flashcardsAttempted;
          existing.totalTimeSpent += objProgress.totalTimeSpent;
          existing.attempts.push(...objProgress.attempts);
          existing.flashcardAttempts.push(...objProgress.flashcardAttempts);
          existing.lastStudied = objProgress.lastStudied > existing.lastStudied 
            ? objProgress.lastStudied 
            : existing.lastStudied;
          
          // Recalculate scores
          existing.averageScore = existing.questionsAttempted > 0 
            ? (existing.questionsCorrect / existing.questionsAttempted) * 100 
            : 0;
            
          // Recalculate flashcard mastery score
          if (existing.flashcardAttempts.length > 0) {
            const masteryScores = existing.flashcardAttempts.map(att => {
              switch (att.masteryLevel) {
                case 'easy': return 4;
                case 'good': return 3;
                case 'hard': return 2;
                case 'again': return 1;
                default: return 2;
              }
            });
            existing.flashcardMasteryScore = masteryScores.reduce((sum, score) => sum + score, 0) / masteryScores.length;
          }
          
          existing.masteryLevel = this.calculateMasteryLevel(existing);
        }
      });
    });

    return Array.from(aggregatedProgress.values());
  }

  static clearAllSessions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PROGRESS_KEY);
  }
}
