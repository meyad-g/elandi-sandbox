// Question Pattern Templates System
// Provides style-specific prompts and templates for diverse question generation

import { ExamProfile, ExamObjective } from './certifications';

export type QuestionStyle = 'direct' | 'scenario' | 'case_study';

export interface QuestionPattern {
  style: QuestionStyle;
  weight: number; // Probability weight for selection
  minDifficulty?: 'beginner' | 'intermediate' | 'advanced';
  maxDifficulty?: 'beginner' | 'intermediate' | 'advanced';
  objectiveLevels?: ('knowledge' | 'application' | 'synthesis')[];
  promptTemplate: string;
  examples: string[];
  antiPatterns: string[]; // What to avoid
}

// Default distribution: 60% direct, 30% scenario, 10% case study
export const DEFAULT_QUESTION_DISTRIBUTION = {
  direct: 0.60,
  scenario: 0.30,
  case_study: 0.10
};

// Question pattern templates for different styles
export const QUESTION_PATTERNS: Record<QuestionStyle, QuestionPattern> = {
  direct: {
    style: 'direct',
    weight: 60,
    promptTemplate: `Create a DIRECT, CONCISE question that tests fundamental understanding without lengthy scenarios.

DIRECT QUESTION REQUIREMENTS:
- Ask about a specific concept, definition, formula, or principle
- Keep context to 1 sentence maximum or none at all
- Focus on recall, recognition, or simple application
- NO scenarios, case studies, or company examples
- NO "A company..." or "An analyst..." setups
- Use straightforward, academic language

PREFERRED FORMATS (rotate these for variety):
- "What defines...?" / "How is [concept] calculated?" / "Which statement about [topic] is correct?"
- "The formula for [metric] includes which components?" / "What distinguishes [A] from [B]?"
- "According to [Standard], when is [action] required?" / "Which factor determines [outcome]?"
- "In [context], what indicates...?" / "Which approach best describes...?"
- "The main advantage/characteristic/purpose of [concept] is...?"
- "Which of the following correctly identifies...?" / "What happens when [condition] occurs?"

AVOID COMPLETELY:
- Any fictional companies, analysts, or characters
- Multi-sentence contextual setups
- Story-based scenarios
- "Consider a situation where..." patterns`,
    examples: [
      'How does ROE differ from ROA in measuring profitability?',
      'Which GIPS requirement applies to composite construction?',
      'What does modified duration measure in bond analysis?',
      'According to CFA standards, which scenario violates material nonpublic information rules?',
      'The NPV calculation requires which type of discount rate?',
      'Which factor determines the effective annual rate?',
      'What distinguishes a forward contract from a futures contract?',
      'In portfolio theory, how is systematic risk measured?',
      'Which statement correctly describes the efficient market hypothesis?',
      'The Capital Asset Pricing Model assumes which market conditions?'
    ],
    antiPatterns: [
      'A portfolio manager at XYZ firm...',
      'An analyst is evaluating...',
      'Consider a company that...',
      'In the following scenario...'
    ]
  },

  scenario: {
    style: 'scenario',
    weight: 30,
    minDifficulty: 'intermediate',
    objectiveLevels: ['application', 'synthesis'],
    promptTemplate: `Create a SHORT SCENARIO question that applies concepts to realistic situations without lengthy case studies.

SHORT SCENARIO REQUIREMENTS:
- Maximum 2-3 sentences of context
- Focus on practical application or decision-making
- Include specific, relevant details (numbers, situations)
- Test application of principles to real situations
- Keep scenarios focused and purposeful

PREFERRED FORMATS:
- "A [role] needs to [action] when [specific condition]. What should they do?"
- "Given [specific parameters], which [method/approach] is most appropriate?"
- "If [specific situation occurs], what [principle/rule] applies?"
- "When [specific metric] equals [value], this indicates what?"

CONTEXT GUIDELINES:
- Use realistic but generic situations
- Include specific numbers or parameters when relevant
- Focus on decision points or analytical choices
- Avoid lengthy background or unnecessary details`,
    examples: [
      'A portfolio has a beta of 1.3 and expected return of 12%. If the market return is 10%, what is the implied risk-free rate?',
      'An auditor discovers revenue recognition issues affecting 3% of total revenue. According to materiality guidelines, what action is required?',
      'A bond trading at 102 with 3 years to maturity and 5% coupon rate. What is its current yield?',
      'A firm violates its debt covenant with a debt-to-equity ratio of 2.1 when the limit is 2.0. What is the most likely immediate consequence?'
    ],
    antiPatterns: [
      'Multi-paragraph company backgrounds',
      'Detailed personal histories',
      'Lengthy market conditions descriptions',
      'Unnecessary contextual details'
    ]
  },

  case_study: {
    style: 'case_study',
    weight: 10,
    minDifficulty: 'advanced',
    objectiveLevels: ['synthesis'],
    promptTemplate: `Create a COMPREHENSIVE CASE STUDY that requires complex analysis and strategic thinking.

CASE STUDY REQUIREMENTS:
- Multi-paragraph scenario with complex, interconnected details
- Requires synthesis of multiple concepts or principles
- Strategic or high-level analytical thinking required
- Multiple valid considerations or trade-offs
- Reserved for synthesis-level objectives only

APPROPRIATE CASE STUDY TOPICS:
- Corporate strategy and governance decisions
- Complex portfolio management scenarios  
- Multi-factor valuation problems
- Comprehensive risk assessment situations
- Ethical dilemmas with multiple stakeholders

COMPLEXITY INDICATORS:
- Multiple variables to consider simultaneously
- Requires weighing competing priorities
- Strategic implications beyond immediate calculation
- Integration of multiple topic areas`,
    examples: [
      'Complex portfolio rebalancing with tax implications, liquidity constraints, and changing client objectives',
      'Corporate restructuring decision involving governance, financing, and stakeholder considerations',
      'Multi-asset valuation with various methodologies and market condition factors'
    ],
    antiPatterns: [
      'Simple calculation problems with lengthy setup',
      'Basic concept questions with unnecessary background',
      'Single-factor decision problems'
    ]
  }
};

