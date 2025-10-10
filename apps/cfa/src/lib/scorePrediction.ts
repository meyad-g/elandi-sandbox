import { StudySession, QuestionAttempt, ObjectiveProgress } from './studySession';
import { ExamProfile } from './certifications';

export interface ScorePrediction {
  predictedScore: number; // Expected score on full exam (0-100)
  confidenceInterval: {
    lower: number; // Lower bound of 95% confidence interval
    upper: number; // Upper bound of 95% confidence interval
  };
  reliability: 'Low' | 'Medium' | 'High'; // Based on sample size and variance
  breakdown: ObjectiveScorePredictionEngine[];
  recommendedActions: RecommendedAction[];
}

export interface ObjectiveScorePredictionEngine {
  objectiveId: string;
  currentScore: number; // Current performance on this objective
  predictedScore: number; // Predicted performance on full exam
  confidence: number; // Confidence in this prediction (0-1)
  sampleSize: number; // Number of questions attempted
  trend: 'Improving' | 'Stable' | 'Declining'; // Performance trend
}

export interface RecommendedAction {
  type: 'focus_study' | 'review_weak_areas' | 'continue_practice' | 'ready_for_mock' | 'need_more_data';
  objectiveId?: string; // If action is objective-specific
  message: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface PredictionFactors {
  overallAccuracy: number; // Overall percentage correct
  timePerQuestion: number; // Average seconds per question
  difficultyAdjustment: number; // Adjustment based on question difficulty
  objectiveVariance: number; // Variance in performance across objectives
  trendsAdjustment: number; // Adjustment based on learning trends
}

export class ScorePredictionEngine {
  
  /**
   * Generate score prediction for efficient exam mode
   */
  static generatePrediction(
    session: StudySession,
    examProfile: ExamProfile,
    targetQuestions: number = 54
  ): ScorePrediction {
    
    const factors = ScorePredictionEngine.calculatePredictionFactors(session, examProfile);
    const objectivePredictions = ScorePredictionEngine.calculateObjectivePredictions(session, examProfile);
    
    // Calculate overall predicted score
    const baseScore = factors.overallAccuracy * 100;
    const adjustedScore = ScorePredictionEngine.applyAdjustments(baseScore, factors);
    
    // Calculate confidence interval
    const sampleSize = session.totalQuestionsAnswered;
    const variance = ScorePredictionEngine.calculateVariance(session);
    const confidenceInterval = ScorePredictionEngine.calculateConfidenceInterval(
      adjustedScore, 
      variance, 
      sampleSize, 
      targetQuestions
    );
    
    // Determine reliability
    const reliability = ScorePredictionEngine.determineReliability(sampleSize, variance, targetQuestions);
    
    // Generate recommendations
    const recommendedActions = ScorePredictionEngine.generateRecommendations(
      session,
      objectivePredictions,
      adjustedScore,
      reliability
    );
    
    return {
      predictedScore: Math.max(0, Math.min(100, adjustedScore)),
      confidenceInterval,
      reliability,
      breakdown: objectivePredictions,
      recommendedActions
    };
  }

  /**
   * Calculate key factors that influence score prediction
   */
  private static calculatePredictionFactors(
    session: StudySession,
    examProfile: ExamProfile
  ): PredictionFactors {
    
    const totalQuestions = session.totalQuestionsAnswered;
    if (totalQuestions === 0) {
      return {
        overallAccuracy: 0,
        timePerQuestion: 0,
        difficultyAdjustment: 0,
        objectiveVariance: 0,
        trendsAdjustment: 0
      };
    }

    // Basic accuracy
    const overallAccuracy = session.totalCorrectAnswers / totalQuestions;
    
    // Time analysis
    const totalTime = session.objectives.reduce((sum, obj) => sum + obj.totalTimeSpent, 0);
    const timePerQuestion = totalTime / totalQuestions;
    
    // Difficulty adjustment (more sophisticated analysis would use actual question difficulty)
    const difficultyAdjustment = ScorePredictionEngine.calculateDifficultyAdjustment(session);
    
    // Objective variance
    const objectiveScores = session.objectives
      .filter(obj => obj.questionsAttempted > 0)
      .map(obj => obj.averageScore / 100);
    const objectiveVariance = ScorePredictionEngine.calculateStandardDeviation(objectiveScores);
    
    // Learning trends
    const trendsAdjustment = ScorePredictionEngine.calculateTrendsAdjustment(session);
    
    return {
      overallAccuracy,
      timePerQuestion,
      difficultyAdjustment,
      objectiveVariance,
      trendsAdjustment
    };
  }

