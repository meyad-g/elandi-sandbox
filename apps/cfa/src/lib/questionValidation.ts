// Question Format Validation System
// Ensures generated questions match intended styles and meet quality standards

import { QuestionStyle } from './questionPatterns';
import { ExamProfile, ExamObjective } from './certifications';
import { QuestionAttempt } from './studySession';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 quality score
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  severity: 'low' | 'medium' | 'high';
  category: 'style' | 'content' | 'format' | 'clarity';
  description: string;
  location?: 'question' | 'options' | 'explanation';
}

export interface QuestionForValidation {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
  metadata?: {
    style?: QuestionStyle;
    estimatedDifficulty?: string;
    topicFocus?: string;
  };
}

export class QuestionValidator {
  
  /**
   * Comprehensive validation of a generated question
   */
  static validateQuestion(
    question: QuestionForValidation,
    intendedStyle: QuestionStyle,
    examProfile: ExamProfile,
    objective: ExamObjective
  ): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;
    
    // Style validation
    const styleValidation = this.validateStyle(question.question, intendedStyle);
    if (!styleValidation.isValid) {
      issues.push(...styleValidation.issues);
      score -= styleValidation.scorePenalty;
    }
    
    // Content quality validation
    const contentValidation = this.validateContent(question, examProfile, objective);
    if (!contentValidation.isValid) {
      issues.push(...contentValidation.issues);
      score -= contentValidation.scorePenalty;
    }
    
    // Format validation
    const formatValidation = this.validateFormat(question, examProfile);
    if (!formatValidation.isValid) {
      issues.push(...formatValidation.issues);
      score -= formatValidation.scorePenalty;
    }
    
    // Clarity and language validation
    const clarityValidation = this.validateClarity(question);
    if (!clarityValidation.isValid) {
      issues.push(...clarityValidation.issues);
      score -= clarityValidation.scorePenalty;
    }
    
    // Generate suggestions based on issues
    const suggestions = this.generateSuggestions(issues, intendedStyle);
    
