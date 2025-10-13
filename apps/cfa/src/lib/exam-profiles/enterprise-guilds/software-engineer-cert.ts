import { ExamProfile } from '../../certifications';

export const softwareEngineerCert: ExamProfile = {
  id: 'software-engineer-cert',
  name: 'Software Engineer Certificate',
  description: 'Professional certification profile for Software Engineers covering SDLC, requirements, architecture, languages, DSA, databases, testing, DevOps, security, and professional practice.',
  provider: 'Elandi',
  objectives: [
    {
      id: 'swe-sdlc',
      title: 'SDLC & Methodologies',
      description: 'Stages, Agile vs Waterfall, roles, docs, governance',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Requirements',
        'Design',
        'Build/Test',
        'Deploy/Operate',
        'Audits'
      ]
    },
    {
      id: 'swe-req',
      title: 'Requirements & Analysis',
      description: 'Elicitation, NFRs, backlog, modeling, communication',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'User stories',
        'Use cases',
        'UML',
        'Prioritization',
        'Acceptance criteria'
      ]
    },
    {
      id: 'swe-arch',
      title: 'Software Design & Architecture',
      description: 'Principles, styles, APIs, scalability, documentation',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'SOLID',
        'Microservices',
        'REST/GraphQL',
        'C4',
        'ADRs'
      ]
    },
    {
      id: 'swe-lang',
      title: 'Languages & Paradigms',
      description: 'OOP, FP, async/concurrency, event-driven, refactoring',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'OOP',
        'FP',
        'Async/await',
        'Reactive',
        'Refactoring'
      ]
    },
    {
      id: 'swe-dsa',
      title: 'Data Structures & Algorithms',
      description: 'DSA, complexity, concurrency issues',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Trees/Graphs',
        'Sorting/Searching',
        'Big-O',
        'Locks',
        'Races'
      ]
    },
    {
      id: 'swe-db',
      title: 'Databases & Data',
      description: 'Relational, NoSQL, modeling, performance, privacy',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'SQL',
        'NoSQL',
        'Indexing',
        'Transactions',
        'GDPR'
      ]
    },
    {
      id: 'swe-qa',
      title: 'Testing & QA',
      description: 'Unit/integration/UAT, automation, non-functional, reviews',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'TDD',
        'CI tests',
        'Performance',
        'Security',
        'Static analysis'
      ]
    },
    {
      id: 'swe-devops',
      title: 'DevOps & Deployment',
      description: 'VCS, CI/CD, containers, orchestration, observability',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Git',
        'CI/CD',
        'Docker',
        'Kubernetes',
        'Monitoring'
      ]
    },
    {
      id: 'swe-sec',
      title: 'Security & Compliance',
      description: 'Secure coding, authN/Z, threats, compliance',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'OWASP',
        'OAuth/OIDC',
        'Threat modeling',
        'Privacy',
        'Secure SDLC'
      ]
    },
    {
      id: 'swe-pro',
      title: 'Professional Practice',
      description: 'Collaboration, planning, ethics, sustainability, career',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Comms',
        'Planning',
        'Accessibility',
        'Ethics',
        'Growth'
      ]
    }
  ],
  questionTypes: ['multiple_choice'],
  constraints: {
    totalQuestions: 80,
    timeMinutes: 120,
    optionCount: 4,
    passingScore: 70
  },
  context: {
    examFormat: '80 multiple-choice questions covering software engineering best practices',
    difficulty: 'Intermediate - professional software engineering knowledge',
    focus: 'Comprehensive software engineering practices and methodologies',
    calculatorAllowed: false,
    terminology: [
      'SDLC & Methodologies',
      'Requirements & Analysis',
      'Software Design & Architecture',
      'Languages & Paradigms',
      'Data Structures & Algorithms',
      'Best practices',
      'Standards & governance'
    ]
  },
  studySettings: {
    defaultQuestionsPerObjective: 10,
    masteryThreshold: 80,
    spaceRepetition: true,
    adaptiveDifficulty: true
  }
};
