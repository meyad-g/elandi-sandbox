import { ExamProfile } from '../../certifications';

export const awsDeveloper: ExamProfile = {
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
};
