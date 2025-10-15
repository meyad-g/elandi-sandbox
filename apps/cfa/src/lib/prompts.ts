// Certification exam prompt library with level-specific contexts and question style patterns

import { ExamProfile, ExamObjective } from './certifications';
import { QuestionStyle } from './questionPatterns';
import { QuestionOptimizationManager } from './questionOptimizations';
import { QuestionSimilarityDetector } from './questionValidation';
import { QuestionAttempt } from './studySession';

export interface QuestionPromptConfig {
  examProfile: ExamProfile;
  objective: ExamObjective;
  questionType: 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay';
  questionStyle?: QuestionStyle; // New: specific question style to generate
  examMode?: 'prep' | 'efficient' | 'mock';
  difficulty?: 'easy' | 'medium' | 'hard';
  previousQuestions?: QuestionAttempt[]; // Updated to use full question attempts
  context?: string;
}

export interface FlashcardPromptConfig {
  examProfile: ExamProfile;
  objective: ExamObjective;
  focusArea?: string;
}

// Get level-specific context for better question generation
function getLevelSpecificContext(examId: string, objective: ExamObjective): string {
  const contexts: Record<string, Record<string, string>> = {
    'cfa-l1': {
      'ethical-professional-standards': `
Context for CFA Level I Ethics:
- Focus on the 7 Standards of Professional Conduct
- Scenario-based questions with ethical dilemmas  
- Common situations: conflicts of interest, material nonpublic information, fair dealing
- Test application of ethical principles to real-world situations
- No calculations required - focus on principles and professional judgment
- Key areas: Standard I (Professionalism), Standard II (Integrity of Capital Markets), Standard III (Duties to Clients)`,

      'quantitative-methods': `
Context for CFA Level I Quantitative Methods:
- Heavy emphasis on Time Value of Money calculations
- Basic statistics: mean, variance, standard deviation, correlation
- Probability distributions: normal, binomial, uniform
- Hypothesis testing fundamentals with t-tests and z-tests
- Financial calculator usage (HP 12C or TI BA II Plus required)
- Key formulas: PV = FV/(1+r)^n, PMT calculations, descriptive statistics
- Focus on practical application to investment scenarios`,

      'financial-statement-analysis': `
Context for CFA Level I Financial Statement Analysis:
- Emphasis on understanding financial statement relationships
- Key ratios: ROE, ROA, current ratio, quick ratio, debt-to-equity
- Cash flow analysis: operating, investing, financing activities
- Working capital analysis and liquidity assessment
- Basic financial statement preparation and analysis
- Connection between balance sheet, income statement, and cash flow statement`,

      'default': `
Context for CFA Level I:
- Foundation level - broad coverage of investment analysis fundamentals
- 180 multiple-choice questions (A, B, C), two sessions of 2.25 hours each
- Emphasis on knowledge and comprehension with some application
- Focus on investment tools, ethical standards, quantitative methods, economics, financial reporting, corporate finance, equity, fixed income, derivatives, alternative investments, and portfolio management
- Heavy use of financial calculator for time value of money and basic statistical calculations
- Real-world application of fundamental investment concepts`
    }
  };

  const examContexts = contexts[examId] || {};
  return examContexts[objective.id] || examContexts['default'] || '';
}

// Build multiple choice question prompt with exam mode context and style patterns
function buildMultipleChoicePrompt(config: QuestionPromptConfig): string {
  const { examProfile, objective, examMode = 'prep', difficulty, previousQuestions = [], questionStyle = 'direct' } = config;
  
  // Get optimized style-specific pattern prompt with inheritance and caching
  const stylePrompt = QuestionOptimizationManager.getOptimizedTemplate(
    examProfile.id, 
    questionStyle, 
    objective
  );
  
  // Get level-specific context (legacy support for existing profiles)
  const levelContext = getLevelSpecificContext(examProfile.id, objective);
  
  // Exam mode specific instructions
  const modeInstructions = getModeSpecificInstructions(examMode, examProfile);
  
  // Difficulty adjustment
  const difficultyInstructions = getDifficultyInstructions(difficulty);
  
  // Enhanced avoidance context using actual question content
  const avoidanceContext = buildEnhancedAvoidanceContext(previousQuestions);

  // Style-specific validation instructions
  const validationInstructions = getStyleValidationInstructions(questionStyle);

  return `You are a professional ${examProfile.name} exam question writer. Create a ${questionStyle.toUpperCase()} style exam question.

EXAM PROFILE: ${examProfile.name} (${examProfile.provider})
OBJECTIVE: ${objective.title}
DESCRIPTION: ${objective.description || 'No description provided'}
WEIGHT: ${objective.weight || 10}% of exam
DIFFICULTY LEVEL: ${objective.difficulty || 'intermediate'}
QUESTION STYLE: ${questionStyle.toUpperCase()}

${stylePrompt}

${levelContext}

${modeInstructions}

${difficultyInstructions}

${validationInstructions}

KEY TOPICS TO FOCUS ON:
${objective.keyTopics?.map(topic => `- ${topic}`).join('\n') || 'No specific topics listed'}

LEARNING OUTCOMES:
${objective.learningOutcomes?.map(outcome => `- ${outcome}`).join('\n') || 'General understanding and application of concepts'}

${avoidanceContext}

Return a JSON object with this exact structure:
{
  "question": "Clear, unambiguous question text that follows the ${questionStyle.toUpperCase()} style requirements above",
  "options": ["Option A", "Option B", "Option C"],
  "correct": 0,
  "metadata": {
    "style": "${questionStyle}",
    "estimatedDifficulty": "${difficulty || objective.difficulty || 'intermediate'}",
    "topicFocus": "${objective.keyTopics?.[0] || objective.title}"
  }
}

CRITICAL: Follow the ${questionStyle.toUpperCase()} style requirements exactly. The question will be validated against these patterns.`;
}

