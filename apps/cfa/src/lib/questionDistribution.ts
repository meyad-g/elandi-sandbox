// Question Distribution Management System
// Tracks and enforces question style ratios across study sessions

import { QuestionStyle, selectQuestionPattern, DEFAULT_QUESTION_DISTRIBUTION, EXAM_PATTERN_PREFERENCES } from './questionPatterns';
import { ExamProfile, ExamObjective } from './certifications';

export interface QuestionDistributionState {
  sessionId: string;
  examId: string;
  totalQuestions: number;
  questionCounts: Record<QuestionStyle, number>;
  objectiveDistribution: Record<string, Record<QuestionStyle, number>>;
  lastUpdated: Date;
}

export interface DistributionTarget {
  direct: number;
  scenario: number;
  case_study: number;
}

// In-memory storage for session-level distribution tracking
// In production, this could be moved to Redis or database
const sessionDistributions = new Map<string, QuestionDistributionState>();

// Session timeout (2 hours)
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export class QuestionDistributionManager {
  
  /**
   * Initialize or get existing distribution state for a session
   */
  static initializeSession(sessionId: string, examId: string): QuestionDistributionState {
    const existing = sessionDistributions.get(sessionId);
    
    // Return existing if valid and not expired
    if (existing && existing.examId === examId) {
      const timeDiff = Date.now() - existing.lastUpdated.getTime();
      if (timeDiff < SESSION_TIMEOUT_MS) {
        return existing;
      }
    }
    
    // Create new session state
    const newState: QuestionDistributionState = {
      sessionId,
      examId,
      totalQuestions: 0,
      questionCounts: {
        direct: 0,
        scenario: 0,
        case_study: 0
      },
      objectiveDistribution: {},
      lastUpdated: new Date()
    };
    
    sessionDistributions.set(sessionId, newState);
    return newState;
  }
  
  /**
   * Get the next question style to generate based on current distribution
   */
  static getNextQuestionStyle(
    sessionId: string,
    examProfile: ExamProfile,
    objective: ExamObjective
  ): QuestionStyle {
    const state = this.initializeSession(sessionId, examProfile.id);
    
    // Get current distribution for this objective
    const objectiveKey = objective.id;
    const currentObjectiveDist = state.objectiveDistribution[objectiveKey] || {
      direct: 0,
      scenario: 0,
      case_study: 0
    };
    
    // Calculate total questions for this objective
    const objectiveTotal = Object.values(currentObjectiveDist).reduce((sum, count) => sum + count, 0);
    
    // Select pattern based on current distribution
    const selectedStyle = selectQuestionPattern(
      examProfile.id,
      objective,
      currentObjectiveDist,
      objectiveTotal
    );
    
    return selectedStyle;
  }
  
  /**
   * Record that a question of a specific style was generated
   */
  static recordQuestionGenerated(
    sessionId: string,
    examId: string,
    objectiveId: string,
    style: QuestionStyle
  ): void {
    const state = this.initializeSession(sessionId, examId);
    
    // Update overall counts
    state.totalQuestions++;
    state.questionCounts[style]++;
    
    // Update objective-specific counts
    if (!state.objectiveDistribution[objectiveId]) {
      state.objectiveDistribution[objectiveId] = {
        direct: 0,
        scenario: 0,
        case_study: 0
      };
    }
    state.objectiveDistribution[objectiveId][style]++;
    
    // Update timestamp
    state.lastUpdated = new Date();
    
    sessionDistributions.set(sessionId, state);
  }
  
  /**
   * Get current distribution statistics for a session
   */
  static getDistributionStats(sessionId: string): QuestionDistributionState | null {
    const state = sessionDistributions.get(sessionId);
    if (!state) return null;
    
    // Check if session is expired
    const timeDiff = Date.now() - state.lastUpdated.getTime();
    if (timeDiff >= SESSION_TIMEOUT_MS) {
      sessionDistributions.delete(sessionId);
      return null;
    }
    
    return state;
  }
  
  /**
   * Get target distribution for an exam
   */
  static getTargetDistribution(examId: string): DistributionTarget {
    return EXAM_PATTERN_PREFERENCES[examId] || DEFAULT_QUESTION_DISTRIBUTION;
  }
  
  /**
   * Calculate how well current distribution matches target
   */
  static calculateDistributionHealth(sessionId: string, examId: string): {
    overallHealth: number;
    styleDeviations: Record<QuestionStyle, number>;
    recommendations: string[];
  } {
    const state = this.getDistributionStats(sessionId);
    if (!state || state.totalQuestions === 0) {
      return {
        overallHealth: 100,
        styleDeviations: { direct: 0, scenario: 0, case_study: 0 },
        recommendations: []
      };
    }
    
    const target = this.getTargetDistribution(examId);
    const current = {
      direct: state.questionCounts.direct / state.totalQuestions,
      scenario: state.questionCounts.scenario / state.totalQuestions,
      case_study: state.questionCounts.case_study / state.totalQuestions
    };
    
    // Calculate deviations
    const styleDeviations = {
      direct: Math.abs(current.direct - target.direct),
      scenario: Math.abs(current.scenario - target.scenario),
      case_study: Math.abs(current.case_study - target.case_study)
    };
    
    // Overall health score (0-100, where 100 is perfect distribution)
    const totalDeviation = Object.values(styleDeviations).reduce((sum, dev) => sum + dev, 0);
    const overallHealth = Math.max(0, 100 - (totalDeviation * 100));
    
    // Generate recommendations
    const recommendations: string[] = [];
    Object.entries(styleDeviations).forEach(([style, deviation]) => {
      if (deviation > 0.15) { // 15% deviation threshold
        const isOver = current[style as QuestionStyle] > target[style as QuestionStyle];
        recommendations.push(
          `${isOver ? 'Reduce' : 'Increase'} ${style} questions (currently ${(current[style as QuestionStyle] * 100).toFixed(1)}%, target ${(target[style as QuestionStyle] * 100).toFixed(1)}%)`
        );
      }
    });
    
    return {
      overallHealth: Math.round(overallHealth),
      styleDeviations,
      recommendations
    };
  }
  
  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): number {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [sessionId, state] of sessionDistributions.entries()) {
      const timeDiff = now - state.lastUpdated.getTime();
      if (timeDiff >= SESSION_TIMEOUT_MS) {
        sessionDistributions.delete(sessionId);
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  /**
   * Reset distribution for a session (useful for testing or session restart)
   */
  static resetSession(sessionId: string): void {
    sessionDistributions.delete(sessionId);
  }
  
  /**
   * Get distribution summary for debugging/monitoring
   */
  static getDistributionSummary(sessionId: string): {
    totalQuestions: number;
    percentages: Record<QuestionStyle, number>;
    target: DistributionTarget;
    health: number;
  } | null {
    const state = this.getDistributionStats(sessionId);
    if (!state) return null;
    
    const target = this.getTargetDistribution(state.examId);
    const percentages = {
      direct: state.totalQuestions > 0 ? (state.questionCounts.direct / state.totalQuestions) * 100 : 0,
      scenario: state.totalQuestions > 0 ? (state.questionCounts.scenario / state.totalQuestions) * 100 : 0,
      case_study: state.totalQuestions > 0 ? (state.questionCounts.case_study / state.totalQuestions) * 100 : 0
    };
    
    const health = this.calculateDistributionHealth(sessionId, state.examId);
    
    return {
      totalQuestions: state.totalQuestions,
      percentages,
      target: {
        direct: target.direct * 100,
        scenario: target.scenario * 100,
        case_study: target.case_study * 100
      },
      health: health.overallHealth
    };
  }
}

// Utility function to generate a session ID if needed
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Periodic cleanup of expired sessions (call this from a background job)
setInterval(() => {
  const cleaned = QuestionDistributionManager.cleanupExpiredSessions();
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired question distribution sessions`);
  }
}, 30 * 60 * 1000); // Run every 30 minutes