    return {
      isValid: score >= 70 && !issues.some(issue => issue.severity === 'high'),
      score: Math.max(0, Math.round(score)),
      issues,
      suggestions
    };
  }
  
  /**
   * Validate question style adherence
   */
  private static validateStyle(questionText: string, intendedStyle: QuestionStyle): {
    isValid: boolean;
    scorePenalty: number;
    issues: ValidationIssue[];
  } {
    const issues: ValidationIssue[] = [];
    let penalty = 0;
    
    const text = questionText.toLowerCase();
    
    switch (intendedStyle) {
      case 'direct':
        // Check for case study indicators
        if (/\b(company|firm|analyst|manager|corporation|organization|consider|scenario|situation|case)\b/.test(text)) {
          issues.push({
            severity: 'high',
            category: 'style',
            description: 'Direct question contains scenario/case study language',
            location: 'question'
          });
          penalty += 40;
        }
        
        // Check length (should be concise)
        if (questionText.split('.').length > 2) {
          issues.push({
            severity: 'medium',
            category: 'style',
            description: 'Direct question is too lengthy (should be 1-2 sentences)',
            location: 'question'
          });
          penalty += 20;
        }
        
        // Check for formula or concept focus
        if (!/\b(what|which|how|when|formula|calculate|definition|principle|rule)\b/i.test(questionText)) {
          issues.push({
            severity: 'low',
            category: 'style',
            description: 'Direct question should focus on definitions, formulas, or principles',
            location: 'question'
          });
          penalty += 10;
        }
        break;
        
      case 'scenario':
        // Check for appropriate context length
        const sentenceCount = questionText.split('.').length;
        if (sentenceCount < 2) {
          issues.push({
            severity: 'medium',
            category: 'style',
            description: 'Scenario question lacks sufficient context (should be 2-3 sentences)',
            location: 'question'
          });
          penalty += 25;
        } else if (sentenceCount > 4) {
          issues.push({
            severity: 'medium',
            category: 'style',
            description: 'Scenario question is too lengthy (should be 2-3 sentences)',
            location: 'question'
          });
          penalty += 20;
        }
        
        // Check for specific details (numbers, conditions)
        if (!/\b\d+/.test(questionText) && !/\b(if|when|given|assuming)\b/i.test(questionText)) {
          issues.push({
            severity: 'medium',
            category: 'style',
            description: 'Scenario question should include specific conditions or parameters',
            location: 'question'
          });
          penalty += 20;
        }
        break;
        
      case 'case_study':
        // Check for sufficient complexity
        if (questionText.length < 200) {
          issues.push({
            severity: 'high',
            category: 'style',
            description: 'Case study question is too brief (should be detailed and comprehensive)',
            location: 'question'
          });
          penalty += 35;
        }
        
        // Check for multiple components/considerations
        if (sentenceCount < 4) {
          issues.push({
            severity: 'medium',
            category: 'style',
            description: 'Case study should have multiple components and considerations',
            location: 'question'
          });
          penalty += 25;
        }
        break;
    }
    
    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      scorePenalty: penalty,
      issues
    };
  }
  
  /**
   * Validate content quality and relevance
   */
  private static validateContent(
    question: QuestionForValidation, 
    examProfile: ExamProfile, 
    objective: ExamObjective
  ): {
    isValid: boolean;
    scorePenalty: number;
    issues: ValidationIssue[];
  } {
    const issues: ValidationIssue[] = [];
    let penalty = 0;
    
    // Check for topic relevance
    const hasTopicKeywords = objective.keyTopics?.some(topic => 
      question.question.toLowerCase().includes(topic.toLowerCase().split(' ')[0])
    );
    
    if (!hasTopicKeywords && objective.keyTopics?.length) {
      issues.push({
        severity: 'medium',
        category: 'content',
        description: 'Question may not be relevant to specified key topics',
        location: 'question'
      });
      penalty += 15;
    }
    
    // Check for appropriate terminology
    const hasExamTerminology = examProfile.context.terminology?.some(term =>
      question.question.toLowerCase().includes(term.toLowerCase())
    );
    
    if (examProfile.context.terminology?.length && !hasExamTerminology) {
      issues.push({
        severity: 'low',
        category: 'content',
        description: 'Question could benefit from exam-specific terminology',
        location: 'question'
      });
      penalty += 10;
    }
    
    // Validate answer choices quality
    if (question.options.length < 2) {
      issues.push({
        severity: 'high',
        category: 'content',
        description: 'Insufficient answer options provided',
        location: 'options'
      });
      penalty += 50;
    }
    
    // Check for answer option diversity
    const optionLengthVariance = this.calculateVariance(
      question.options.map(opt => opt.length)
    );
    
    if (optionLengthVariance < 10) {
      issues.push({
        severity: 'low',
        category: 'content',
        description: 'Answer options should vary in length and structure',
        location: 'options'
      });
      penalty += 5;
    }
    
    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      scorePenalty: penalty,
      issues
    };
  }
  
  /**
   * Validate question format and structure
   */
  private static validateFormat(
    question: QuestionForValidation, 
    examProfile: ExamProfile
  ): {
    isValid: boolean;
    scorePenalty: number;
    issues: ValidationIssue[];
  } {
    const issues: ValidationIssue[] = [];
    let penalty = 0;
    
    // Check option count matches exam requirements
    const expectedOptions = examProfile.constraints.optionCount;
    if (question.options.length !== expectedOptions) {
      issues.push({
        severity: 'high',
        category: 'format',
        description: `Expected ${expectedOptions} options, got ${question.options.length}`,
        location: 'options'
      });
      penalty += 30;
    }
    
    // Check correct answer index validity
    if (question.correct < 0 || question.correct >= question.options.length) {
      issues.push({
        severity: 'high',
        category: 'format',
        description: 'Invalid correct answer index',
        location: 'options'
      });
      penalty += 40;
    }
    
    // Check question ends with question mark
    if (!question.question.trim().endsWith('?')) {
      issues.push({
        severity: 'low',
        category: 'format',
        description: 'Question should end with a question mark',
        location: 'question'
      });
      penalty += 5;
    }
    
    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      scorePenalty: penalty,
      issues
    };
  }
  
  /**
   * Validate clarity and language quality
   */
  private static validateClarity(question: QuestionForValidation): {
    isValid: boolean;
    scorePenalty: number;
    issues: ValidationIssue[];
  } {
    const issues: ValidationIssue[] = [];
    let penalty = 0;
    
    // Check for ambiguous language
    const ambiguousWords = ['some', 'many', 'often', 'usually', 'sometimes'];
    const hasAmbiguity = ambiguousWords.some(word => 
      question.question.toLowerCase().includes(word)
    );
    
    if (hasAmbiguity) {
      issues.push({
        severity: 'medium',
        category: 'clarity',
        description: 'Question contains ambiguous language that may confuse test-takers',
        location: 'question'
      });
      penalty += 20;
    }
    
    // Check for double negatives
    const negativeCount = (question.question.toLowerCase().match(/\b(not|never|no|none)\b/g) || []).length;
    if (negativeCount > 1) {
      issues.push({
        severity: 'medium',
        category: 'clarity',
        description: 'Question contains multiple negatives which can be confusing',
        location: 'question'
      });
      penalty += 15;
    }
    
    // Check minimum question length
    if (question.question.trim().length < 20) {
      issues.push({
        severity: 'medium',
        category: 'clarity',
        description: 'Question is too brief and may lack clarity',
        location: 'question'
      });
      penalty += 25;
    }
    
    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      scorePenalty: penalty,
      issues
    };
  }
  
  /**
   * Generate improvement suggestions based on validation issues
   */
  private static generateSuggestions(issues: ValidationIssue[], intendedStyle: QuestionStyle): string[] {
    const suggestions: string[] = [];
    
    // Style-specific suggestions
    const styleIssues = issues.filter(issue => issue.category === 'style');
    if (styleIssues.length > 0) {
      switch (intendedStyle) {
        case 'direct':
          suggestions.push('Focus on definitions, formulas, or principles without scenario context');
          suggestions.push('Keep question to 1-2 sentences maximum');
          break;
        case 'scenario':
          suggestions.push('Include 2-3 sentences with specific conditions or parameters');
          suggestions.push('Test practical application without lengthy background');
          break;
        case 'case_study':
          suggestions.push('Provide comprehensive multi-paragraph scenario with interconnected details');
          suggestions.push('Require synthesis of multiple concepts for complex analysis');
          break;
      }
    }
    
    // Content suggestions
    const contentIssues = issues.filter(issue => issue.category === 'content');
    if (contentIssues.length > 0) {
      suggestions.push('Ensure question directly relates to the objective\'s key topics');
      suggestions.push('Use exam-specific terminology and concepts');
      suggestions.push('Create diverse answer options with varying lengths and structures');
    }
    
    // Format suggestions
    const formatIssues = issues.filter(issue => issue.category === 'format');
    if (formatIssues.length > 0) {
      suggestions.push('Match the required number of answer options for this exam');
      suggestions.push('Ensure question ends with proper punctuation');
      suggestions.push('Verify correct answer index is valid');
    }
    
    // Clarity suggestions
    const clarityIssues = issues.filter(issue => issue.category === 'clarity');
    if (clarityIssues.length > 0) {
      suggestions.push('Use precise language and avoid ambiguous terms');
      suggestions.push('Minimize negatives to improve clarity');
      suggestions.push('Provide sufficient detail for clear understanding');
    }
    
    return suggestions;
  }
  
  /**
   * Calculate variance for array of numbers
   */
  private static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }
  
  /**
   * Quick style validation (lighter weight than full validation)
   */
  static quickStyleCheck(questionText: string, intendedStyle: QuestionStyle): boolean {
    const text = questionText.toLowerCase();
    
    switch (intendedStyle) {
      case 'direct':
        return !(/\b(company|firm|analyst|manager|consider|scenario)\b/.test(text)) &&
               questionText.split('.').length <= 2;
      
      case 'scenario':
        const sentences = questionText.split('.').length;
        return sentences >= 2 && sentences <= 4 && 
               (/\b\d+/.test(questionText) || /\b(if|when|given)\b/i.test(questionText));
      
      case 'case_study':
        return questionText.length > 200 && questionText.split('.').length > 3;
      
      default:
        return true;
    }
  }
}