function buildVignettePrompt(config: QuestionPromptConfig): string {
  // Similar structure for vignette questions (longer scenarios)
  return buildMultipleChoicePrompt(config); // For now, use same base
}

function buildMultipleResponsePrompt(config: QuestionPromptConfig): string {
  // Similar structure for multiple response questions
  return buildMultipleChoicePrompt(config); // For now, use same base
}

function getModeSpecificInstructions(examMode: 'prep' | 'efficient' | 'mock', examProfile: ExamProfile): string {
  switch (examMode) {
    case 'prep':
      return `
PREP MODE INSTRUCTIONS:
- Focus on building conceptual understanding and knowledge retention
- Include detailed explanations that help with learning
- Questions can vary in difficulty to build confidence
- Emphasize practical application and real-world scenarios
- Goal: Educational value and skill building`;
    
    case 'efficient':
      return `
EFFICIENT ASSESSMENT MODE:
- Create diagnostic questions that effectively measure knowledge
- Questions should be representative of actual exam difficulty
- Focus on high-yield concepts with maximum discriminatory power
- Balance across difficulty levels to assess true competency
- Goal: Accurate assessment of exam readiness in minimal time`;
    
    case 'mock':
      return `
MOCK EXAM MODE:
- Replicate exact exam conditions and difficulty level
- Use official ${examProfile.name} question format and style
- Strict adherence to time constraints and exam protocols
- Include challenging questions that appear on actual exams
- Goal: Realistic exam simulation and final preparation validation`;
    
    default:
      return '';
  }
}

function getDifficultyInstructions(difficulty?: 'easy' | 'medium' | 'hard'): string {
  if (!difficulty) return '';
  
  switch (difficulty) {
    case 'easy':
      return `
DIFFICULTY: EASY
- Focus on fundamental concepts and basic applications
- Test recall and recognition of key principles
- Use straightforward scenarios with clear solutions
- Avoid complex calculations or multi-step reasoning`;
    
    case 'medium':
      return `
DIFFICULTY: MEDIUM
- Test application and analysis of concepts
- Include moderate calculations and problem-solving
- Use realistic scenarios requiring conceptual understanding
- Balance between knowledge recall and practical application`;
    
    case 'hard':
      return `
DIFFICULTY: HARD
- Test synthesis, evaluation, and complex problem-solving
- Include challenging calculations and multi-step reasoning
- Use complex scenarios requiring deep understanding
- Test edge cases and advanced applications of concepts`;
    
    default:
      return '';
  }
}

function getStyleValidationInstructions(questionStyle: QuestionStyle): string {
  switch (questionStyle) {
    case 'direct':
      return `
STYLE VALIDATION - DIRECT QUESTIONS:
- Question must be answerable in 1-2 sentences maximum
- NO fictional companies, analysts, or character names
- NO "Consider a scenario" or "In the following situation" language
- Focus on definitions, formulas, principles, or direct applications
- Use academic/textbook language, not storytelling language`;
    
    case 'scenario':
      return `
STYLE VALIDATION - SCENARIO QUESTIONS:
- Context setup should be 2-3 sentences maximum
- Include specific, relevant details (numbers, conditions)
- Test practical application or decision-making
- Use realistic but concise situations
- Avoid lengthy background or unnecessary details`;
    
    case 'case_study':
      return `
STYLE VALIDATION - CASE STUDY QUESTIONS:
- Multi-paragraph scenario with interconnected details
- Requires synthesis of multiple concepts
- Strategic or high-level analytical thinking required
- Complex decision-making with multiple valid considerations
- Only use for synthesis-level objectives`;
    
    default:
      return '';
  }
}

// Get prompt based on question type
export function getQuestionPrompt(config: QuestionPromptConfig): string {
  switch (config.questionType) {
    case 'multiple_choice':
      return buildMultipleChoicePrompt(config);
    case 'multiple_response':
      return buildMultipleResponsePrompt(config);
    case 'vignette':
      return buildVignettePrompt(config);
    default:
      return buildMultipleChoicePrompt(config);
  }
}

