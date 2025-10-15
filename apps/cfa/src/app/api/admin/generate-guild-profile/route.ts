import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExamProfile } from '@/lib/certifications';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function buildGuildProfilePrompt(inputData: string): string {
  const allContent = inputData;
  
  return `You are an expert certification designer and learning specialist. Analyze the provided content and create a comprehensive exam certification profile.

INPUT CONTENT:
${allContent}

TASK: Generate a complete ExamProfile object based on this content. Extract domain knowledge, identify key competencies, and structure them into learning objectives.

ANALYSIS GUIDELINES:
1. Identify the main domain/field (e.g., Data Engineering, Software Development, Product Management)
2. Extract key skills, technologies, frameworks, and competencies mentioned
3. Group related concepts into 6-12 learning objectives with logical flow
4. Assign appropriate weights based on importance and coverage in the content
5. Determine realistic difficulty levels and cognitive requirements
6. Create practical exam constraints suitable for professional certification

PROFILE STRUCTURE REQUIREMENTS:
- Use a clear, professional certification name (e.g., "Advanced Data Engineering Certificate")
- Set provider as "Enterprise Guild" 
- Create 6-12 comprehensive learning objectives
- Each objective should have 8-15% weight (total = 100%)
- Include 3-6 key topics per objective
- Set realistic exam constraints (80-150 questions, 90-180 minutes)
- Use appropriate difficulty levels (beginner/intermediate/advanced)
- Include meaningful study settings

OBJECTIVE QUALITY STANDARDS:
- Titles should be clear and professional (e.g., "Data Architecture & Modeling")
- Descriptions should be comprehensive yet concise
- Key topics should be specific and actionable
- Weights should reflect relative importance in the field
- Levels should match cognitive complexity (knowledge/application/synthesis)

GENERATE THIS EXACT JSON STRUCTURE:
{
  "id": "kebab-case-certification-id",
  "name": "Professional Certification Name",
  "description": "Comprehensive description of what this certification covers and validates",
  "provider": "Enterprise Guild",
  "objectives": [
    {
      "id": "objective-1-id",
      "title": "Objective Title",
      "description": "Detailed description of what this objective covers",
      "weight": 12,
      "level": "application",
      "difficulty": "intermediate", 
      "questionsPerSession": 10,
      "keyTopics": [
        "Specific Topic 1",
        "Specific Topic 2",
        "Specific Topic 3",
        "Specific Topic 4"
      ]
    }
  ],
  "questionTypes": ["multiple_choice"],
  "constraints": {
    "totalQuestions": 100,
    "timeMinutes": 150,
    "optionCount": 4,
    "passingScore": 70
  },
  "context": {
    "examFormat": "Descriptive exam format text",
    "difficulty": "Intermediate - professional domain knowledge",
    "focus": "End-to-end domain expertise and practical application",
    "calculatorAllowed": false,
    "terminology": [
      "Key Term 1",
      "Key Term 2", 
      "Key Term 3",
      "Key Term 4"
    ]
  },
  "studySettings": {
    "defaultQuestionsPerObjective": 10,
    "masteryThreshold": 80,
    "spaceRepetition": true,
    "adaptiveDifficulty": true
  }
}

CRITICAL: Return ONLY valid JSON. No explanation text before or after. The JSON must be parseable and complete.`;
}


