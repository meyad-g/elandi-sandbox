import { ExamProfile } from '../../certifications';

export const cfaL3: ExamProfile = {
  id: 'cfa-l3',
  name: 'CFA Level III',
  description: 'Chartered Financial Analyst Level III - Portfolio Management and Wealth Planning',
  provider: 'CFA Institute',
  objectives: [
    {
      id: 'behavioral-finance',
      title: 'Behavioral Finance',
      description: 'Behavioral biases and their impact on investment decisions',
      weight: 7,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 4,
      keyTopics: [
        'Cognitive biases',
        'Emotional biases',
        'Behavioral portfolio theory',
        'Advisor-client relations',
        'Behavioral finance applications'
      ],
      learningOutcomes: [
        'Identify and analyze behavioral biases affecting investment decisions',
        'Apply behavioral finance concepts to portfolio management',
        'Develop strategies to mitigate behavioral biases',
        'Evaluate the effectiveness of behavioral coaching techniques'
      ],
      examples: [
        'Overconfidence in investment decisions',
        'Loss aversion in portfolio allocation',
        'Mental accounting effects',
        'Framing bias in client communications'
      ]
    },
    {
      id: 'private-wealth-management',
      title: 'Private Wealth Management',
      description: 'Comprehensive wealth management for high-net-worth individuals',
      weight: 15,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 8,
      keyTopics: [
        'Client discovery and goal setting',
        'Tax-efficient investing',
        'Estate planning strategies',
        'Risk management and insurance',
        'Family governance',
        'Behavioral coaching'
      ],
      learningOutcomes: [
        'Develop comprehensive wealth management strategies',
        'Integrate tax considerations into investment planning',
        'Design estate planning solutions',
        'Implement risk management frameworks for wealthy families'
      ],
      examples: [
        'Tax-loss harvesting strategies',
        'Charitable giving techniques',
        'Multi-generational wealth transfer',
        'Private business succession planning'
      ]
    },
    {
      id: 'portfolio-management-institutional',
      title: 'Portfolio Management for Institutional Investors',
      description: 'Investment strategies for pension funds, endowments, and foundations',
      weight: 15,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 8,
      keyTopics: [
        'Defined benefit pension plans',
        'Defined contribution plans',
        'Endowments and foundations',
        'Insurance companies',
        'Banks and other institutional investors',
        'Sovereign wealth funds'
      ],
      learningOutcomes: [
        'Analyze institutional investor objectives and constraints',
        'Design appropriate asset allocation strategies',
        'Evaluate risk management techniques for institutions',
        'Assess performance measurement and attribution'
      ],
      examples: [
        'Pension liability-driven investing',
        'Endowment spending policies',
        'Insurance company ALM strategies',
        'Sovereign wealth fund governance'
      ]
    },
    {
      id: 'capital-market-expectations',
      title: 'Capital Market Expectations',
      description: 'Forecasting returns, risks, and correlations for major asset classes',
      weight: 10,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 6,
      keyTopics: [
        'Framework for capital market expectations',
        'Challenges in forecasting',
        'Tools for setting expectations',
        'Fixed-income return expectations',
        'Equity return expectations',
        'Alternative investment expectations'
      ],
      learningOutcomes: [
        'Develop frameworks for setting capital market expectations',
        'Apply statistical and economic models for forecasting',
        'Evaluate the reliability of different forecasting methods',
        'Integrate expectations into strategic asset allocation'
      ],
      examples: [
        'Building blocks approach to equity returns',
        'Yield curve analysis for bond returns',
        'Economic scenario analysis',
        'Alternative investment return modeling'
      ]
    },
    {
      id: 'asset-allocation',
      title: 'Asset Allocation',
      description: 'Strategic and tactical asset allocation frameworks and implementation',
      weight: 10,
      level: 'synthesis', 
      difficulty: 'advanced',
      questionsPerSession: 6,
      keyTopics: [
        'Mean-variance optimization',
        'Strategic asset allocation',
        'Tactical asset allocation',
        'Dynamic asset allocation',
        'Asset-liability management',
        'Multi-factor models'
      ],
      learningOutcomes: [
        'Apply modern portfolio theory to asset allocation',
        'Design strategic asset allocation policies',
        'Implement tactical allocation strategies',
        'Evaluate dynamic allocation approaches'
      ],
      examples: [
        'Black-Litterman optimization',
        'Risk budgeting frameworks',
        'Liability-driven investment strategies',
        'Factor-based allocation models'
      ]
    },
    {
      id: 'fixed-income-portfolio-management',
      title: 'Fixed-Income Portfolio Management',
      description: 'Advanced fixed-income strategies and risk management',
      weight: 10,
      level: 'application',
      difficulty: 'advanced',
      questionsPerSession: 6,
      keyTopics: [
        'Liability-driven investing',
        'Active bond strategies',
        'Credit strategies',
        'International fixed income',
        'Fixed-income derivatives',
        'Structured products'
      ],
      learningOutcomes: [
        'Implement liability-driven investment strategies',
        'Apply active fixed-income management techniques',
        'Evaluate credit investment strategies',
        'Manage international fixed-income exposures'
      ],
      examples: [
        'Duration matching strategies',
        'Credit spread analysis',
        'Currency hedging in global bonds',
        'Structured product evaluation'
      ]
    },
    {
      id: 'equity-portfolio-management',
      title: 'Equity Portfolio Management',
      description: 'Active and passive equity strategies and implementation',
      weight: 10,
      level: 'application',
      difficulty: 'advanced',
      questionsPerSession: 6,
      keyTopics: [
        'Passive equity strategies',
        'Active equity strategies',
        'Equity style management',
        'International equity investing',
        'Equity derivatives strategies',
        'Performance evaluation'
      ],
      learningOutcomes: [
        'Evaluate passive vs active equity strategies',
        'Implement style-based equity approaches',
        'Manage international equity portfolios',
        'Apply equity derivatives for risk management'
      ],
      examples: [
        'Index replication strategies',
        'Factor-based equity investing',
        'Currency overlay strategies',
        'Options-based equity strategies'
      ]
    },
    {
      id: 'alternative-investments-portfolio',
      title: 'Alternative Investments for Portfolio Management',
      description: 'Integration of alternatives into diversified portfolios',
      weight: 8,
      level: 'application',
      difficulty: 'advanced',
      questionsPerSession: 5,
      keyTopics: [
        'Real estate investment',
        'Private equity and venture capital',
        'Hedge fund strategies',
        'Commodities',
        'Infrastructure investments',
        'Risk management with alternatives'
      ],
      learningOutcomes: [
        'Evaluate alternative investments for portfolio inclusion',
        'Assess risk-return characteristics of alternatives',
        'Implement due diligence processes',
        'Monitor and manage alternative investment exposures'
      ],
      examples: [
        'Real estate portfolio allocation',
        'Private equity fund selection',
        'Hedge fund due diligence',
        'Commodity investment strategies'
      ]
    },
    {
      id: 'risk-management',
      title: 'Risk Management',
      description: 'Comprehensive risk management frameworks and implementation',
      weight: 8,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 5,
      keyTopics: [
        'Risk governance frameworks',
        'Risk budgeting and allocation',
        'Measuring and managing market risk',
        'Credit and counterparty risk',
        'Operational risk management',
        'Integrated risk management'
      ],
      learningOutcomes: [
        'Design comprehensive risk management frameworks',
        'Implement risk budgeting processes',
        'Apply risk measurement and monitoring techniques',
        'Evaluate integrated risk management approaches'
      ],
      examples: [
        'VaR and CVaR calculations',
        'Stress testing methodologies',
        'Counterparty risk assessment',
        'Operational risk controls'
      ]
    },
    {
      id: 'performance-evaluation',
      title: 'Performance Evaluation',
      description: 'Portfolio performance measurement, attribution, and appraisal',
      weight: 7,
      level: 'application',
      difficulty: 'advanced',
      questionsPerSession: 4,
      keyTopics: [
        'Performance measurement',
        'Performance attribution',
        'Performance appraisal',
        'Manager selection and monitoring',
        'GIPS compliance',
        'Performance presentation'
      ],
      learningOutcomes: [
        'Calculate and interpret performance metrics',
        'Conduct performance attribution analysis',
        'Evaluate manager skill and performance persistence',
        'Apply GIPS standards to performance reporting'
      ],
      examples: [
        'Time-weighted vs money-weighted returns',
        'Sector and security attribution analysis',
        'Risk-adjusted performance measures',
        'GIPS compliant presentations'
      ]
    }
  ],
  questionTypes: ['essay', 'multiple_choice', 'vignette'],
  constraints: {
    totalQuestions: 44,
    timeMinutes: 270,
    optionCount: 3,
    passingScore: 70
  },
  context: {
    examFormat: 'Morning: 8-12 essay questions (2.25 hours), Afternoon: 32 item set questions (2.25 hours)',
    difficulty: 'Expert level - synthesis and application of portfolio management concepts',
    focus: 'Portfolio management, wealth planning, and institutional investment management',
    calculatorAllowed: true,
    commonFormulas: [
      'Mean-variance optimization',
      'Capital market expectations models',
      'Risk budgeting formulas',
      'Performance attribution calculations',
      'Asset-liability management metrics'
    ],
    terminology: [
      'Item set format',
      'Essay questions',
      'Portfolio management synthesis',
      'Wealth planning integration',
      'Institutional investment strategies'
    ]
  },
  studySettings: {
    defaultQuestionsPerObjective: 6,
    masteryThreshold: 75,
    spaceRepetition: true,
    adaptiveDifficulty: true
  }
};
