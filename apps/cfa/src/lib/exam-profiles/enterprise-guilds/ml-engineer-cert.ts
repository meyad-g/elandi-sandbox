import { ExamProfile } from '../../certifications';

export const mlEngineerCert: ExamProfile = {
  id: 'ml-engineer-cert',
  name: 'Machine Learning Engineer Certificate',
  description: 'Professional certification profile for ML Engineers covering foundations, data engineering, algorithms, applied domains, MLOps, ethics, tools, math, systems, and professional practice.',
  provider: 'Elandi',
  objectives: [
    {
      id: 'mle-foundations',
      title: 'ML Foundations & Lifecycle',
      description: 'Learning types, lifecycle, CRISP-ML, risks, versioning',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Supervised/Unsupervised/RL',
        'Problem framing',
        'CRISP-ML',
        'Risks',
        'Versioning'
      ]
    },
    {
      id: 'mle-dataeng',
      title: 'Data Engineering for ML',
      description: 'Prep, features, governance, streaming, pipelines',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Feature eng.',
        'Lineage',
        'ETL/Orchestration',
        'Streaming',
        'Cloud data'
      ]
    },
    {
      id: 'mle-algos',
      title: 'Algorithms, Models & Eval',
      description: 'Classical ML, DL, metrics, regularization, XAI',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Regression/Trees',
        'CNN/RNN/Transformer',
        'ROC/PR',
        'Regularization',
        'XAI'
      ]
    },
    {
      id: 'mle-applied',
      title: 'Applied ML Domains',
      description: 'NLP/LLMs, CV, time series, RL, generative AI',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Tokenization',
        'CNNs',
        'ARIMA',
        'Policy Gradients',
        'Diffusion'
      ]
    },
    {
      id: 'mle-mlops',
      title: 'MLOps & Deployment',
      description: 'Serving, CI/CD, monitoring/drift, retraining, edge/cloud',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Model registry',
        'Containers',
        'Drift',
        'Pipelines',
        'Edge/Cloud'
      ]
    },
    {
      id: 'mle-ethics',
      title: 'Ethics, Governance & Security',
      description: 'Fairness, bias, privacy, responsible AI, frameworks',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Fairness',
        'Bias mitigation',
        'GDPR/AI Act',
        'Sustainability',
        'ISO/IEEE'
      ]
    },
    {
      id: 'mle-tools',
      title: 'Programming, Tools & Frameworks',
      description: 'Python libs, experiment mgmt, APIs, cloud ML, SD best practices',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'NumPy/Pandas',
        'PyTorch/TF',
        'MLflow/W&B',
        'Vertex/SageMaker',
        'CI/CD'
      ]
    },
    {
      id: 'mle-math',
      title: 'Math & Stats Foundations',
      description: 'Probability, linear algebra, optimization, sampling, uncertainty',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Hypothesis tests',
        'Matrix calculus',
        'GD',
        'Bias/Variance',
        'Intervals'
      ]
    },
    {
      id: 'mle-systems',
      title: 'Systems Engineering & Infra',
      description: 'System design, distributed training, accelerators, orchestration, reliability',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'GPUs/TPUs',
        'Kubernetes/Ray',
        'Sharding',
        'Caching',
        'Fault tolerance'
      ]
    },
    {
      id: 'mle-practice',
      title: 'Professional Practice & Collaboration',
      description: 'Comms, cross-functional, docs, agile ML, continuous learning',
      weight: 10,
      level: 'knowledge',
      difficulty: 'intermediate',
      questionsPerSession: 8,
      keyTopics: [
        'Stakeholders',
        'Explainability',
        'Reports',
        'Scrum',
        'Ethics'
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
    examFormat: '100 multiple-choice questions covering machine learning engineering practices',
    difficulty: 'Intermediate - professional ML engineering knowledge',
    focus: 'End-to-end machine learning engineering and MLOps',
    calculatorAllowed: true,
    terminology: [
      'ML Foundations & Lifecycle',
      'Data Engineering for ML',
      'Algorithms, Models & Eval',
      'Applied ML Domains',
      'MLOps & Deployment',
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