export async function POST(request: NextRequest) {
  try {
    const { inputData } = await request.json();

    if (!inputData?.trim()) {
      return Response.json(
        { error: 'No input data provided' },
        { status: 400 }
      );
    }

    // Generate profile using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const prompt = buildGuildProfilePrompt(inputData);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    // Parse the JSON response
    let profile: ExamProfile;
    try {
      // Clean up the response in case there's extra text
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : generatedText;
      profile = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', generatedText);
      
      // Return a fallback profile
      profile = createFallbackProfile(inputData);
    }

    // Validate and clean up the profile
    profile = validateAndCleanProfile(profile);

    return Response.json(profile);
    
  } catch (error) {
    console.error('Error generating guild profile:', error);
    
    // Return a generic error response
    return Response.json(
      { 
        error: 'Failed to generate guild profile. Please check your input and try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function createFallbackProfile(inputData: string): ExamProfile {
  // Extract some basic info for fallback
  const words = inputData.toLowerCase().split(/\s+/);
  const hasDataTerms = words.some(w => ['data', 'database', 'sql', 'analytics'].includes(w));
  const hasDevTerms = words.some(w => ['development', 'programming', 'code', 'software'].includes(w));
  const hasCloudTerms = words.some(w => ['cloud', 'aws', 'azure', 'gcp'].includes(w));
  
  let domain = 'Technical';
  if (hasDataTerms) domain = 'Data Engineering';
  else if (hasDevTerms) domain = 'Software Development';
  else if (hasCloudTerms) domain = 'Cloud Engineering';

  return {
    id: `${domain.toLowerCase().replace(/\s+/g, '-')}-guild-cert`,
    name: `${domain} Guild Certificate`,
    description: `Professional certification covering essential ${domain.toLowerCase()} competencies and best practices.`,
    provider: 'Enterprise Guild',
    objectives: [
      {
        id: 'fundamentals',
        title: `${domain} Fundamentals`,
        description: 'Core concepts and foundational knowledge',
        weight: 20,
        level: 'knowledge',
        difficulty: 'beginner',
        questionsPerSession: 10,
        keyTopics: [
          'Basic principles and concepts',
          'Industry standards and practices',
          'Essential terminology',
          'Common frameworks and tools'
        ]
      },
      {
        id: 'practical-application',
        title: 'Practical Application',
        description: 'Hands-on skills and real-world implementation',
        weight: 25,
        level: 'application',
        difficulty: 'intermediate',
        questionsPerSession: 12,
        keyTopics: [
          'Implementation strategies',
          'Best practices and patterns',
          'Problem-solving approaches',
          'Tool utilization'
        ]
      },
      {
        id: 'advanced-concepts',
        title: 'Advanced Concepts',
        description: 'Complex topics and advanced techniques',
        weight: 20,
        level: 'synthesis',
        difficulty: 'advanced',
        questionsPerSession: 10,
        keyTopics: [
          'Advanced methodologies',
          'System integration',
          'Performance optimization',
          'Scalability considerations'
        ]
      },
      {
        id: 'professional-practice',
        title: 'Professional Practice',
        description: 'Industry standards and professional development',
        weight: 15,
        level: 'application',
        difficulty: 'intermediate',
        questionsPerSession: 8,
        keyTopics: [
          'Industry standards',
          'Professional ethics',
          'Collaboration and communication',
          'Continuous learning'
        ]
      },
      {
        id: 'project-management',
        title: 'Project Management',
        description: 'Planning, execution, and delivery of projects',
        weight: 20,
        level: 'application',
        difficulty: 'intermediate',
        questionsPerSession: 10,
        keyTopics: [
          'Project planning and execution',
          'Risk management',
          'Quality assurance',
          'Stakeholder management'
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
      examFormat: `100 multiple-choice questions covering ${domain.toLowerCase()} practices`,
      difficulty: 'Intermediate - professional domain knowledge',
      focus: `End-to-end ${domain.toLowerCase()} expertise and practical application`,
      calculatorAllowed: false,
      terminology: [
        'Domain-specific terminology',
        'Industry standards',
        'Best practices',
        'Common frameworks'
      ]
    },
    studySettings: {
      defaultQuestionsPerObjective: 10,
      masteryThreshold: 80,
      spaceRepetition: true,
      adaptiveDifficulty: true
    }
  };
}

function validateAndCleanProfile(profile: ExamProfile): ExamProfile {
  // Ensure required fields exist and are valid
  if (!profile.id) {
    profile.id = profile.name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || 'guild-cert';
  }
  
  if (!profile.name) {
    profile.name = 'Guild Certificate';
  }
  
  if (!profile.provider) {
    profile.provider = 'Enterprise Guild';
  }
  
  if (!profile.objectives || !Array.isArray(profile.objectives)) {
    profile.objectives = [];
  }
  
  // Validate objectives
  profile.objectives = profile.objectives.map((obj, index) => ({
    id: obj.id || `objective-${index + 1}`,
    title: obj.title || `Objective ${index + 1}`,
    description: obj.description || 'Learning objective description',
    weight: Math.min(Math.max(obj.weight || 10, 5), 25), // Clamp between 5-25%
    level: ['knowledge', 'application', 'synthesis'].includes(obj.level) ? obj.level : 'application',
    difficulty: ['beginner', 'intermediate', 'advanced'].includes(obj.difficulty || '') ? obj.difficulty : 'intermediate',
    questionsPerSession: Math.min(Math.max(obj.questionsPerSession || 8, 5), 15),
    keyTopics: Array.isArray(obj.keyTopics) ? obj.keyTopics : ['Topic 1', 'Topic 2']
  }));
  
  // Normalize weights to sum to 100%
  const totalWeight = profile.objectives.reduce((sum, obj) => sum + obj.weight, 0);
  if (totalWeight !== 100 && totalWeight > 0) {
    profile.objectives = profile.objectives.map(obj => ({
      ...obj,
      weight: Math.round((obj.weight / totalWeight) * 100)
    }));
  }
  
  // Ensure constraints exist
  if (!profile.constraints) {
    profile.constraints = {
      totalQuestions: 100,
      timeMinutes: 150,
      optionCount: 4,
      passingScore: 70
    };
  }
  
  // Ensure context exists
  if (!profile.context) {
    profile.context = {
      examFormat: 'Multiple-choice certification exam',
      difficulty: 'Intermediate - professional knowledge',
      focus: 'Comprehensive domain expertise',
      calculatorAllowed: false,
      terminology: []
    };
  }
  
  // Ensure study settings exist
  if (!profile.studySettings) {
    profile.studySettings = {
      defaultQuestionsPerObjective: 10,
      masteryThreshold: 80,
      spaceRepetition: true,
      adaptiveDifficulty: true
    };
  }
  
  return profile;
}

