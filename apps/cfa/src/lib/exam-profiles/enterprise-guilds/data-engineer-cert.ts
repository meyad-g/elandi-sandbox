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
      description: 'Modeling, warehousing, lineage, governance, sustainability',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'OLTP vs OLAP',
        'Star/Snowflake',
        'Data lineage',
        'GDPR/Compliance',
        'ESG-by-design'
      ]
    },
    {
      id: 'de-ingestion',
      title: 'Data Ingestion & Integration',
      description: 'ETL/ELT, batch vs streaming, connectors, orchestration',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Airflow',
        'Kafka',
        'dbt',
        'APIs',
        'CDC'
      ]
    },
    {
      id: 'de-databases',
      title: 'Databases & Storage',
      description: 'SQL/NoSQL, distributed storage, tuning, HA/DR',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'PostgreSQL',
        'Cassandra',
        'S3/HDFS',
        'Indexing',
        'Replication'
      ]
    },
    {
      id: 'de-cloud',
      title: 'Cloud & Infrastructure',
      description: 'Cloud platforms, containers, IaC, CI/CD, cost mgmt',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'AWS/GCP/Azure',
        'Kubernetes',
        'Terraform',
        'DataOps',
        'FinOps'
      ]
    },
    {
      id: 'de-programming',
      title: 'Programming & Automation',
      description: 'Python, SQL, scripting, testing, observability',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'PySpark',
        'Pandas',
        'SQL',
        'pytest',
        'Logging/Tracing'
      ]
    },
    {
      id: 'de-governance',
      title: 'Governance, Security & Ethics',
      description: 'Policies, security, privacy, ethical sourcing, incidents',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'RBAC',
        'Encryption',
        'PII masking',
        'DPIA',
        'Runbooks'
      ]
    },
    {
      id: 'de-analytics',
      title: 'Analytics Enablement',
      description: 'Serving analysts/DS, reusable assets, analytics patterns',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Data contracts',
        'APIs',
        'Semantic layers',
        'KPIs',
        'SLAs'
      ]
    },
    {
      id: 'de-monitoring',
      title: 'Monitoring & Optimization',
      description: 'DQ SLAs, RCA, perf/cost optimization, resilience',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Great Expectations',
        'SLOs',
        'RCA',
        'Autoscaling',
        'Retries'
      ]
    },
    {
      id: 'de-emerging',
      title: 'Emerging Tech & Trends',
      description: 'Streaming, real-time, MLOps, data mesh',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Flink',
        'Kinesis',
        'Feature stores',
        'Mesh',
        'Iceberg/Delta'
      ]
    },
    {
      id: 'de-practice',
      title: 'Professional Practice',
      description: 'Agile/DevOps, stakeholders, documentation, sustainability',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Scrum',
        'Stakeholders',
        'ADR',
        'Green Ops',
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
