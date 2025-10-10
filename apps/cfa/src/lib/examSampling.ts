import { ExamProfile } from './certifications';
import { ObjectiveQuestionDistribution } from './studySession';

export interface SamplingStrategy {
  mode: 'prep' | 'efficient' | 'mock';
  totalQuestions: number;
  distribution: ObjectiveQuestionDistribution[];
}

export interface SamplingConfig {
  examProfile: ExamProfile;
  mode: 'prep' | 'efficient' | 'mock';
  targetQuestions?: number;
  focusObjectives?: string[]; // For targeted practice
}

export class ExamSampling {
  
  /**
   * Create a sampling strategy based on the exam mode and profile
   */
  static createSamplingStrategy(config: SamplingConfig): SamplingStrategy {
    const { examProfile, mode, targetQuestions, focusObjectives } = config;
    
    // Get base question count from exam profile
    const baseQuestions = examProfile.constraints?.totalQuestions || 180;
    
    let totalQuestions: number;
    switch (mode) {
      case 'prep':
        totalQuestions = Infinity; // Unlimited for prep mode
        break;
      case 'efficient':
        totalQuestions = targetQuestions || Math.round(baseQuestions * 0.3); // 30% by default
        break;
      case 'mock':
        totalQuestions = baseQuestions; // Full exam
        break;
      default:
        throw new Error(`Unknown sampling mode: ${mode}`);
    }

    // Filter objectives if focus is specified
    const objectives = focusObjectives 
      ? examProfile.objectives.filter(obj => focusObjectives.includes(obj.id))
      : examProfile.objectives;

    // Create proportional distribution
    const distribution = ExamSampling.createProportionalDistribution(
      objectives, 
      totalQuestions === Infinity ? 100 : totalQuestions // Use 100 as base for infinite mode
    );

    return {
      mode,
      totalQuestions,
      distribution
    };
  }

  /**
   * Create proportional distribution based on objective weights
   */
  private static createProportionalDistribution(
    objectives: ExamProfile['objectives'], 
    totalQuestions: number
  ): ObjectiveQuestionDistribution[] {
    
    // Calculate total weight
    const totalWeight = objectives.reduce((sum, obj) => sum + obj.weight, 0);
    
    // Ensure we have valid weights
    if (totalWeight === 0) {
      throw new Error('Total objective weight cannot be zero');
    }

    let distributedQuestions = 0;
    const distributions: ObjectiveQuestionDistribution[] = [];

    // First pass: calculate ideal distribution
    objectives.forEach((objective, index) => {
      const weight = objective.weight / totalWeight;
      let questionCount: number;

      if (totalQuestions === Infinity) {
        // For prep mode, use weight as percentage
        questionCount = Math.round(weight * 100);
      } else {
        // For finite modes, distribute proportionally
        if (index === objectives.length - 1) {
          // Last objective gets remaining questions to ensure exact total
          questionCount = totalQuestions - distributedQuestions;
        } else {
          questionCount = Math.max(1, Math.round(totalQuestions * weight));
          distributedQuestions += questionCount;
        }
      }

      distributions.push({
        objectiveId: objective.id,
        questionCount,
        weight: weight * 100 // Store as percentage
      });
    });

    return distributions;
  }

  /**
   * Validate that a sampling strategy meets minimum requirements
   */
  static validateSamplingStrategy(strategy: SamplingStrategy): boolean {
    // Check that all objectives have at least 1 question (except for prep mode)
    if (strategy.mode !== 'prep') {
      const hasZeroQuestions = strategy.distribution.some(dist => dist.questionCount === 0);
      if (hasZeroQuestions) {
        return false;
      }
    }

    // Check that total questions match expected
    if (strategy.totalQuestions !== Infinity) {
      const totalDistributed = strategy.distribution.reduce((sum, dist) => sum + dist.questionCount, 0);
      if (totalDistributed !== strategy.totalQuestions) {
        return false;
      }
    }

    // Check that weights sum to approximately 100%
    const totalWeight = strategy.distribution.reduce((sum, dist) => sum + dist.weight, 0);
    if (Math.abs(totalWeight - 100) > 1) { // Allow 1% tolerance
      return false;
    }

    return true;
  }

