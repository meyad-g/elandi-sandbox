import { ExamProfile } from '../../certifications';

export const awsSaa: ExamProfile = {
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
};
