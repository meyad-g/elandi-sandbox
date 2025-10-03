// Certification exam prompt library with level-specific contexts

import { ExamProfile, ExamObjective } from './certifications';

export interface QuestionPromptConfig {
  examProfile: ExamProfile;
  objective: ExamObjective;
  questionType: 'multiple_choice' | 'multiple_response' | 'vignette' | 'essay';
  context?: string;
}

export interface FlashcardPromptConfig {
  examProfile: ExamProfile;
  objective: ExamObjective;
  focusArea?: string;
}

// Get level-specific context for better question generation
function getLevelSpecificContext(examId: string, objective: ExamObjective): string {
  const contexts: Record<string, Record<string, string>> = {
    'cfa-l1': {
      'ethical-professional-standards': `
Context for CFA Level I Ethics:
- Focus on the 7 Standards of Professional Conduct
- Scenario-based questions with ethical dilemmas  
- Common situations: conflicts of interest, material nonpublic information, fair dealing
- Test application of ethical principles to real-world situations
- No calculations required - focus on principles and professional judgment
- Key areas: Standard I (Professionalism), Standard II (Integrity of Capital Markets), Standard III (Duties to Clients)`,

      'quantitative-methods': `
Context for CFA Level I Quantitative Methods:
- Heavy emphasis on Time Value of Money calculations
- Basic statistics: mean, variance, standard deviation, correlation
- Probability distributions: normal, binomial, uniform
- Hypothesis testing fundamentals with t-tests and z-tests
- Financial calculator usage (HP 12C or TI BA II Plus required)
- Key formulas: PV = FV/(1+r)^n, PMT calculations, descriptive statistics
- Focus on practical application to investment scenarios`,

      'financial-statement-analysis': `
Context for CFA Level I Financial Statement Analysis:
- Emphasis on understanding financial statement relationships
- Key ratios: ROE, ROA, current ratio, quick ratio, debt-to-equity
- Cash flow analysis: operating, investing, financing activities
- Working capital analysis and liquidity assessment
- Basic financial statement preparation and analysis
- Connection between balance sheet, income statement, and cash flow statement`,

      'default': `
Context for CFA Level I:
- Foundation level knowledge testing with emphasis on memorization
- 180 multiple-choice questions with 3 options (A, B, C)
- 4.5 hours total exam time (2 sessions of 2.25 hours each)
- Calculator permitted (HP 12C or TI BA II Plus)
- Focus on core investment analysis tools and ethical behavior
- Passing score: minimum competence in all topic areas`
    },

    'cfa-l2': {
      'default': `
Context for CFA Level II:
- Item set format: vignettes (case studies) followed by 4-6 questions each
- 88 questions total over 4.5 hours
- Advanced analysis and application of investment tools
- Focus on asset valuation, portfolio management, and analysis
- Requires deeper analytical thinking and complex problem solving
- Integration of multiple concepts within each vignette`
    },

    'aws-cloud-practitioner': {
      'cloud-concepts': `
Context for AWS Cloud Practitioner - Cloud Concepts:
- Basic cloud computing principles and benefits
- AWS value proposition: cost savings, scalability, agility
- Cloud deployment models: public, private, hybrid
- Service models: IaaS, PaaS, SaaS with AWS examples
- AWS Well-Architected Framework pillars
- Focus on business benefits rather than technical implementation`,

      'security-compliance': `
Context for AWS Cloud Practitioner - Security:
- Shared Responsibility Model: AWS secures "of" the cloud, customer secures "in" the cloud
- Basic security services: IAM, Security Groups, NACLs
- Compliance programs: SOC, PCI DSS, HIPAA
- Data protection: encryption at rest and in transit
- Focus on conceptual understanding, not hands-on configuration`,

      'technology': `
Context for AWS Cloud Practitioner - Technology:
- Core AWS services overview: compute, storage, database, networking
- Global infrastructure: Regions, Availability Zones, Edge Locations
- Service categories and use cases
- Basic understanding of when to use each service
- No hands-on experience required - conceptual knowledge only`,

      'billing-pricing': `
Context for AWS Cloud Practitioner - Billing:
- AWS pricing models: pay-as-you-go, reserved instances, spot instances
- Cost management tools: AWS Cost Explorer, AWS Budgets, Cost and Usage Reports
- Support plans: Basic, Developer, Business, Enterprise
- AWS Free Tier: what's included and limitations
- Total Cost of Ownership (TCO) considerations`,

      'default': `
Context for AWS Cloud Practitioner:
- Entry-level certification for non-technical roles
- 65 multiple-choice questions, 90 minutes, 4 answer choices
- Focus on business value and basic cloud understanding
- No hands-on AWS experience required
- Emphasis on AWS service overview and cost benefits`
    },

    'aws-saa': {
      'design-resilient-architectures': `
Context for AWS Solutions Architect - Resilient Architectures:
- Multi-AZ deployments for high availability
- Auto Scaling groups and policies
- Elastic Load Balancing (ALB, NLB, GLB)
- Disaster recovery strategies: backup, pilot light, warm standby, multi-site
- Storage solutions: S3, EBS, EFS with appropriate durability/availability
- Fault tolerance and recovery mechanisms`,

      'design-secure-applications-architectures': `
Context for AWS Solutions Architect - Security:
- IAM best practices: least privilege, roles vs users, policies
- VPC design: public/private subnets, route tables, NAT gateways
- Security groups vs Network ACLs configuration
- Data encryption: KMS, CloudHSM, SSL/TLS
- Network security: WAF, Shield, VPN, Direct Connect
- Monitoring and auditing: CloudTrail, Config, GuardDuty`,

      'design-high-performing-architectures': `
Context for AWS Solutions Architect - Performance:
- Compute optimization: right-sizing instances, placement groups
- Storage performance: EBS types, S3 performance, EFS performance modes
- Network optimization: Enhanced networking, placement groups, CDN
- Caching strategies: CloudFront, ElastiCache (Redis/Memcached)
- Database performance: read replicas, connection pooling, indexing`,

      'design-cost-optimized-architectures': `
Context for AWS Solutions Architect - Cost Optimization:
- Instance purchasing options: On-Demand, Reserved, Spot, Savings Plans
- Storage cost optimization: S3 storage classes, lifecycle policies
- Data transfer cost optimization: CloudFront, Direct Connect
- Right-sizing recommendations and cost monitoring
- Serverless vs server-based cost considerations`,

      'default': `
Context for AWS Solutions Architect Associate:
- Associate level requiring 1+ years hands-on AWS experience
- 65 questions with multiple choice and multiple response formats
- Scenario-based questions requiring architectural decisions
- Focus on designing distributed systems on AWS platform
- Emphasis on Well-Architected Framework principles`
    },

    'aws-developer': {
      'development-aws-services': `
Context for AWS Developer - Development:
- AWS SDKs and APIs: error handling, retry logic, exponential backoff
- Lambda functions: deployment, configuration, monitoring
- API Gateway: REST vs HTTP APIs, authentication, throttling
- DynamoDB: data modeling, queries, transactions, performance
- SQS/SNS: messaging patterns, dead letter queues, fan-out
- Code examples and debugging scenarios expected`,

      'security': `
Context for AWS Developer - Security:
- Application-level security implementation
- Cognito User Pools and Identity Pools
- IAM roles for applications and cross-account access
- Secrets Manager and Parameter Store for configuration
- KMS for application-level encryption
- Security best practices in application code`,

      'deployment': `
Context for AWS Developer - Deployment:
- AWS CodeCommit, CodeBuild, CodeDeploy, CodePipeline
- Infrastructure as Code: CloudFormation, SAM
- Containerization: ECS, Fargate, ECR
- Blue/green and rolling deployments
- Testing strategies: unit, integration, end-to-end
- Environment management and configuration`,

      'troubleshooting-optimization': `
Context for AWS Developer - Troubleshooting:
- CloudWatch Logs, Metrics, and Alarms
- AWS X-Ray for distributed tracing
- Application performance monitoring and optimization
- Lambda cold starts and performance tuning
- DynamoDB throttling and optimization
- Cost optimization for serverless applications`,

      'default': `
Context for AWS Developer Associate:
- Development-focused certification with code examples
- Serverless architectures and microservices patterns
- Event-driven architectures and asynchronous processing
- Focus on building, deploying, and maintaining applications on AWS
- Emphasis on best practices and troubleshooting`
    }
  };

  const examContexts = contexts[examId] || {};
  return examContexts[objective.id] || examContexts['default'] || '';
}

