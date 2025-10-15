import { ExamProfile } from '../../certifications';

export const dataEngineerCert: ExamProfile = {
  id: 'data-engineer-cert',
  name: 'Data Engineer Certificate',
  description: 'Professional certification profile for Data Engineers covering architecture, ingestion, storage, cloud, programming, governance, analytics enablement, monitoring, emerging tech, and professional practice.',
  provider: 'Elandi',
  objectives: [
    {
      id: 'de-arch-model',
      title: 'Data Architecture & Modeling',
      description: 'Data modeling fundamentals, warehousing concepts, metadata and lineage management, governance and compliance, sustainable data architectures',
      weight: 11,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 10,
      keyTopics: [
        'Data modeling fundamentals',
        'Data warehousing concepts', 
        'Metadata and data lineage management',
        'Data governance & regulatory compliance',
        'Sustainable data architectures'
      ]
    },
    {
      id: 'de-ingestion',
      title: 'Data Ingestion & Integration',
      description: 'ETL and ELT design, batch vs streaming pipelines, API/connector-based integrations, data quality management, automation frameworks',
      weight: 11,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 10,
      keyTopics: [
        'ETL and ELT design',
        'Batch vs streaming pipelines',
        'API/connector-based integrations',
        'Data quality management',
        'Automation frameworks'
      ]
    },
    {
      id: 'de-databases',
      title: 'Databases & Storage Systems',
      description: 'Relational databases, NoSQL systems, distributed storage, query optimization, backup and recovery',
      weight: 10,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 10,
      keyTopics: [
        'Relational databases',
        'NoSQL systems',
        'Distributed storage',
        'Query optimization',
        'Backup and recovery'
      ]
    },
    {
      id: 'de-cloud',
      title: 'Cloud & Infrastructure',
      description: 'Cloud platforms for data, containerization and orchestration, Infrastructure as Code, DataOps and CI/CD, cost optimization and sustainability',
      weight: 11,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 9,
      keyTopics: [
        'Cloud platforms for data',
        'Containerization and orchestration',
        'Infrastructure as Code',
        'DataOps and CI/CD',
        'Cost optimization and sustainability'
      ]
    },
    {
      id: 'de-programming',
      title: 'Programming & Automation',
      description: 'Python for data engineering, SQL and query languages, shell scripting and automation, software development best practices, debugging and monitoring',
      weight: 11,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 9,
      keyTopics: [
        'Python for data engineering',
        'SQL and query languages',
        'Shell scripting and automation',
        'Software development best practices',
        'Debugging and monitoring'
      ]
    },
    {
      id: 'de-governance',
      title: 'Data Governance, Security & Ethics',
      description: 'Governance frameworks and policies, security and encryption, privacy and compliance, ethical data sourcing, incident management',
      weight: 11,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 10,
      keyTopics: [
        'Governance frameworks and policies',
        'Security and encryption',
        'Privacy and compliance',
        'Ethical data sourcing',
        'Incident management'
      ]
    },
    {
      id: 'de-analytics',
      title: 'Analytics Enablement & Collaboration',
      description: 'Supporting data scientists and analysts, reusable data assets and APIs, analytics fundamentals, communication and collaboration, continuous improvement',
      weight: 10,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Supporting data scientists and analysts',
        'Reusable data assets and APIs',
        'Analytics fundamentals',
        'Communication and collaboration',
        'Continuous improvement'
      ]
    },
    {
      id: 'de-monitoring',
      title: 'Monitoring, Optimization & Maintenance',
      description: 'Monitoring data quality, troubleshooting pipelines, optimizing data flows, incident response, continuous improvement',
      weight: 10,
      level: 'synthesis',
      difficulty: 'advanced',
      questionsPerSession: 8,
      keyTopics: [
        'Monitoring data quality',
        'Troubleshooting pipelines',
        'Optimizing data flows',
        'Incident response',
        'Continuous improvement'
      ]
    },
    {
      id: 'de-emerging',
      title: 'Emerging Technologies & Trends',
      description: 'Streaming architectures, real-time analytics, ML pipelines and MLOps, Data Mesh concepts, professional upskilling',
      weight: 10,
      level: 'knowledge',
      difficulty: 'advanced',
      questionsPerSession: 8,
      keyTopics: [
        'Streaming architectures',
        'Real-time analytics',
        'ML pipelines and MLOps',
        'Data Mesh concepts',
        'Professional upskilling'
      ]
    },
    {
      id: 'de-practice',
      title: 'Professional Practice',
      description: 'Agile and DevOps in data projects, stakeholder management, documentation and reproducibility, sustainability practices, lifelong learning',
      weight: 10,
      level: 'application',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Agile and DevOps in data projects',
        'Stakeholder management',
        'Documentation and reproducibility',
        'Sustainability practices',
        'Lifelong learning'
      ]
    }
  ],
  questionTypes: ['multiple_choice'],
  constraints: {
    totalQuestions: 100,
    timeMinutes: 150,
    optionCount: 4,
    passingScore: 70
  },
  context: {
    examFormat: '100 multiple-choice questions covering data engineering practices',
    difficulty: 'Intermediate - professional data engineering knowledge',
    focus: 'End-to-end data engineering and analytics enablement',
    calculatorAllowed: false,
    terminology: [
      'Data Architecture & Modeling',
      'Data Ingestion & Integration',
      'Databases & Storage',
      'Cloud & Infrastructure',
      'Programming & Automation',
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