  /**
   * Calculate predictions for each objective
   */
  private static calculateObjectivePredictions(
    session: StudySession,
    examProfile: ExamProfile
  ): ObjectiveScorePredictionEngine[] {
    
    return session.objectives.map(objective => {
      const sampleSize = objective.questionsAttempted;
      const currentScore = objective.averageScore;
      
      // Adjust prediction based on sample size and trends
      let predictedScore = currentScore;
      
      if (sampleSize > 0) {
        // Apply regression to the mean for small samples
        const examProfileObjective = examProfile.objectives.find(obj => obj.id === objective.objectiveId);
        const expectedDifficulty = ScorePredictionEngine.getObjectiveDifficulty(examProfileObjective?.difficulty);
        
        if (sampleSize < 5) {
          // Heavy regression to mean for very small samples
          predictedScore = (currentScore * 0.6) + (expectedDifficulty * 0.4);
        } else if (sampleSize < 10) {
          // Moderate regression to mean
          predictedScore = (currentScore * 0.8) + (expectedDifficulty * 0.2);
        }
        
        // Apply trend adjustment
        const trend = ScorePredictionEngine.calculateObjectiveTrend(objective);
        if (trend === 'Improving') {
          predictedScore = Math.min(100, predictedScore * 1.05);
        } else if (trend === 'Declining') {
          predictedScore = Math.max(0, predictedScore * 0.95);
        }
      }
      
      return {
        objectiveId: objective.objectiveId,
        currentScore,
        predictedScore,
        confidence: ScorePredictionEngine.calculateObjectiveConfidence(sampleSize, objective),
        sampleSize,
        trend: ScorePredictionEngine.calculateObjectiveTrend(objective)
      };
    });
  }

  /**
   * Apply various adjustments to base score
   */
  private static applyAdjustments(baseScore: number, factors: PredictionFactors): number {
    let adjustedScore = baseScore;
    
    // Time pressure adjustment
    const targetTimePerQuestion = 90; // 1.5 minutes in seconds
    if (factors.timePerQuestion > 0) {
      const timeFactor = Math.min(2.0, targetTimePerQuestion / factors.timePerQuestion);
      if (timeFactor < 0.8) {
        // Taking too long - may struggle under time pressure
        adjustedScore *= 0.9;
      } else if (timeFactor > 1.5) {
        // Very fast - might be guessing or very confident
        adjustedScore *= (timeFactor > 2.0 ? 0.95 : 1.02);
      }
    }
    
    // Difficulty adjustment
    adjustedScore += factors.difficultyAdjustment;
    
    // Consistency penalty/bonus
    if (factors.objectiveVariance > 0.3) {
      // High variance - inconsistent performance
      adjustedScore *= 0.95;
    } else if (factors.objectiveVariance < 0.1) {
      // Very consistent performance
      adjustedScore *= 1.03;
    }
    
    // Learning trends
    adjustedScore += factors.trendsAdjustment;
    
    return adjustedScore;
  }

  /**
   * Calculate confidence interval using statistical methods
   */
  private static calculateConfidenceInterval(
    predictedScore: number,
    variance: number,
    sampleSize: number,
    targetQuestions: number
  ): { lower: number; upper: number } {
    
    // Use t-distribution for small samples
    const degreesOfFreedom = Math.max(1, sampleSize - 1);
    const tValue = ScorePredictionEngine.getTValue(degreesOfFreedom, 0.05); // 95% confidence
    
    // Scale variance by sample size relative to target
    const scaledVariance = variance * Math.sqrt(targetQuestions / sampleSize);
    const marginOfError = tValue * Math.sqrt(scaledVariance);
    
    return {
      lower: Math.max(0, predictedScore - marginOfError),
      upper: Math.min(100, predictedScore + marginOfError)
    };
  }

  /**
   * Determine reliability of prediction
   */
  private static determineReliability(
    sampleSize: number,
    variance: number,
    targetQuestions: number
  ): 'Low' | 'Medium' | 'High' {
    
    const sampleRatio = sampleSize / targetQuestions;
    
    if (sampleRatio < 0.3 || variance > 0.4) {
      return 'Low';
    } else if (sampleRatio < 0.7 || variance > 0.25) {
      return 'Medium';
    } else {
      return 'High';
    }
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    session: StudySession,
    objectivePredictions: ObjectiveScorePredictionEngine[],
    overallScore: number,
    reliability: 'Low' | 'Medium' | 'High'
  ): RecommendedAction[] {
    
    const recommendations: RecommendedAction[] = [];
    
    // Overall score recommendations
    if (overallScore >= 70) {
      if (reliability === 'High') {
        recommendations.push({
          type: 'ready_for_mock',
          message: 'You\'re performing well! Consider taking a mock exam to validate your readiness.',
          priority: 'High'
        });
      } else {
        recommendations.push({
          type: 'continue_practice',
          message: 'Good progress! Continue practicing to build confidence.',
          priority: 'Medium'
        });
      }
    } else if (overallScore >= 60) {
      recommendations.push({
        type: 'review_weak_areas',
        message: 'You\'re on the right track. Focus on your weaker topics to push over the passing threshold.',
        priority: 'High'
      });
    } else {
      recommendations.push({
        type: 'focus_study',
        message: 'More preparation needed. Consider focused study sessions on fundamental concepts.',
        priority: 'High'
      });
    }

    // Objective-specific recommendations
    const weakObjectives = objectivePredictions
      .filter(obj => obj.predictedScore < 60 && obj.sampleSize >= 3)
      .sort((a, b) => a.predictedScore - b.predictedScore)
      .slice(0, 3); // Top 3 weakest areas

    weakObjectives.forEach(obj => {
      recommendations.push({
        type: 'focus_study',
        objectiveId: obj.objectiveId,
        message: `Focus additional study time on this topic - current prediction: ${Math.round(obj.predictedScore)}%`,
        priority: obj.predictedScore < 50 ? 'High' : 'Medium'
      });
    });

    // Data sufficiency recommendation
    if (session.totalQuestionsAnswered < 20) {
      recommendations.push({
        type: 'need_more_data',
        message: 'Complete more questions for a reliable score prediction.',
        priority: 'Medium'
      });
    }

    return recommendations;
  }

