// Certification exam data and configurations

export interface ExamObjective {
  id: string;
  title: string;
  description: string;
  weight: number; // Percentage of exam
  level: 'knowledge' | 'application' | 'synthesis';
  examples?: string[];
  keyTopics?: string[];
  // New fields for enhanced functionality
  questionsPerSession?: number; // Recommended questions per study session
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[]; // Other objective IDs that should be studied first
  learningOutcomes?: string[]; // Specific LOS (Learning Outcome Statements)
}

export interface ExamProfile {
  id: string;
  name: string;
  description: string;
  provider: string;
  objectives: ExamObjective[];
  questionTypes: ('multiple_choice' | 'multiple_response' | 'vignette' | 'essay')[];
  constraints: {
    totalQuestions: number;
    timeMinutes: number;
    optionCount: number; // 3 for CFA, 4 for AWS
    passingScore: number;
  };
  context: {
    examFormat: string;
    difficulty: string;
    focus: string;
    calculatorAllowed?: boolean;
    commonFormulas?: string[];
    terminology?: string[];
  };
  // New fields for enhanced study experience
  studySettings?: {
    defaultQuestionsPerObjective: number;
    masteryThreshold: number; // Percentage to consider "mastered"
    spaceRepetition: boolean;
    adaptiveDifficulty: boolean;
  };
}