// Generate prompts for different question types
export function buildMultipleChoicePrompt(config: QuestionPromptConfig): string {
  const { examProfile, objective } = config;
  const context = getLevelSpecificContext(examProfile.id, objective);
  const optionLabels = examProfile.constraints.optionCount === 3 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];

  return `You are an expert certification exam question writer for ${examProfile.name}.

Generate 1 multiple-choice question for this learning objective:

EXAM: ${examProfile.name} (${examProfile.provider})
OBJECTIVE: ${objective.title}
DESCRIPTION: ${objective.description}
WEIGHT: ${objective.weight}% of total exam
DIFFICULTY LEVEL: ${objective.level}

${context}

EXAM FORMAT REQUIREMENTS:
- Use exactly ${examProfile.constraints.optionCount} answer choices (${optionLabels.join(', ')})
- ${examProfile.context.examFormat}
- ${examProfile.context.difficulty}
- ${examProfile.context.focus}

QUESTION REQUIREMENTS:
- Create a challenging question testing ${objective.level}-level understanding
- Use realistic scenarios typical for ${examProfile.name} candidates
- Ensure only ONE clearly correct answer
- Make wrong answers plausible but clearly incorrect to experts
- Use appropriate ${examProfile.provider} terminology and concepts
- Focus on practical application and real-world situations

QUALITY STANDARDS:
- Question should reflect actual exam difficulty and style
- Explanation must reference specific ${examProfile.name} concepts
- Use professional language appropriate for certification level
- Avoid ambiguous wording or "trick" questions

Return ONLY this XML format:
<thinking>Brief explanation of your approach to creating this ${examProfile.name} question</thinking>
<question>Clear, specific question stem for ${examProfile.name} certification</question>
<option correct="false">${optionLabels[0]}) First option text</option>
<option correct="true">${optionLabels[1]}) Correct option text</option>
<option correct="false">${optionLabels[2]}) Third option text</option>${examProfile.constraints.optionCount === 4 ? '\n<option correct="false">D) Fourth option text</option>' : ''}
<explanation>Detailed explanation why the correct answer is right and others are wrong, with specific reference to ${examProfile.name} concepts and learning objective</explanation>`;
}