// Exam-specific pattern preferences
export const EXAM_PATTERN_PREFERENCES: Record<string, Partial<Record<QuestionStyle, number>>> = {
  'cfa-l1': {
    direct: 0.70,    // More foundational knowledge
    scenario: 0.25,
    case_study: 0.05
  },
  'cfa-l2': {
    direct: 0.50,    // More application focus
    scenario: 0.40,
    case_study: 0.10
  },
  'cfa-l3': {
    direct: 0.40,    // More synthesis focus
    scenario: 0.40,
    case_study: 0.20
  },
  'aws-saa': {
    direct: 0.55,    // Technical knowledge + practical application
    scenario: 0.35,
    case_study: 0.10
  },
  'data-engineer-cert': {
    direct: 0.60,    // Technical concepts + practical scenarios
    scenario: 0.30,
    case_study: 0.10
  }
};

// Objective-level pattern preferences based on learning level
export const OBJECTIVE_PATTERN_PREFERENCES: Record<string, Partial<Record<QuestionStyle, number>>> = {
  'knowledge': {
    direct: 0.80,
    scenario: 0.15,
    case_study: 0.05
  },
  'application': {
    direct: 0.50,
    scenario: 0.40,
    case_study: 0.10
  },
  'synthesis': {
    direct: 0.30,
    scenario: 0.45,
    case_study: 0.25
  }
};

// Get appropriate question pattern based on context
export function selectQuestionPattern(
  examId: string,
  objective: ExamObjective,
  currentDistribution: Record<QuestionStyle, number>,
  totalQuestions: number
): QuestionStyle {
  // Get target distribution for this exam and objective
  const examPrefs = EXAM_PATTERN_PREFERENCES[examId] || DEFAULT_QUESTION_DISTRIBUTION;
  const levelPrefs = OBJECTIVE_PATTERN_PREFERENCES[objective.level || 'application'] || {};
  
  // Combine preferences (level preferences override exam preferences)
  const targetDistribution = { ...examPrefs, ...levelPrefs };
  
  // Calculate current percentages
  const currentPercentages = {
    direct: currentDistribution.direct / Math.max(totalQuestions, 1),
    scenario: currentDistribution.scenario / Math.max(totalQuestions, 1),
    case_study: currentDistribution.case_study / Math.max(totalQuestions, 1)
  };
  
  // Find which style is most under-represented
  const styleDeficits = Object.entries(targetDistribution).map(([style, target]) => ({
    style: style as QuestionStyle,
    deficit: target - (currentPercentages[style as QuestionStyle] || 0)
  }));
  
  // Sort by largest deficit
  styleDeficits.sort((a, b) => b.deficit - a.deficit);
  
  // Select the style with the largest deficit, respecting pattern constraints
  for (const { style } of styleDeficits) {
    const pattern = QUESTION_PATTERNS[style];
    
    // Check if this pattern is appropriate for the objective
    if (pattern.objectiveLevels && !pattern.objectiveLevels.includes(objective.level || 'application')) {
      continue;
    }
    
    // Check difficulty constraints
    if (pattern.minDifficulty && objective.difficulty) {
      const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
      const objDiffIdx = difficultyOrder.indexOf(objective.difficulty);
      const minDiffIdx = difficultyOrder.indexOf(pattern.minDifficulty);
      if (objDiffIdx < minDiffIdx) continue;
    }
    
    if (pattern.maxDifficulty && objective.difficulty) {
      const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
      const objDiffIdx = difficultyOrder.indexOf(objective.difficulty);
      const maxDiffIdx = difficultyOrder.indexOf(pattern.maxDifficulty);
      if (objDiffIdx > maxDiffIdx) continue;
    }
    
    return style;
  }
  
  // Fallback to direct if no other pattern fits
  return 'direct';
}

