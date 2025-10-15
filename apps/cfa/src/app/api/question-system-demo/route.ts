// Question Generation System Demo and Monitoring API
// Demonstrates the new question generation system with style distribution and validation

import { NextRequest, NextResponse } from 'next/server';
import { getExamProfile, ExamProfile, ExamObjective } from '@/lib/certifications';
import { QuestionDistributionManager, generateSessionId } from '@/lib/questionDistribution';
import { QuestionOptimizationManager } from '@/lib/questionOptimizations';
import { selectQuestionPattern, EXAM_PATTERN_PREFERENCES } from '@/lib/questionPatterns';
import { QuestionValidator } from '@/lib/questionValidation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'overview';
  const examId = searchParams.get('examId') || 'cfa-l1';
  const sessionId = searchParams.get('sessionId') || generateSessionId();

  try {
    switch (action) {
      case 'overview':
        return getSystemOverview(examId);
      
      case 'distribution':
        return getDistributionDemo(sessionId, examId);
      
      case 'patterns':
        return getPatternsDemo(examId);
      
      case 'performance':
        return getPerformanceMetrics();
      
      case 'validation':
        return getValidationDemo();
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Demo API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getSystemOverview(examId: string) {
  const examProfile = getExamProfile(examId);
  if (!examProfile) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }

  // Get target distribution for this exam
  const targetDistribution = EXAM_PATTERN_PREFERENCES[examId] || {
    direct: 0.60,
    scenario: 0.30,
    case_study: 0.10
  };

  // Get optimization info
  const inheritanceTree = QuestionOptimizationManager.getInheritanceTree(examId);

  return NextResponse.json({
    systemInfo: {
      version: '2.0.0',
      features: [
        'Question style patterns (direct, scenario, case_study)',
        'Intelligent distribution management (60/30/10 default)',
        'Style validation and quality scoring',
        'Template inheritance and caching',
        'Session-based distribution tracking'
      ]
    },
    examProfile: {
      id: examProfile.id,
      name: examProfile.name,
      totalObjectives: examProfile.objectives.length,
      questionTypes: examProfile.questionTypes,
      targetDistribution,
      customQuestionGeneration: examProfile.questionGeneration || 'Using defaults'
    },
    optimizations: {
      templateInheritance: inheritanceTree,
      cachingEnabled: true,
      performanceOptimizations: [
        'Template caching with 1-hour expiry',
        'Batch template generation',
        'Exam family inheritance patterns',
        'Optimized generation order'
      ]
    },
    availableEndpoints: {
      distribution: '/api/question-system-demo?action=distribution&examId=' + examId,
      patterns: '/api/question-system-demo?action=patterns&examId=' + examId,
      performance: '/api/question-system-demo?action=performance',
      validation: '/api/question-system-demo?action=validation'
    }
  });
}

async function getDistributionDemo(sessionId: string, examId: string) {
  const examProfile = getExamProfile(examId);
  if (!examProfile) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }

  // Initialize session
  QuestionDistributionManager.initializeSession(sessionId, examId);

  // Simulate generating questions for different objectives
  const simulatedQuestions = [];
  const objectives = examProfile.objectives.slice(0, 5); // Take first 5 objectives

  for (const objective of objectives) {
    // Generate 3 questions per objective
    for (let i = 0; i < 3; i++) {
      const selectedStyle = QuestionDistributionManager.getNextQuestionStyle(
        sessionId,
        examProfile,
        objective
      );

      // Record the question
      QuestionDistributionManager.recordQuestionGenerated(
        sessionId,
        examId,
        objective.id,
        selectedStyle
      );

      simulatedQuestions.push({
        objectiveId: objective.id,
        objectiveTitle: objective.title,
        selectedStyle,
        questionNumber: simulatedQuestions.length + 1
      });
    }
  }

  // Get final distribution stats
  const distributionStats = QuestionDistributionManager.getDistributionSummary(sessionId);
  const distributionHealth = QuestionDistributionManager.calculateDistributionHealth(sessionId, examId);

  return NextResponse.json({
    sessionId,
    simulatedQuestions,
    distributionStats,
    distributionHealth,
    analysis: {
      totalQuestions: simulatedQuestions.length,
      styleBreakdown: simulatedQuestions.reduce((acc, q) => {
        acc[q.selectedStyle] = (acc[q.selectedStyle] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      objectiveCoverage: objectives.length
    }
  });
}

async function getPatternsDemo(examId: string) {
  const examProfile = getExamProfile(examId);
  if (!examProfile) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }

  // Show pattern selection for different objectives
  const patternExamples = examProfile.objectives.slice(0, 3).map(objective => {
    const mockCurrentDistribution = { direct: 0, scenario: 0, case_study: 0 };
    
    return {
      objective: {
        id: objective.id,
        title: objective.title,
        level: objective.level,
        difficulty: objective.difficulty
      },
      recommendedStyles: {
        first: selectQuestionPattern(examId, objective, mockCurrentDistribution, 0),
        afterDirect: selectQuestionPattern(examId, objective, { direct: 1, scenario: 0, case_study: 0 }, 1),
        afterScenario: selectQuestionPattern(examId, objective, { direct: 1, scenario: 1, case_study: 0 }, 2)
      },
      stylePreferences: objective.questionStylePreferences || 'Using exam defaults',
      inheritanceInfo: QuestionOptimizationManager.getInheritanceTree(examId)
    };
  });

  return NextResponse.json({
    examId,
    patternExamples,
    availableStyles: ['direct', 'scenario', 'case_study'],
    selectionCriteria: [
      'Current session distribution vs target ratios',
      'Objective learning level (knowledge/application/synthesis)',
      'Objective difficulty level',
      'Style constraints and preferences'
    ]
  });
}

async function getPerformanceMetrics() {
  const performanceMetrics = QuestionOptimizationManager.getPerformanceMetrics();
  
  return NextResponse.json({
    caching: performanceMetrics,
    systemHealth: {
      status: performanceMetrics.cacheHitRate > 70 ? 'healthy' : 'needs_attention',
      uptime: 'Active',
      memoryUsage: `${performanceMetrics.cacheSize} cached templates`
    },
    optimizations: [
      'Template inheritance by exam family',
      'Intelligent caching with TTL',
      'Batch template generation',
      'Priority-based generation ordering'
    ],
    scalability: {
      supportedExams: Object.keys(EXAM_PATTERN_PREFERENCES).length,
      templateFamilies: 3,
      maxConcurrentSessions: 'Unlimited (memory-based)',
      sessionTimeout: '2 hours'
    }
  });
}

async function getValidationDemo() {
  // Create sample questions for validation
  const sampleQuestions = [
    {
      question: "What is the primary difference between ROE and ROA?",
      options: ["ROE includes debt effects", "ROA is always higher", "No difference"],
      correct: 0,
      intendedStyle: 'direct' as const
    },
    {
      question: "A portfolio manager at ABC firm is analyzing a stock with a beta of 1.3 and expected return of 15%. If the risk-free rate is 3% and market return is 10%, what is the stock's alpha?",
      options: ["2.1%", "5.9%", "12%"],
      correct: 0,
      intendedStyle: 'direct' as const // This should fail validation - it's actually a scenario
    },
    {
      question: "A bond has a modified duration of 4.2 years and current yield of 5%. If interest rates increase by 1%, what is the approximate price change?",
      options: ["-4.2%", "+4.2%", "-5%"],
      correct: 0,
      intendedStyle: 'scenario' as const
    }
  ];

  const validationResults = sampleQuestions.map((q, index) => {
    // Mock exam profile and objective for validation
    const mockExamProfile: ExamProfile = {
      id: 'mock-exam',
      name: 'Mock Exam',
      description: 'Mock exam for validation',
      provider: 'Mock Provider',
      objectives: [],
      questionTypes: ['multiple_choice'],
      constraints: { 
        totalQuestions: 100,
        timeMinutes: 120,
        optionCount: 3,
        passingScore: 70
      },
      context: { 
        examFormat: 'Mock format',
        difficulty: 'Mock difficulty',
        focus: 'Mock focus',
        calculatorAllowed: false,
        terminology: ['ROE', 'ROA', 'beta', 'alpha'] 
      },
      studySettings: {
        defaultQuestionsPerObjective: 10,
        masteryThreshold: 80,
        spaceRepetition: true,
        adaptiveDifficulty: false
      }
    };

    const mockObjective: ExamObjective = {
      id: 'mock-objective',
      title: 'Mock Objective',
      description: 'Mock objective for validation',
      weight: 10,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 10,
      keyTopics: ['Financial ratios', 'Portfolio analysis']
    };

    const validation = QuestionValidator.validateQuestion(
      q,
      q.intendedStyle,
      mockExamProfile,
      mockObjective
    );

    return {
      questionNumber: index + 1,
      question: q.question.substring(0, 50) + '...',
      intendedStyle: q.intendedStyle,
      validation: {
        isValid: validation.isValid,
        score: validation.score,
        issueCount: validation.issues.length,
        majorIssues: validation.issues.filter(i => i.severity === 'high').length,
        suggestions: validation.suggestions.slice(0, 2) // Show first 2 suggestions
      }
    };
  });

  return NextResponse.json({
    validationResults,
    validationCriteria: [
      'Style adherence (direct/scenario/case_study)',
      'Content quality and relevance',
      'Format correctness',
      'Clarity and language quality'
    ],
    qualityThresholds: {
      minimum: 70,
      good: 85,
      excellent: 95
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'clearCache':
        const cleared = QuestionOptimizationManager.clearCache(data.examId);
        return NextResponse.json({ 
          success: true, 
          message: `Cleared ${cleared} cache entries` 
        });

      case 'preloadExam':
        const examProfile = getExamProfile(data.examId);
        if (!examProfile) {
          return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }
        
        await QuestionOptimizationManager.preloadExamTemplates(examProfile);
        return NextResponse.json({ 
          success: true, 
          message: `Preloaded templates for ${examProfile.name}` 
        });

      case 'resetSession':
        QuestionDistributionManager.resetSession(data.sessionId);
        return NextResponse.json({ 
          success: true, 
          message: 'Session reset successfully' 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Demo API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