export const EXAM_PROFILES: Record<string, ExamProfile> = {
  'cfa-l1': {
    id: 'cfa-l1',
    name: 'CFA Level I',
    description: 'Chartered Financial Analyst Level I - Foundation of Investment Analysis',
    provider: 'CFA Institute',
    objectives: [
      {
        id: 'ethical-professional-standards',
        title: 'Ethical and Professional Standards',
        description: 'Ethics and Trust in Investment Profession, Code of Ethics and Standards',
        weight: 15,
        level: 'knowledge',
        difficulty: 'intermediate',
        questionsPerSession: 8,
        keyTopics: [
          'Code of Ethics',
          'Seven Standards of Professional Conduct',
          'Global Investment Performance Standards (GIPS)',
          'Research Objectivity Standards',
          'Asset Manager Code of Professional Conduct',
          'Soft Dollar Standards'
        ],
        learningOutcomes: [
          'Describe the role of a code of ethics in defining a profession',
          'Explain the ethical responsibilities required by the Code and Standards',
          'Identify violations of the Code and Standards',
          'Distinguish between the Code and Standards and legal requirements'
        ],
        examples: [
          'Material nonpublic information scenarios',
          'Conflicts of interest identification',
          'Fair dealing with clients',
          'Independence and objectivity issues',
          'Performance presentation standards'
        ]
      },
      {
        id: 'quantitative-methods',
        title: 'Quantitative Methods',
        description: 'Time Value of Money, Statistics, and Probability Concepts',
        weight: 8,
        level: 'application',
        difficulty: 'intermediate',
        questionsPerSession: 12,
        keyTopics: [
          'Time Value of Money calculations',
          'Statistical measures and distributions',
          'Probability concepts',
          'Sampling and hypothesis testing',
          'Correlation and regression',
          'Technical analysis basics'
        ],
        learningOutcomes: [
          'Calculate present and future values',
          'Interpret measures of central tendency and dispersion',
          'Calculate and interpret probability',
          'Formulate null and alternative hypotheses',
          'Calculate and interpret correlation coefficient'
        ],
        examples: [
          'PV/FV of single sums and annuities',
          'Effective annual rate calculations',
          'Standard deviation and variance',
          'Normal distribution applications',
          'Confidence intervals and t-tests'
        ]
      },
      {
        id: 'economics',
        title: 'Economics',
        description: 'Microeconomics, Macroeconomics, and International Trade',
        weight: 8,
        level: 'knowledge',
        difficulty: 'intermediate',
        questionsPerSession: 10,
        keyTopics: [
          'Supply and demand analysis',
          'Consumer and producer choice',
          'Market structures and efficiency',
          'Aggregate output and growth',
          'Business cycles',
          'Monetary and fiscal policy',
          'International trade and capital flows',
          'Currency exchange rates'
        ],
        learningOutcomes: [
          'Calculate and interpret elasticities',
          'Analyze consumer and firm behavior',
          'Compare market structures',
          'Explain aggregate demand and supply',
          'Describe monetary and fiscal policy tools'
        ],
        examples: [
          'Price elasticity calculations',
          'Perfect competition vs monopoly',
          'GDP and economic indicators',
          'Interest rate impacts',
          'Exchange rate determination'
        ]
      },
      {
        id: 'financial-statement-analysis',
        title: 'Financial Statement Analysis',
        description: 'Financial Reporting, Analysis, and Ratio Calculations',
        weight: 13,
        level: 'application',
        difficulty: 'advanced',
        questionsPerSession: 15,
        prerequisites: ['quantitative-methods'],
        keyTopics: [
          'Financial statement components',
          'Balance sheet analysis',
          'Income statement analysis',
          'Cash flow statement analysis',
          'Financial ratios (liquidity, activity, leverage, profitability)',
          'Common size analysis',
          'Financial reporting quality',
          'Pro forma adjustments'
        ],
        learningOutcomes: [
          'Describe roles of financial statements',
          'Calculate and interpret financial ratios',
          'Analyze cash flow statements',
          'Evaluate financial reporting quality',
          'Compare companies using ratio analysis'
        ],
        examples: [
          'ROE and ROA calculations',
          'Working capital analysis',
          'Debt-to-equity ratios',
          'Operating vs free cash flow',
          'DuPont formula applications'
        ]
      },
      {
        id: 'corporate-issuers',
        title: 'Corporate Issuers',
        description: 'Corporate Governance, Capital Structure, and Working Capital Management',
        weight: 8,
        level: 'application',
        difficulty: 'intermediate',
        questionsPerSession: 10,
        prerequisites: ['financial-statement-analysis'],
        keyTopics: [
          'Corporate governance principles',
          'Stakeholder management',
          'Capital budgeting process',
          'NPV, IRR, and payback methods',
          'Cost of capital (WACC)',
          'Working capital management',
          'Corporate restructuring'
        ],
        learningOutcomes: [
          'Describe corporate governance objectives',
          'Calculate NPV, IRR, and payback period',
          'Estimate weighted average cost of capital',
          'Evaluate working capital management',
          'Analyze capital structure decisions'
        ],
        examples: [
          'NPV vs IRR decision rules',
          'WACC calculations',
          'Cash conversion cycle',
          'Dividend policy impacts',
          'Share repurchase analysis'
        ]
      },
      {
        id: 'equity-investments',
        title: 'Equity Investments',
        description: 'Equity Markets, Valuation, and Portfolio Management Concepts',
        weight: 10,
        level: 'application',
        difficulty: 'advanced',
        questionsPerSession: 12,
        prerequisites: ['financial-statement-analysis', 'quantitative-methods'],
        keyTopics: [
          'Market organization and structure',
          'Security market indices',
          'Market efficiency concepts',
          'Equity valuation models',
          'Industry and company analysis',
          'Technical analysis basics',
          'Behavioral finance concepts'
        ],
        learningOutcomes: [
          'Describe market structures and institutions',
          'Calculate and interpret security market indices',
          'Compare market efficiency forms',
          'Apply dividend discount models',
          'Analyze P/E ratios and relative valuation'
        ],
        examples: [
          'Market capitalization indices',
          'Dividend discount model (DDM)',
          'P/E, P/B, and P/S ratios',
          'Efficient market hypothesis tests',
          'Technical analysis patterns'
        ]
      },
      {
        id: 'fixed-income',
        title: 'Fixed Income',
        description: 'Bond Markets, Valuation, and Risk Management',
        weight: 10,
        level: 'application',
        difficulty: 'advanced',
        questionsPerSession: 12,
        prerequisites: ['quantitative-methods'],
        keyTopics: [
          'Bond fundamentals and features',
          'Bond pricing and yields',
          'Duration and convexity',
          'Yield curve analysis',
          'Credit analysis fundamentals',
          'Interest rate risk',
          'Securitization basics'
        ],
        learningOutcomes: [
          'Describe bond features and types',
          'Calculate bond prices and yields',
          'Calculate and interpret duration and convexity',
          'Analyze yield curves',
          'Evaluate credit risk'
        ],
        examples: [
          'Yield to maturity calculations',
          'Modified duration applications',
          'Yield spread analysis',
          'Callable bond valuation',
          'Credit rating impacts'
        ]
      },
      {
        id: 'derivatives',
        title: 'Derivatives',
        description: 'Derivative Instruments and Risk Management Applications',
        weight: 8,
        level: 'application',
        difficulty: 'intermediate',
        questionsPerSession: 10,
        prerequisites: ['quantitative-methods', 'fixed-income'],
        keyTopics: [
          'Derivative fundamentals',
          'Forward contracts',
          'Futures contracts',
          'Options basics',
          'Swap fundamentals',
          'Risk management applications',
          'Arbitrage concepts'
        ],
        learningOutcomes: [
          'Define derivative instruments',
          'Compare forward and futures contracts',
          'Calculate option payoffs',
          'Describe swap characteristics',
          'Explain risk management applications'
        ],
        examples: [
          'Forward contract pricing',
          'Futures margin requirements',
          'Call and put option payoffs',
          'Interest rate swap basics',
          'Hedging strategies'
        ]
      },
      {
        id: 'alternative-investments',
        title: 'Alternative Investments',
        description: 'Real Estate, Private Equity, Hedge Funds, and Commodities',
        weight: 7,
        level: 'knowledge',
        difficulty: 'beginner',
        questionsPerSession: 8,
        keyTopics: [
          'Alternative investment features',
          'Real estate investments',
          'Private equity and venture capital',
          'Hedge fund strategies',
          'Commodity investments',
          'Infrastructure investments',
          'Due diligence considerations'
        ],
        learningOutcomes: [
          'Compare alternative investments to traditional investments',
          'Describe real estate investment approaches',
          'Explain private equity strategies',
          'Describe hedge fund characteristics',
          'Compare commodity investment methods'
        ],
        examples: [
          'REIT vs direct real estate',
          'Buyout vs venture capital',
          'Long/short equity strategies',
          'Commodity futures vs ETFs',
          'Infrastructure investment features'
        ]
      },
      {
        id: 'portfolio-management',
        title: 'Portfolio Management and Wealth Planning',
        description: 'Portfolio Theory, Asset Allocation, and Wealth Management',
        weight: 13,
        level: 'synthesis',
        difficulty: 'advanced',
        questionsPerSession: 12,
        prerequisites: ['quantitative-methods', 'equity-investments', 'fixed-income'],
        keyTopics: [
          'Portfolio management process',
          'Risk and return concepts',
          'Modern portfolio theory',
          'Capital asset pricing model',
          'Efficient market hypothesis',
          'Behavioral finance',
          'Client portfolio management',
          'Performance evaluation'
        ],
        learningOutcomes: [
          'Describe portfolio management process',
          'Calculate and interpret portfolio risk and return',
          'Explain capital asset pricing model',
          'Compare asset allocation approaches',
          'Evaluate portfolio performance'
        ],
        examples: [
          'Risk-return trade-offs',
          'Efficient frontier construction',
          'Beta and systematic risk',
          'Sharpe ratio calculations',
          'Behavioral biases impact'
        ]
      }
    ],
    questionTypes: ['multiple_choice'],
    constraints: {
      totalQuestions: 180,
      timeMinutes: 270,
      optionCount: 3,
      passingScore: 70
    },
    context: {
      examFormat: '180 multiple-choice questions (A, B, C), two sessions of 2.25 hours each',
      difficulty: 'Foundation level - comprehensive knowledge of investment analysis fundamentals',
      focus: 'Investment tools, valuation, and ethical/professional standards',
      calculatorAllowed: true,
      commonFormulas: [
        'TVM equations (PV, FV, PMT, I/Y, N)',
        'Statistical measures (mean, variance, standard deviation)',
        'Financial ratios (ROE, ROA, ratios)',
        'Bond pricing and yield calculations',
        'CAPM and portfolio theory',
        'Option payoff diagrams'
      ],
      terminology: [
        'CFA Code and Standards',
        'GIPS (Global Investment Performance Standards)',
        'LOS (Learning Outcome Statements)',
        'Investment analysis and portfolio management',
        'Ethical and professional conduct'
      ]
    },
    studySettings: {
      defaultQuestionsPerObjective: 10,
      masteryThreshold: 80,
      spaceRepetition: true,
      adaptiveDifficulty: true
    }
  },

  'cfa-l2': {
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
  },

  'aws-cloud-practitioner': {
    id: 'aws-cloud-practitioner',
    name: 'AWS Cloud Practitioner',
    description: 'AWS Certified Cloud Practitioner',
    provider: 'Amazon Web Services',
    objectives: [
      {
        id: 'cloud-concepts',
        title: 'Cloud Concepts',
        description: 'Cloud computing basics and AWS value proposition',
        weight: 26,
        level: 'knowledge',
        keyTopics: ['Cloud computing models', 'Deployment models', 'AWS global infrastructure', 'Well-Architected Framework'],
        examples: ['IaaS vs PaaS vs SaaS', 'Public vs Private cloud', 'Regions and AZs', 'Cost benefits of cloud']
      },
      {
        id: 'security-compliance',
        title: 'Security and Compliance',
        description: 'AWS security model and compliance',
        weight: 25,
        level: 'knowledge',
        keyTopics: ['Shared Responsibility Model', 'AWS security services', 'Compliance programs', 'Encryption'],
        examples: ['Who secures what', 'IAM basics', 'Security groups vs NACLs', 'Data encryption']
      },
      {
        id: 'technology',
        title: 'Technology',
        description: 'AWS services and global infrastructure',
        weight: 33,
        level: 'application',
        keyTopics: ['Compute services', 'Storage services', 'Database services', 'Networking'],
        examples: ['EC2 vs Lambda', 'S3 vs EBS', 'RDS vs DynamoDB', 'VPC basics']
      },
      {
        id: 'billing-pricing',
        title: 'Billing and Pricing',
        description: 'AWS pricing models and cost management',
        weight: 16,
        level: 'application',
        keyTopics: ['Pricing models', 'Cost management tools', 'Support plans', 'Free tier'],
        examples: ['On-demand vs Reserved', 'AWS Calculator', 'Cost Explorer', 'Budgets and alerts']
      }
    ],
    questionTypes: ['multiple_choice'],
    constraints: {
      totalQuestions: 65,
      timeMinutes: 90,
      optionCount: 4,
      passingScore: 700
    },
    context: {
      examFormat: '65 multiple-choice questions, 4 options, 90 minutes',
      difficulty: 'Foundational - no technical experience required',
      focus: 'Business value and basic cloud concepts',
      terminology: ['Cloud computing', 'AWS services', 'Scalability', 'Elasticity', 'High availability']
    }
  },

  'aws-saa': {
    id: 'aws-saa',
    name: 'AWS Solutions Architect Associate',
    description: 'AWS Certified Solutions Architect Associate',
    provider: 'Amazon Web Services',
    objectives: [
      {
        id: 'design-resilient-architectures',
        title: 'Design Resilient Architectures',
        description: 'Design multi-tier, scalable, and fault-tolerant architectures',
        weight: 26,
        level: 'application',
        keyTopics: ['Multi-AZ deployments', 'Auto Scaling', 'Load balancing', 'Disaster recovery'],
        examples: ['Cross-AZ redundancy', 'ELB types', 'Auto Scaling policies', 'Backup strategies']
      },
      {
        id: 'design-high-performing-architectures',
        title: 'Design High-Performing Architectures',
        description: 'Design solutions for performance and scalability',
        weight: 24,
        level: 'application',
        keyTopics: ['Compute optimization', 'Storage performance', 'Network optimization', 'Caching strategies'],
        examples: ['EC2 instance types', 'EBS vs instance store', 'CloudFront', 'ElastiCache']
      },
      {
        id: 'design-secure-applications-architectures',
        title: 'Design Secure Applications and Architectures',
        description: 'Implement security best practices',
        weight: 30,
        level: 'synthesis',
        keyTopics: ['IAM design', 'VPC security', 'Data encryption', 'Network security'],
        examples: ['Security groups vs NACLs', 'IAM roles vs users', 'KMS encryption', 'WAF implementation']
      },
      {
        id: 'design-cost-optimized-architectures',
        title: 'Design Cost-Optimized Architectures',
        description: 'Optimize costs while maintaining performance',
        weight: 20,
        level: 'synthesis',
        keyTopics: ['Right-sizing', 'Reserved instances', 'Storage classes', 'Data transfer optimization'],
        examples: ['S3 storage classes', 'EC2 pricing models', 'Data transfer costs', 'Cost allocation tags']
      }
    ],
    questionTypes: ['multiple_choice', 'multiple_response'],
    constraints: {
      totalQuestions: 65,
      timeMinutes: 130,
      optionCount: 4,
      passingScore: 720
    },
    context: {
      examFormat: '65 questions (multiple choice and multiple response), 130 minutes',
      difficulty: 'Associate level - requires 1+ years AWS experience',
      focus: 'Designing distributed systems on AWS',
      terminology: ['Well-Architected Framework', 'Availability Zones', 'Auto Scaling', 'Load balancing']
    }
  },

  'aws-developer': {
    id: 'aws-developer', 
    name: 'AWS Developer Associate',
    description: 'AWS Certified Developer Associate',
    provider: 'Amazon Web Services',
    objectives: [
      {
        id: 'development-aws-services',
        title: 'Development with AWS Services',
        description: 'Build applications using AWS services and APIs',
        weight: 32,
        level: 'application',
        keyTopics: ['AWS SDKs', 'Lambda functions', 'API Gateway', 'DynamoDB'],
        examples: ['SDK error handling', 'Lambda deployment', 'REST API design', 'NoSQL data modeling']
      },
      {
        id: 'security',
        title: 'Security',
        description: 'Implement authentication and encryption',
        weight: 26,
        level: 'application',
        keyTopics: ['IAM for applications', 'Cognito', 'KMS encryption', 'Secrets Manager'],
        examples: ['JWT tokens', 'User pools', 'Encryption at rest/transit', 'API authentication']
      },
      {
        id: 'deployment',
        title: 'Deployment',
        description: 'Deploy and test applications on AWS',
        weight: 24,
        level: 'application',
        keyTopics: ['CodeCommit', 'CodeBuild', 'CodeDeploy', 'CodePipeline'],
        examples: ['CI/CD pipelines', 'Blue/green deployments', 'Infrastructure as Code', 'Testing strategies']
      },
      {
        id: 'troubleshooting-optimization',
        title: 'Troubleshooting and Optimization',
        description: 'Debug and optimize AWS applications',
        weight: 18,
        level: 'synthesis',
        keyTopics: ['CloudWatch', 'X-Ray tracing', 'Performance optimization', 'Cost optimization'],
        examples: ['Log analysis', 'Distributed tracing', 'Lambda optimization', 'DynamoDB performance']
      }
    ],
    questionTypes: ['multiple_choice', 'multiple_response'],
    constraints: {
      totalQuestions: 65,
      timeMinutes: 130,
      optionCount: 4,
      passingScore: 720
    },
    context: {
      examFormat: '65 questions with code examples and debugging scenarios',
      difficulty: 'Associate level - development focus',
      focus: 'Building and deploying applications on AWS',
      terminology: ['Serverless', 'Microservices', 'Event-driven', 'API-first']
    }
  }
};

export const getExamProfile = (examId: string): ExamProfile | null => {
  return EXAM_PROFILES[examId] || null;
};

export const getExamObjective = (examId: string, objectiveId: string): ExamObjective | null => {
  const exam = getExamProfile(examId);
  return exam?.objectives.find(obj => obj.id === objectiveId) || null;
};

export const getAllExams = (): ExamProfile[] => {
  return Object.values(EXAM_PROFILES);
};