export function buildMultipleResponsePrompt(config: QuestionPromptConfig): string {
  const { examProfile, objective } = config;
  const context = getLevelSpecificContext(examProfile.id, objective);

  return `You are an expert certification exam question writer for ${examProfile.name}.

Generate 1 multiple-response question for this learning objective:

EXAM: ${examProfile.name} (${examProfile.provider})
OBJECTIVE: ${objective.title}
DESCRIPTION: ${objective.description}
WEIGHT: ${objective.weight}% of total exam
DIFFICULTY LEVEL: ${objective.level}

${context}

EXAM FORMAT REQUIREMENTS:
- Use 4-5 answer choices with 2-3 correct answers
- Clearly state "Choose TWO" or "Choose THREE" in the question
- ${examProfile.context.examFormat}

QUESTION REQUIREMENTS:
- Test comprehensive understanding typical for ${objective.level} level
- Create realistic scenarios where multiple solutions/concepts apply
- Ensure correct answers are clearly defensible
- Make incorrect options plausible but clearly wrong to experts
- Use appropriate ${examProfile.provider} terminology

Return ONLY this XML format:
<thinking>Brief explanation of your approach to creating this ${examProfile.name} multiple-response question</thinking>
<question>Question stem (Choose TWO)?</question>
<option correct="true">A) First correct option</option>
<option correct="false">B) Incorrect option</option>
<option correct="true">C) Second correct option</option>
<option correct="false">D) Another incorrect option</option>
<explanation>Explanation of why the correct answers are right and incorrect options are wrong</explanation>`;
}