  /**
   * Get next objective based on sampling strategy and current progress
   */
  static getNextObjective(
    strategy: SamplingStrategy, 
    currentProgress: { [objectiveId: string]: number }
  ): string | null {
    
    // For prep mode, use round-robin or weighted selection
    if (strategy.mode === 'prep') {
      return ExamSampling.getNextObjectiveRoundRobin(strategy, currentProgress);
    }

    // For efficient and mock modes, ensure we meet the target distribution
    for (const distribution of strategy.distribution) {
      const completed = currentProgress[distribution.objectiveId] || 0;
      if (completed < distribution.questionCount) {
        return distribution.objectiveId;
      }
    }

    return null; // All objectives completed
  }

  /**
   * Round-robin selection with weight consideration for prep mode
   */
  private static getNextObjectiveRoundRobin(
    strategy: SamplingStrategy,
    currentProgress: { [objectiveId: string]: number }
  ): string | null {
    
    // Find objective with lowest completion ratio relative to its weight
    let bestObjective: string | null = null;
    let lowestRatio = Infinity;

    for (const distribution of strategy.distribution) {
      const completed = currentProgress[distribution.objectiveId] || 0;
      const expectedAtThisPoint = distribution.weight; // Use weight as expected proportion
      const ratio = completed / Math.max(expectedAtThisPoint, 1);

      if (ratio < lowestRatio) {
        lowestRatio = ratio;
        bestObjective = distribution.objectiveId;
      }
    }

    return bestObjective;
  }

  /**
   * Get progress summary for the current sampling strategy
   */
  static getProgressSummary(
    strategy: SamplingStrategy,
    currentProgress: { [objectiveId: string]: number }
  ): {
    totalCompleted: number;
    totalTarget: number;
    completionPercentage: number;
    objectiveProgress: Array<{
      objectiveId: string;
      completed: number;
      target: number;
      percentage: number;
    }>;
  } {
    
    let totalCompleted = 0;
    const objectiveProgress = strategy.distribution.map(dist => {
      const completed = currentProgress[dist.objectiveId] || 0;
      totalCompleted += completed;
      
      return {
        objectiveId: dist.objectiveId,
        completed,
        target: dist.questionCount,
        percentage: dist.questionCount > 0 ? (completed / dist.questionCount) * 100 : 0
      };
    });

    const totalTarget = strategy.totalQuestions === Infinity 
      ? Math.max(totalCompleted, 100) // Dynamic target for prep mode
      : strategy.totalQuestions;

    return {
      totalCompleted,
      totalTarget,
      completionPercentage: totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0,
      objectiveProgress
    };
  }

  /**
   * Check if exam/session should end based on sampling strategy
   */
  static shouldEndSession(
    strategy: SamplingStrategy,
    currentProgress: { [objectiveId: string]: number }
  ): boolean {
    
    if (strategy.mode === 'prep') {
      return false; // Prep mode never auto-ends
    }

    // Check if all objectives have met their target
    return strategy.distribution.every(dist => {
      const completed = currentProgress[dist.objectiveId] || 0;
      return completed >= dist.questionCount;
    });
  }
}

// Utility functions for common CFA Level I distributions
export const CFA_LEVEL_I_WEIGHTS = {
  'ethical-professional-standards': 15,
  'quantitative-methods': 8,
  'economics': 8,
  'financial-statement-analysis': 13,
  'corporate-issuers': 8,
  'equity-investments': 10,
  'fixed-income': 10,
  'derivatives': 5,
  'alternative-investments': 7,
  'portfolio-management': 16
};

export const createCFALevel1Sampling = (mode: 'efficient' | 'mock', targetQuestions?: number): ObjectiveQuestionDistribution[] => {
  const baseQuestions = mode === 'mock' ? 180 : (targetQuestions || 54);
  const totalWeight = Object.values(CFA_LEVEL_I_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  
  return Object.entries(CFA_LEVEL_I_WEIGHTS).map(([objectiveId, weight]) => ({
    objectiveId,
    questionCount: Math.max(1, Math.round(baseQuestions * (weight / totalWeight))),
    weight: (weight / totalWeight) * 100
  }));
};
