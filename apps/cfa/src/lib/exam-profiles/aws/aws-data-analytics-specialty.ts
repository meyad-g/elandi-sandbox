import { ExamProfile } from '../../certifications';

export const awsDataAnalyticsSpecialty: ExamProfile = {
  id: 'aws-data-analytics-specialty',
  name: 'AWS Data Analytics – Specialty',
  description: 'AWS Certified Data Analytics – Specialty',
  provider: 'Amazon Web Services',
  objectives: [
    {
      id: 'collection',
      title: 'Collection',
      description: 'Determine operational characteristics of collection systems',
      weight: 18,
      level: 'application',
      keyTopics: ['Kinesis Data Streams', 'Kinesis Data Firehose', 'AWS Glue', 'Amazon MSK', 'Data ingestion patterns'],
      examples: ['Stream vs batch ingestion', 'Kinesis sharding strategies', 'Glue crawlers and ETL jobs', 'Kafka integration', 'IoT data collection']
    },
    {
      id: 'storage-data-management',
      title: 'Storage and Data Management',
      description: 'Determine operational characteristics of storage systems',
      weight: 22,
      level: 'application',
      keyTopics: ['Amazon S3', 'Data Lake architecture', 'Amazon Redshift', 'Lake Formation', 'Data partitioning'],
      examples: ['S3 storage classes for analytics', 'Data lake vs data warehouse', 'Redshift architecture', 'Partitioning strategies', 'Data catalog management']
    },
    {
      id: 'processing',
      title: 'Processing',
      description: 'Determine operational characteristics of processing systems',
      weight: 24,
      level: 'synthesis',
      keyTopics: ['AWS Glue', 'Amazon EMR', 'AWS Lambda', 'Kinesis Analytics', 'Batch vs stream processing'],
      examples: ['Glue ETL job optimization', 'EMR cluster sizing', 'Serverless processing', 'Real-time analytics', 'Apache Spark on AWS']
    },
    {
      id: 'analysis-visualization',
      title: 'Analysis and Visualization',
      description: 'Determine operational characteristics of analysis and visualization systems',
      weight: 18,
      level: 'application',
      keyTopics: ['Amazon Athena', 'Amazon QuickSight', 'Amazon Elasticsearch', 'Machine Learning integration', 'Query optimization'],
      examples: ['Athena query optimization', 'QuickSight dashboard design', 'Elasticsearch for log analytics', 'SageMaker integration', 'Performance tuning']
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Apply data security and governance best practices',
      weight: 18,
      level: 'synthesis',
      keyTopics: ['Data encryption', 'IAM for analytics', 'VPC security', 'Data governance', 'Compliance'],
      examples: ['Encryption at rest/transit', 'Fine-grained access control', 'Network isolation', 'Data lineage', 'GDPR compliance']
    }
  ],
  questionTypes: ['multiple_choice', 'multiple_response'],
  constraints: {
    totalQuestions: 65,
    timeMinutes: 180,
    optionCount: 4,
    passingScore: 750
  },
  context: {
    examFormat: '65 questions (multiple choice and multiple response), 180 minutes',
    difficulty: 'Specialty level - requires 5+ years data analytics experience',
    focus: 'Design and implement AWS data analytics solutions',
    terminology: ['Data Lake', 'ETL/ELT', 'Stream processing', 'Data warehousing', 'Analytics pipeline']
  }
};
