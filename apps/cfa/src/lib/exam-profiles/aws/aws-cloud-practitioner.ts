import { ExamProfile } from '../../certifications';

export const awsCloudPractitioner: ExamProfile = {
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
};