export function buildVignettePrompt(config: QuestionPromptConfig): string {
  const { examProfile, objective } = config;
  const context = getLevelSpecificContext(examProfile.id, objective);

  return `You are an expert certification exam question writer for ${examProfile.name}.

Generate 1 vignette (case study) with 3 follow-up questions for this learning objective:

EXAM: ${examProfile.name} (${examProfile.provider})
OBJECTIVE: ${objective.title}
DESCRIPTION: ${objective.description}
WEIGHT: ${objective.weight}% of total exam
DIFFICULTY LEVEL: ${objective.level}

${context}

VIGNETTE REQUIREMENTS:
- Create realistic business scenario (200-400 words) typical for ${examProfile.name}
- Include specific data, calculations, or technical details as appropriate
- Provide enough context to answer all 3 follow-up questions
- Use professional language and industry-standard terminology
- Make scenario relevant to ${objective.title}

QUESTION REQUIREMENTS:
- Generate 3 multiple-choice questions building on the vignette
- Test analysis, application, and evaluation of the scenario
- Each question should have ${examProfile.constraints.optionCount} options
- Questions should progress from basic analysis to synthesis
- Use ${examProfile.provider} specific terminology and concepts

Return ONLY this JSON format:
{
  "vignette": "Detailed business scenario with specific context and data relevant to ${examProfile.name}...",
  "questions": [
    {
      "question": "Question 1 testing scenario analysis?",
      "options": ["A) Option", "B) Option", "C) Option"],
      "correct": 0,
      "explanation": "Explanation referencing vignette data and ${examProfile.name} concepts"
    },
    {
      "question": "Question 2 testing application?",
      "options": ["A) Option", "B) Option", "C) Option"],
      "correct": 1,
      "explanation": "Explanation referencing vignette data and ${examProfile.name} concepts"
    },
    {
      "question": "Question 3 testing synthesis?",
      "options": ["A) Option", "B) Option", "C) Option"],
      "correct": 2,
      "explanation": "Explanation referencing vignette data and ${examProfile.name} concepts"
    }
  ]
}`;
}

export function buildFlashcardPrompt(config: FlashcardPromptConfig): string {
  const { examProfile, objective } = config;
  const context = getLevelSpecificContext(examProfile.id, objective);

  return `You are an expert study material creator for ${examProfile.name}.

Generate 1 study flashcard for this learning objective:

EXAM: ${examProfile.name} (${examProfile.provider})
OBJECTIVE: ${objective.title}
DESCRIPTION: ${objective.description}
WEIGHT: ${objective.weight}% of total exam
DIFFICULTY LEVEL: ${objective.level}

${context}

FLASHCARD REQUIREMENTS:
- Front: Key concept, formula, or question appropriate for memorization
- Back: Clear, concise explanation with specific details
- Include relevant formulas, frameworks, or methodologies
- Use ${examProfile.provider} standard terminology
- Focus on high-yield concepts likely to appear on actual exam
- Make content appropriate for ${objective.level} level understanding

CONTENT GUIDELINES:
- Front should be a clear question or concept name
- Back should provide actionable knowledge for exam success
- Include specific examples relevant to ${examProfile.name}
- Add memory aids or mnemonics when helpful
- Focus on concepts with ${objective.weight}% exam weight

Return ONLY this JSON format:
{
  "front": "Key concept, question, or formula for front of flashcard",
  "back": "Detailed explanation with ${examProfile.name} context, examples, and specific details",
  "tags": ["${examProfile.name}", "${objective.level}", "additional-tag"]
}`;
}

// Get prompt based on question type
export function getQuestionPrompt(config: QuestionPromptConfig): string {
  switch (config.questionType) {
    case 'multiple_choice':
      return buildMultipleChoicePrompt(config);
    case 'multiple_response':
      return buildMultipleResponsePrompt(config);
    case 'vignette':
      return buildVignettePrompt(config);
    default:
      return buildMultipleChoicePrompt(config);
  }
}

// Example usage contexts for different scenarios
export const PROMPT_EXAMPLES = {
  'cfa-l1-ethics': `Example CFA Level I Ethics Question:
"An investment manager receives material nonpublic information about a potential merger from a client who is an executive at the target company. According to CFA Institute Standards of Professional Conduct, the manager should:
A) Use the information to benefit all clients equally
B) Not act on the information and maintain confidentiality  
C) Share the information with other analysts for verification"`,

  'aws-saa-security': `Example AWS Solutions Architect Security Question:
"A company needs to ensure that their web application running on EC2 instances in private subnets can securely access the internet for software updates while preventing inbound internet access. Which combination of services should be implemented? (Choose TWO)
A) Internet Gateway in public subnet
B) NAT Gateway in public subnet
C) Security groups allowing outbound HTTPS
D) Network ACL denying all inbound traffic
E) VPC Endpoint for S3"`
};