// Get the appropriate prompt template for a question style
export function getPatternPrompt(
  style: QuestionStyle,
  examProfile: ExamProfile,
  objective: ExamObjective
): string {
  const pattern = QUESTION_PATTERNS[style];
  
  // Add exam-specific context to the base template
  let prompt = pattern.promptTemplate;
  
  // Add examples specific to this exam type
  const examExamples = getExamSpecificExamples(examProfile.id, style);
  if (examExamples.length > 0) {
    prompt += `\n\nEXAM-SPECIFIC EXAMPLES FOR ${examProfile.name.toUpperCase()}:\n${examExamples.join('\n')}`;
  }
  
  // Add anti-patterns to avoid
  prompt += `\n\nSTRICTLY AVOID THESE PATTERNS:\n${pattern.antiPatterns.map(ap => `- ${ap}`).join('\n')}`;
  
  return prompt;
}

// Get exam-specific examples for each question style
function getExamSpecificExamples(examId: string, style: QuestionStyle): string[] {
  const examExamples: Record<string, Record<QuestionStyle, string[]>> = {
    'cfa-l1': {
      direct: [
        'What is the formula for calculating the Sharpe ratio?',
        'According to CFA Standards, which action violates Standard III(A) Loyalty, Prudence, and Care?',
        'The time value of money principle states that money received today is worth how much compared to money received in the future?'
      ],
      scenario: [
        'A bond has a modified duration of 7.2 years. If interest rates increase by 1%, what is the approximate percentage change in bond price?',
        'An investment manager receives material nonpublic information from a client. According to CFA Standards, what should the manager do?'
      ],
      case_study: [
        'A portfolio manager must rebalance a $50M equity portfolio while considering tax implications, client liquidity needs, and changing market conditions. The client has conflicting short-term cash needs and long-term growth objectives...'
      ]
    },
    'aws-saa': {
      direct: [
        'What is the primary benefit of using Amazon S3 Transfer Acceleration?',
        'Which AWS service provides managed NoSQL database capabilities?',
        'What is the maximum retention period for Amazon CloudWatch Logs?'
      ],
      scenario: [
        'An application requires 99.99% availability across multiple AWS regions. Which architecture pattern should be implemented?',
        'A company needs to migrate 50TB of data to AWS within 2 weeks. Which service is most appropriate?'
      ],
      case_study: [
        'A global e-commerce company needs to architect a multi-region solution with strict compliance requirements, real-time analytics, and cost optimization constraints...'
      ]
    },
    'data-engineer-cert': {
      direct: [
        'How does ETL differ from ELT in data processing sequence?',
        'Which data modeling technique best supports analytical workloads?',
        'What makes Apache Kafka effective for streaming data?',
        'Which characteristic defines a star schema in dimensional modeling?',
        'How does data lineage support governance initiatives?',
        'What distinguishes batch processing from stream processing?',
        'Which factor determines optimal data partitioning strategies?',
        'In data quality management, what indicates anomaly detection success?',
        'Which approach ensures reproducible data pipeline execution?',
        'What defines idempotency in data processing operations?'
      ],
      scenario: [
        'A data pipeline processes 1TB daily with 99.9% SLA requirements. Which architecture pattern provides the best balance of reliability and cost?',
        'A team needs to implement real-time fraud detection on transaction data. Which streaming technology is most suitable?'
      ],
      case_study: [
        'An enterprise needs to modernize their data architecture to support real-time analytics, ML pipelines, and regulatory compliance while managing costs and technical debt...'
      ]
    }
  };
  
  return examExamples[examId]?.[style] || [];
}

// Validate that a generated question matches the intended style
export function validateQuestionStyle(questionText: string, intendedStyle: QuestionStyle): boolean {
  const text = questionText.toLowerCase();
  
  switch (intendedStyle) {
    case 'direct':
      // Should not have lengthy scenarios or company references
      const hasCompanyRef = /\b(company|firm|analyst|manager|corporation|organization)\b/.test(text);
      const hasScenarioWords = /\b(consider|scenario|situation|case|example)\b/.test(text);
      const isLong = questionText.split('.').length > 2;
      return !hasCompanyRef && !hasScenarioWords && !isLong;
      
    case 'scenario':
      // Should have some context but not be too long
      const hasContext = text.length > 50 && text.includes('?');
      const notTooLong = questionText.split('.').length <= 4;
      return hasContext && notTooLong;
      
    case 'case_study':
      // Should be comprehensive and detailed
      const isDetailed = text.length > 200;
      const hasMultipleSentences = questionText.split('.').length > 3;
      return isDetailed && hasMultipleSentences;
      
    default:
      return true;
  }
}