  // Helper methods
  private static calculateDifficultyAdjustment(session: StudySession): number {
    // This would be more sophisticated with actual question difficulty data
    // For now, assume average difficulty and return 0 adjustment
    return 0;
  }

  private static calculateTrendsAdjustment(session: StudySession): number {
    // Analyze recent vs earlier performance to detect learning trends
    const recentAttempts = session.objectives.flatMap(obj => 
      obj.attempts.slice(-5) // Last 5 attempts per objective
    );
    
    if (recentAttempts.length < 5) return 0;
    
    const recentAvg = recentAttempts.reduce((sum, att) => sum + (att.correct ? 1 : 0), 0) / recentAttempts.length;
    const overallAvg = session.totalCorrectAnswers / session.totalQuestionsAnswered;
    
    const improvement = (recentAvg - overallAvg) * 100;
    return Math.max(-5, Math.min(5, improvement)); // Cap adjustment at ±5 points
  }

  private static calculateVariance(session: StudySession): number {
    const objectiveScores = session.objectives
      .filter(obj => obj.questionsAttempted > 0)
      .map(obj => obj.averageScore / 100);
    
    return ScorePredictionEngine.calculateStandardDeviation(objectiveScores) || 0.2; // Default variance
  }

  private static calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  private static calculateObjectiveTrend(objective: ObjectiveProgress): 'Improving' | 'Stable' | 'Declining' {
    if (objective.attempts.length < 3) return 'Stable';
    
    const recentAttempts = objective.attempts.slice(-5);
    const olderAttempts = objective.attempts.slice(-10, -5);
    
    if (olderAttempts.length === 0) return 'Stable';
    
    const recentAvg = recentAttempts.reduce((sum, att) => sum + (att.correct ? 1 : 0), 0) / recentAttempts.length;
    const olderAvg = olderAttempts.reduce((sum, att) => sum + (att.correct ? 1 : 0), 0) / olderAttempts.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 0.1) return 'Improving';
    if (diff < -0.1) return 'Declining';
    return 'Stable';
  }

  private static calculateObjectiveConfidence(sampleSize: number, objective: ObjectiveProgress): number {
    // Confidence based on sample size and consistency
    const baseSizeConfidence = Math.min(1.0, sampleSize / 10); // Full confidence at 10+ questions
    
    if (sampleSize < 2) return baseSizeConfidence;
    
    // Factor in consistency
    const recentScores = objective.attempts.slice(-5).map(att => att.correct ? 1 : 0);
    const consistency = 1 - ScorePredictionEngine.calculateStandardDeviation(recentScores);
    
    return (baseSizeConfidence + consistency) / 2;
  }

  private static getObjectiveDifficulty(difficulty?: string): number {
    // Expected average score based on difficulty level
    switch (difficulty) {
      case 'beginner': return 75;
      case 'intermediate': return 65;
      case 'advanced': return 55;
      default: return 65;
    }
  }

  private static getTValue(degreesOfFreedom: number, alpha: number): number {
    // Simplified t-table lookup for common cases
    // In production, would use a proper statistical library
    const tTable: { [key: number]: number } = {
      1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
      6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
      15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042
    };
    
    if (degreesOfFreedom >= 30) return 1.96; // Use normal distribution
    
    // Find closest match
    const closest = Object.keys(tTable)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - degreesOfFreedom) < Math.abs(prev - degreesOfFreedom) ? curr : prev
      );
    
    return tTable[closest];
  }

  /**
   * Update prediction as user answers more questions
   */
  static updateRealTimePrediction(
    currentPrediction: ScorePrediction,
    session: StudySession,
    examProfile: ExamProfile
  ): ScorePrediction {
    // For real-time updates, use a lighter calculation
    // Full recalculation every 5-10 questions to avoid performance issues
    
    if (session.totalQuestionsAnswered % 5 === 0) {
      return ScorePredictionEngine.generatePrediction(session, examProfile);
    }
    
    // Quick update: just adjust the overall score
    const newAccuracy = session.totalCorrectAnswers / session.totalQuestionsAnswered;
    const scoreDelta = (newAccuracy * 100) - currentPrediction.predictedScore;
    
    return {
      ...currentPrediction,
      predictedScore: Math.max(0, Math.min(100, currentPrediction.predictedScore + (scoreDelta * 0.1)))
    };
  }
}
