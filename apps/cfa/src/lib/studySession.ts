// Study session management for enhanced learning experience
import { ExamObjective, ExamProfile } from './certifications';

export interface QuestionAttempt {
  questionId: string;
  objectiveId: string;
  correct: boolean;
  timeSpent: number; // seconds
  attempt: number; // 1st, 2nd, 3rd attempt, etc.
  timestamp: Date;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ObjectiveProgress {
  objectiveId: string;
  questionsAttempted: number;
  questionsCorrect: number;
  totalTimeSpent: number;
  averageScore: number;
  masteryLevel: 'novice' | 'developing' | 'proficient' | 'mastery';
  lastStudied: Date;
  attempts: QuestionAttempt[];
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
  sessionScore: number;
  studyMode: 'focus' | 'review' | 'comprehensive' | 'weakness';
}

export interface StudySessionConfig {
  examId: string;
  questionsPerObjective?: number;
  studyMode: 'focus' | 'review' | 'comprehensive' | 'weakness';
  targetObjectiveIds?: string[]; // For focused study
  timeLimit?: number; // minutes
  adaptiveDifficulty: boolean;
  spaceRepetition: boolean;
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

    // Initialize objective progress
    const objectives: ObjectiveProgress[] = targetObjectives.map(objective => ({
      objectiveId: objective.id,
      questionsAttempted: 0,
      questionsCorrect: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      masteryLevel: 'novice',
      lastStudied: new Date(),
      attempts: [],
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
      sessionScore: 0,
      studyMode: config.studyMode
    };

    return session;
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
    const { averageScore, questionsAttempted } = progress;

    if (questionsAttempted === 0) return 'novice';
    if (questionsAttempted < 5) return 'developing';
    
    if (averageScore >= 90) return 'mastery';
    if (averageScore >= 75) return 'proficient';
    if (averageScore >= 60) return 'developing';
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
          existing.totalTimeSpent += objProgress.totalTimeSpent;
          existing.attempts.push(...objProgress.attempts);
          existing.lastStudied = objProgress.lastStudied > existing.lastStudied 
            ? objProgress.lastStudied 
            : existing.lastStudied;
          
          // Recalculate average score
          existing.averageScore = (existing.questionsCorrect / existing.questionsAttempted) * 100;
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
