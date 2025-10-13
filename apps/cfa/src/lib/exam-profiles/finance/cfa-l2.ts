import { ExamProfile } from '../../certifications';

export const cfaL2: ExamProfile = {
  id: 'cfa-l2',
  name: 'CFA Level II',
  description: 'Chartered Financial Analyst Level II - Advanced Investment Analysis',
  provider: 'CFA Institute',
  objectives: [
    {
      id: 'ethical-professional-standards',
      title: 'Ethical and Professional Standards',
      description: 'Application of CFA Institute Code and Standards in Practice',
      weight: 10,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 6,
      keyTopics: [
        'Application of Code and Standards',
        'Asset Manager Code',
        'Global Investment Performance Standards (GIPS)',
        'Research Objectivity Standards',
        'Soft Dollar Standards'
      ],
      examples: [
        'Complex conflicts of interest',
        'Research independence issues',
        'Performance presentation compliance',
        'Client relationship management ethics'
      ]
    },
    {
      id: 'quantitative-methods',
      title: 'Quantitative Methods',
      description: 'Advanced Statistics, Regression, and Time Series Analysis',
      weight: 5,
      level: 'application',
      difficulty: 'advanced',
      questionsPerSession: 8,
      keyTopics: [
        'Multiple regression and correlation',
        'Time series analysis',
        'Machine learning fundamentals',
        'Big data techniques',
        'Advanced hypothesis testing'
      ],
      examples: [
        'Multiple regression analysis',
        'ANOVA tests',
        'Autocorrelation testing',
        'Cross-validation techniques'
      ]
    },
    {
      id: 'economics',
      title: 'Economics',
      description: 'Economic Growth, Business Cycles, and Currency Valuation',
      weight: 8,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 10,
      keyTopics: [
        'Economic growth theory',
        'Business cycle analysis',
        'Monetary and fiscal policy',
        'International trade and capital flows',
        'Currency exchange rates',
        'Economic indicators'
      ],
      examples: [
        'Growth accounting equations',
        'Phillips curve analysis',
        'Exchange rate determination models',
        'Balance of payments analysis'
      ]
    },
    {
      id: 'financial-statement-analysis',
      title: 'Financial Statement Analysis',
      description: 'Advanced FSA, Quality Assessment, and Applications',
      weight: 12,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 15,
      keyTopics: [
        'Intercorporate investments',
        'Employee compensation',
        'Multinational operations',
        'Analysis of financial institutions',
        'Evaluating financial reporting quality',
        'Financial statement modeling'
      ],
      examples: [
        'Equity method accounting',
        'Consolidation procedures',
        'Currency translation effects',
        'Pension accounting complexities'
      ]
    },
    {
      id: 'corporate-issuers',
      title: 'Corporate Issuers',
      description: 'Advanced Corporate Finance and Capital Structure Decisions',
      weight: 8,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 10,
      keyTopics: [
        'Capital structure theory',
        'Dividend policy',
        'Corporate restructuring',
        'Working capital management',
        'Corporate governance',
        'Environmental, Social, Governance (ESG) factors'
      ],
      examples: [
        'Optimal capital structure analysis',
        'M&A valuation',
        'Dividend policy optimization',
        'ESG integration in analysis'
      ]
    },
    {
      id: 'equity-investments',
      title: 'Equity Investments',
      description: 'Advanced Equity Analysis and Valuation Techniques',
      weight: 15,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 18,
      keyTopics: [
        'Industry and company analysis',
        'Equity valuation models',
        'Residual income models',
        'Private company valuation',
        'Market-based valuation',
        'ESG considerations in equity analysis'
      ],
      examples: [
        'Discounted cash flow models',
        'Residual income valuation',
        'Private equity valuation',
        'Relative valuation multiples'
      ]
    },
    {
      id: 'fixed-income',
      title: 'Fixed Income',
      description: 'Advanced Fixed Income Analysis and Portfolio Management',
      weight: 12,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 15,
      keyTopics: [
        'The term structure and interest rate dynamics',
        'Valuation and analysis of bonds with embedded options',
        'Credit analysis models',
        'Credit default swaps',
        'Term structure models',
        'Fixed income portfolio management'
      ],
      examples: [
        'Binomial interest rate trees',
        'Option-adjusted spreads',
        'Credit risk modeling',
        'Yield curve strategies'
      ]
    },
    {
      id: 'derivatives',
      title: 'Derivatives',
      description: 'Advanced Derivative Valuation and Risk Management',
      weight: 8,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 12,
      keyTopics: [
        'Pricing and valuation of forward commitments',
        'Valuation of contingent claims',
        'Derivatives strategies',
        'Credit derivatives',
        'Risk management applications'
      ],
      examples: [
        'Black-Scholes-Merton model',
        'Binomial option pricing',
        'Interest rate derivatives',
        'Currency derivatives strategies'
      ]
    },
    {
      id: 'alternative-investments',
      title: 'Alternative Investments',
      description: 'Advanced Alternative Investment Analysis and Strategies',
      weight: 7,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 10,
      keyTopics: [
        'Private wealth management',
        'Institutional investors',
        'Capital market expectations',
        'Asset allocation',
        'Currency management',
        'Performance evaluation'
      ],
      examples: [
        'Real estate valuation methods',
        'Private equity fund analysis',
        'Hedge fund strategies',
        'Commodity investment approaches'
      ]
    },
    {
      id: 'portfolio-management',
      title: 'Portfolio Management and Wealth Planning',
      description: 'Advanced Portfolio Management and Behavioral Finance',
      weight: 15,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 15,
      keyTopics: [
        'Portfolio management for institutional and individual investors',
        'Behavioral finance',
        'Asset allocation and related decisions',
        'Fixed income portfolio management',
        'Equity portfolio management',
        'Alternative investments portfolio management'
      ],
      examples: [
        'Strategic vs tactical asset allocation',
        'Behavioral biases in investment decisions',
        'Risk budgeting applications',
        'Performance attribution analysis'
      ]
    }
  ],
  questionTypes: ['vignette', 'multiple_choice'],
  constraints: {
    totalQuestions: 88,
    timeMinutes: 270,
    optionCount: 3,
    passingScore: 70
  },
  context: {
    examFormat: '22 item sets with 4 questions each (88 total), vignette-based format',
    difficulty: 'Advanced level - deep analysis and application of investment tools',
    focus: 'Asset valuation, analysis, and advanced portfolio management techniques',
    calculatorAllowed: true,
    commonFormulas: [
      'Advanced DCF and valuation models',
      'Option pricing models (Black-Scholes)',
      'Fixed income mathematics',
      'Portfolio optimization formulas',
      'Regression and statistical analysis'
    ],
    terminology: [
      'Vignette-based questions',
      'Advanced LOS applications',
      'Item set format',
      'Comprehensive case analysis'
    ]
  },
  studySettings: {
    defaultQuestionsPerObjective: 8,
    masteryThreshold: 75,
    spaceRepetition: true,
    adaptiveDifficulty: true
  }
};