// Question Similarity Detection and Deduplication
export class QuestionSimilarityDetector {
  
  /**
   * Create a simple hash of question text for efficient comparison
   */
  static createQuestionHash(questionText: string): string {
    const normalized = this.normalizeQuestionText(questionText);
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Normalize question text for comparison
   */
  static normalizeQuestionText(questionText: string): string {
    return questionText
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  /**
   * Calculate text similarity between two questions (0-1 scale)
   */
  static calculateSimilarity(question1: string, question2: string): number {
    const normalized1 = this.normalizeQuestionText(question1);
    const normalized2 = this.normalizeQuestionText(question2);
    
    if (normalized1 === normalized2) return 1.0;
    
    // Simple word-based Jaccard similarity
    const words1 = new Set(normalized1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(normalized2.split(' ').filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  /**
   * Check if a new question is too similar to previous questions
   */
  static isTooSimilar(
    newQuestion: string, 
    previousAttempts: QuestionAttempt[],
    threshold: number = 0.7
  ): { isSimilar: boolean; mostSimilar?: QuestionAttempt; similarity?: number } {
    const recentAttempts = previousAttempts
      .filter(attempt => attempt.questionText)
      .slice(-10); // Check last 10 questions
    
    let maxSimilarity = 0;
    let mostSimilarAttempt: QuestionAttempt | undefined;
    
    for (const attempt of recentAttempts) {
      if (!attempt.questionText) continue;
      
      const similarity = this.calculateSimilarity(newQuestion, attempt.questionText);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        mostSimilarAttempt = attempt;
      }
    }
    
    return {
      isSimilar: maxSimilarity >= threshold,
      mostSimilar: mostSimilarAttempt,
      similarity: maxSimilarity
    };
  }
  
  /**
   * Detect repetitive question patterns
   */
  static detectRepetitivePatterns(previousAttempts: QuestionAttempt[]): string[] {
    const patterns: string[] = [];
    const recentQuestions = previousAttempts
      .filter(attempt => attempt.questionText)
      .slice(-8) // Check last 8 questions
      .map(attempt => attempt.questionText!);
    
    // Check for repetitive starters
    const starters = recentQuestions.map(q => {
      const match = q.match(/^([^.!?]*?)(?:\s|$)/);
      return match ? match[1].trim().toLowerCase() : '';
    }).filter(s => s.length > 10);
    
    const starterCounts = new Map<string, number>();
    starters.forEach(starter => {
      starterCounts.set(starter, (starterCounts.get(starter) || 0) + 1);
    });
    
    starterCounts.forEach((count, starter) => {
      if (count >= 3) {
        patterns.push(`Repetitive question starter: "${starter}" (used ${count} times)`);
      }
    });
    
    // Check for "Which characteristic" pattern specifically
    const whichCharacteristicCount = recentQuestions.filter(q => 
      q.toLowerCase().includes('which characteristic')
    ).length;
    
    if (whichCharacteristicCount >= 2) {
      patterns.push(`Overused "Which characteristic" pattern (${whichCharacteristicCount} recent questions)`);
    }
    
    // Check for similar question structures
    const structurePatterns = recentQuestions.map(q => {
      return q.replace(/\b\w+\b/g, 'X').replace(/\d+/g, 'N');
    });
    
    const structureCounts = new Map<string, number>();
    structurePatterns.forEach(pattern => {
      structureCounts.set(pattern, (structureCounts.get(pattern) || 0) + 1);
    });
    
    structureCounts.forEach((count) => {
      if (count >= 2) {
        patterns.push(`Repetitive question structure detected (${count} similar structures)`);
      }
    });
    
    return patterns;
  }
  
  /**
   * Get diverse question starters to suggest to AI
   */
  static getDiverseQuestionStarters(previousAttempts: QuestionAttempt[]): string[] {
    const usedStarters = new Set<string>();
    
    // Extract starters from recent questions
    previousAttempts
      .filter(attempt => attempt.questionText)
      .slice(-5)
      .forEach(attempt => {
        const match = attempt.questionText!.match(/^(\w+\s+\w+)/);
        if (match) {
          usedStarters.add(match[1].toLowerCase());
        }
      });
    
    const allStarters = [
      'What is', 'How does', 'Which factor', 'What distinguishes', 
      'In what way', 'When does', 'Which statement', 'What happens',
      'How is', 'Which approach', 'What determines', 'Which method',
      'What indicates', 'How can', 'Which principle', 'What defines'
    ];
    
    // Return starters that haven't been used recently
    return allStarters.filter(starter => 
      !usedStarters.has(starter.toLowerCase())
    ).slice(0, 6);
  }
}