export function buildFlashcardPrompt(config: FlashcardPromptConfig): string {
  const { examProfile, objective } = config;
  const context = getLevelSpecificContext(examProfile.id, objective);

  return `You are an expert study material creator for ${examProfile.name}.

Generate 1 study flashcard for this learning objective:

EXAM: ${examProfile.name} (${examProfile.provider})
OBJECTIVE: ${objective.title}
DESCRIPTION: ${objective.description || 'No description provided'}
WEIGHT: ${objective.weight || 10}% of total exam
DIFFICULTY LEVEL: ${objective.level || 'intermediate'}

${context}

FLASHCARD REQUIREMENTS:
- Front: Key concept, formula, or question appropriate for memorization
- Back: Clear, concise explanation with specific details
- Include relevant formulas, frameworks, or methodologies
- Use ${examProfile.provider} standard terminology
- Focus on high-yield concepts likely to appear on actual exam
- Make content appropriate for ${objective.level || 'intermediate'} level understanding

CONTENT GUIDELINES:
- Front should be a clear question or concept name
- Back should provide actionable knowledge for exam success
- Include specific examples relevant to ${examProfile.name}
- Add memory aids or mnemonics when helpful
- Focus on concepts with ${objective.weight || 10}% exam weight

Return ONLY this JSON format:
{
  "front": "Key concept, question, or formula for front of flashcard",
  "back": "Detailed explanation with ${examProfile.name} context, examples, and specific details",
  "tags": ["${examProfile.name}", "${objective.level || 'intermediate'}", "additional-tag"]
}`;
}

/**
 * Build enhanced avoidance context using actual question content and pattern detection
 */
function buildEnhancedAvoidanceContext(previousQuestions: QuestionAttempt[] = []): string {
  if (previousQuestions.length === 0) {
    return `\n\nVARIETY REQUIREMENTS:\n- Use diverse question starters (How, Which, What, When, Where, Why)\n- Vary sentence structure and approach\n- Avoid repetitive "What is the primary..." patterns\n- Mix different question formats and approaches`;
  }

  // Get actual question text from recent attempts
  const recentQuestions = previousQuestions
    .filter(attempt => attempt.questionText)
    .slice(-5) // Last 5 questions
    .map(attempt => attempt.questionText!);

  // Detect repetitive patterns
  const repetitivePatterns = QuestionSimilarityDetector.detectRepetitivePatterns(previousQuestions);
  
  // Get diverse question starters to suggest
  const suggestedStarters = QuestionSimilarityDetector.getDiverseQuestionStarters(previousQuestions);

  let avoidanceText = '\n\nQUESTION VARIETY & AVOIDANCE REQUIREMENTS:\n';
  
  // Add recent questions to avoid
  if (recentQuestions.length > 0) {
    avoidanceText += '\nAVOID creating questions similar to these recent ones:\n';
    recentQuestions.forEach((question, index) => {
      const truncated = question.length > 80 ? question.substring(0, 80) + '...' : question;
      avoidanceText += `${index + 1}. "${truncated}"\n`;
    });
  }

  // Add specific pattern avoidance
  if (repetitivePatterns.length > 0) {
    avoidanceText += '\nDETECTED REPETITIVE PATTERNS TO AVOID:\n';
    repetitivePatterns.forEach(pattern => {
      avoidanceText += `- ${pattern}\n`;
    });
  }

  // Add positive variety requirements
  avoidanceText += '\nVARIETY REQUIREMENTS:\n';
  avoidanceText += '- Create questions with DIFFERENT structures than recent ones\n';
  avoidanceText += '- Avoid starting consecutive questions the same way\n';
  avoidanceText += '- Vary question length and complexity\n';
  avoidanceText += '- Use different testing approaches (definition, application, comparison, analysis)\n';
  
  // Add suggested diverse starters
  if (suggestedStarters.length > 0) {
    avoidanceText += `\nRECOMMENDED DIVERSE STARTERS (unused recently): ${suggestedStarters.join(', ')}\n`;
  }

  // Add specific anti-patterns
  avoidanceText += '\nSPECIFIC PATTERNS TO AVOID:\n';
  avoidanceText += '- "Which characteristic best describes..." (overused)\n';
  avoidanceText += '- "What is the primary..." (too repetitive)\n';
  avoidanceText += '- Starting every question with "Which" or "What"\n';
  avoidanceText += '- Using identical sentence structures\n';
  avoidanceText += '- Repeating the same testing approach consecutively\n';

  return avoidanceText;
}

// Example usage contexts for different scenarios
export const PROMPT_EXAMPLES = {
  'cfa-l1-ethics': `Example CFA Level I Ethics Question:
"An investment manager receives material nonpublic information about a potential merger from a client who is an executive at the target company. According to CFA Institute Standards of Professional Conduct, the manager should:
A) Use the information to benefit all clients equally
B) Not act on the information and maintain confidentiality  
C) Share the information with other analysts for verification"`,

  'aws-saa-security': `Example AWS Solutions Architect Security Question:
"A company needs to ensure that their web application running on EC2 instances in private subnets can securely access the internet for software updates while preventing inbound internet access. Which combination of services should be implemented? (Choose TWO)
A) Internet Gateway in public subnet
B) NAT Gateway in public subnet
C) Security groups allowing outbound HTTPS
D) Network ACL denying all inbound traffic
E) VPC Endpoint for S3"`
};
