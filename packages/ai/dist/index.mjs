// src/index.ts
import {
  Agent,
  run,
  webSearchTool,
  setDefaultOpenAIKey
} from "@openai/agents";
import { Agent as Agent2, run as run2 } from "@openai/agents";
function ensureOpenAIKey() {
  if (typeof globalThis !== "undefined" && typeof globalThis.window === "undefined") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      setDefaultOpenAIKey(apiKey);
    } else {
      console.warn("OPENAI_API_KEY environment variable not found. Make sure it is set in your .env.local file.");
    }
  }
}
var JobAnalysisAgent = class {
  agent;
  constructor() {
    ensureOpenAIKey();
    this.agent = new Agent({
      name: "Job Analysis Agent",
      instructions: `You are a job analysis expert. Your task is to:
1. Determine if the input is a direct job posting URL or a search term
2. If it's a URL: Visit the provided job posting URL using the web search tool
3. If it's a search term: Search for relevant job postings on sites like Glassdoor, LinkedIn, Indeed, etc.
4. Extract key skills and requirements from the job posting
5. Identify the job title, company, location, salary, and other job details
6. Categorize skills into relevant technical domains
7. Return a comprehensive structured analysis

Important: For search terms, search multiple job sites and select the most relevant posting. Be persistent - if one search approach fails, try alternative search terms.`,
      tools: [webSearchTool()]
    });
  }
  async analyzeJobPosting(input) {
    try {
      const isUrl = /^https?:\/\//i.test(input.trim());
      let prompt;
      if (isUrl) {
        prompt = `Analyze this job posting URL: ${input}

IMPORTANT: First explain your thinking process, then provide the final JSON.

Step 1: Use the web search tool to access the job posting URL directly.
Step 2: If the direct URL fails, try searching for the company and job information extracted from the URL.
Step 3: Analyze what you found - job title, company, location, salary, requirements, etc.
Step 4: Extract and categorize the technical skills into clear domains.
Step 5: Identify job details like location, salary range, employment type, experience level.
Step 6: Provide your final analysis in this EXACT JSON format at the end:

===JSON_START===
{
  "jobTitle": "Data Scientist",
  "company": "Tech Company Inc",
  "skills": ["Python", "Machine Learning", "SQL", "Statistics"],
  "description": "Brief description of the role",
  "location": "London, UK" or "Remote" or "New York, NY",
  "salary": "\xA360,000 - \xA380,000" or "$120,000 - $150,000" or null,
  "employmentType": "Full-time" or "Part-time" or "Contract" or null,
  "experienceLevel": "Senior" or "Mid-level" or "Junior" or null,
  "remote": true or false,
  "benefits": ["Health insurance", "Flexible hours"] or [],
  "requirements": ["3+ years experience", "Bachelor's degree"] or []
}
===JSON_END===

Extract as much information as possible. If information is not available, use null or empty arrays. Make sure the JSON is valid and never use undefined.`;
      } else {
        prompt = `Find and analyze a job posting based on this search: "${input}"

IMPORTANT: First search for relevant job postings, then analyze the best match.

Step 1: Interpret the search term and identify the job role, company (if mentioned), and location preferences.
Step 2: Search multiple job sites (Glassdoor, LinkedIn, Indeed, company career pages) for relevant postings.
Step 3: Select the most relevant and recent job posting that matches the search criteria.
Step 4: Use the web search tool to access the full job posting details.
Step 5: Analyze the selected job posting - extract job title, company, location, salary, requirements, etc.
Step 6: Extract and categorize the technical skills into clear domains.
Step 7: Identify job details like location, salary range, employment type, experience level.
Step 8: Provide your final analysis in this EXACT JSON format at the end:

===JSON_START===
{
  "jobTitle": "Software Engineer",
  "company": "Meta",
  "skills": ["React", "JavaScript", "Python", "Machine Learning"],
  "description": "Brief description of the role",
  "location": "Menlo Park, CA" or "Remote" or "New York, NY",
  "salary": "$150,000 - $220,000" or null,
  "employmentType": "Full-time" or "Part-time" or "Contract" or null,
  "experienceLevel": "Senior" or "Mid-level" or "Junior" or null,
  "remote": true or false,
  "benefits": ["Health insurance", "Stock options"] or [],
  "requirements": ["3+ years experience", "Bachelor's degree"] or []
}
===JSON_END===

Be thorough in your search and select the most relevant posting. Extract as much information as possible. If information is not available, use null or empty arrays. Make sure the JSON is valid and never use undefined.`;
      }
      const result = await run(this.agent, prompt);
      const content = this.extractTextFromResult(result);
      const jsonMatch = content.match(/===JSON_START===\s*([\s\S]*?)\s*===JSON_END===/);
      if (jsonMatch) {
        try {
          const sanitizedJson = jsonMatch[1].trim().replace(/:\s*undefined/g, ": null");
          return JSON.parse(sanitizedJson);
        } catch (parseError) {
          console.error("Error parsing extracted JSON:", parseError);
          console.log("Extracted JSON content:", jsonMatch[1]);
        }
      }
      try {
        const lastJsonStart = content.lastIndexOf("{");
        const lastJsonEnd = content.lastIndexOf("}") + 1;
        if (lastJsonStart !== -1 && lastJsonEnd > lastJsonStart) {
          const jsonContent = content.substring(lastJsonStart, lastJsonEnd);
          return JSON.parse(jsonContent);
        }
      } catch (parseError) {
        console.error("Error with fallback JSON parsing:", parseError);
      }
      console.error("Could not extract valid JSON from response:", content);
      return {
        skills: [],
        jobTitle: "Unknown Position",
        company: "Unknown Company",
        description: "Could not analyze job posting",
        location: void 0,
        salary: void 0,
        employmentType: void 0,
        experienceLevel: void 0,
        remote: false,
        benefits: [],
        requirements: []
      };
    } catch (error) {
      console.error("Error analyzing job posting:", error);
      throw error;
    }
  }
  async analyzeJobPostingFast(input) {
    try {
      const isUrl = /^https?:\/\//i.test(input.trim());
      let prompt;
      if (isUrl) {
        prompt = `Analyze this job posting and return ONLY the JSON: ${input}`;
      } else {
        prompt = `Find and analyze a job posting based on this search and return ONLY the JSON: "${input}"

Search for relevant job postings on Glassdoor, LinkedIn, Indeed, etc., then analyze the best match and return the JSON.`;
      }
      prompt += `

Return the analysis in this EXACT JSON format (no explanation, no thinking process, just the JSON):

{
  "jobTitle": "Data Scientist",
  "company": "Tech Company Inc",
  "skills": ["Python", "Machine Learning", "SQL", "Statistics"],
  "description": "Brief description of the role",
  "location": "London, UK" or "Remote" or "New York, NY",
  "salary": "\xA360,000 - \xA380,000" or "$120,000 - $150,000" or null,
  "employmentType": "Full-time" or "Part-time" or "Contract" or null,
  "experienceLevel": "Senior" or "Mid-level" or "Junior" or null,
  "remote": true or false,
  "benefits": ["Health insurance", "Flexible hours"] or [],
  "requirements": ["3+ years experience", "Bachelor's degree"] or []
}

Use the web search tool to get job information. If information is not available, use null or empty arrays. Never use undefined.`;
      const result = await run(this.agent, prompt);
      const content = this.extractTextFromResult(result);
      try {
        const jsonStart = content.indexOf("{");
        const jsonEnd = content.lastIndexOf("}") + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          const jsonContent = content.substring(jsonStart, jsonEnd);
          const sanitizedJson = jsonContent.replace(/:\s*undefined/g, ": null");
          return JSON.parse(sanitizedJson);
        }
      } catch (parseError) {
        console.error("Error parsing JSON from fast analysis:", parseError);
        console.log("Raw content:", content);
      }
      console.error("Could not extract valid JSON from fast analysis response:", content);
      return {
        skills: [],
        jobTitle: "Unknown Position",
        company: "Unknown Company",
        description: "Could not analyze job posting",
        location: void 0,
        salary: void 0,
        employmentType: void 0,
        experienceLevel: void 0,
        remote: false,
        benefits: [],
        requirements: []
      };
    } catch (error) {
      console.error("Error in fast job analysis:", error);
      throw error;
    }
  }
  async *analyzeJobPostingWithThinking(input) {
    try {
      const isUrl = /^https?:\/\//i.test(input.trim());
      let prompt;
      if (isUrl) {
        prompt = `Analyze this job posting: ${input}`;
      } else {
        prompt = `Find and analyze a job posting based on this search: "${input}"

First search for relevant job postings, then analyze the best match.`;
      }
      prompt += `

IMPORTANT: Think step by step and explain your process as you work.

Step 1: Use the web search tool to access the job posting. If direct access fails, extract company/role info from URL and search for it.
Step 2: Analyze what you found - explain the job title, company, location, salary, and requirements you see.
Step 3: Extract and list the technical skills, categorizing them clearly.
Step 4: Identify employment details like work type, experience level, benefits.
Step 5: Be resourceful - if initial search fails, try alternative approaches.
Step 6: Provide your final analysis in this EXACT JSON format at the very end:

===JSON_START===
{
  "jobTitle": "Data Scientist",
  "company": "Tech Company Inc",
  "skills": ["Python", "Machine Learning", "SQL", "Statistics"],
  "description": "Brief description of the role",
  "location": "London, UK" or "Remote" or "New York, NY",
  "salary": "\xA360,000 - \xA380,000" or "$120,000 - $150,000" or null,
  "employmentType": "Full-time" or "Part-time" or "Contract" or null,
  "experienceLevel": "Senior" or "Mid-level" or "Junior" or null,
  "remote": true or false,
  "benefits": ["Health insurance", "Flexible hours"] or [],
  "requirements": ["3+ years experience", "Bachelor's degree"] or []
}
===JSON_END===

Be thorough in your thinking process. Extract as much information as possible before providing the final JSON. IMPORTANT: Use null instead of undefined for missing values.`;
      const result = await run(this.agent, prompt, {
        stream: true
      });
      let fullContent = "";
      let hasStartedJson = false;
      if (result.toStream) {
        for await (const event of result.toStream()) {
          if (event.type === "raw_model_stream_event" && event.data?.type === "output_text_delta") {
            const delta = event.data.delta || "";
            fullContent += delta;
            if (fullContent.includes("===JSON_START===")) {
              hasStartedJson = true;
            }
            if (!hasStartedJson) {
              yield { type: "thinking", content: delta };
            }
          }
        }
      }
      const jsonMatch = fullContent.match(/===JSON_START===\s*([\s\S]*?)\s*===JSON_END===/);
      if (jsonMatch) {
        try {
          const sanitizedJson = jsonMatch[1].trim().replace(/:\s*undefined/g, ": null");
          const parsed = JSON.parse(sanitizedJson);
          yield { type: "result", content: parsed };
          return;
        } catch (parseError) {
          console.error("Error parsing extracted JSON:", parseError);
          console.log("Raw JSON content:", jsonMatch[1]);
        }
      }
      yield {
        type: "result",
        content: {
          skills: [],
          jobTitle: "Unknown Position",
          company: "Unknown Company",
          description: "Could not analyze job posting",
          location: void 0,
          salary: void 0,
          employmentType: void 0,
          experienceLevel: void 0,
          remote: false,
          benefits: [],
          requirements: []
        }
      };
    } catch (error) {
      console.error("Error analyzing job posting:", error);
      throw error;
    }
  }
  extractTextFromResult(result) {
    if (result.output?.text) {
      return result.output.text;
    }
    if (Array.isArray(result.output)) {
      return result.output.map((item) => item.text || "").join("");
    }
    return "";
  }
};
var QuestionGenerationAgent = class {
  agent;
  constructor() {
    ensureOpenAIKey();
    this.agent = new Agent({
      name: "Question Generation Agent",
      instructions: `You are an expert quiz question generator. Your task is to:
1. Generate exactly 5 true/false questions for a specific skill
2. Questions should test practical knowledge and understanding
3. Provide clear, helpful explanations
4. Focus on real-world applications
5. Ensure questions are educational and progressively challenging

Generate questions that would be relevant for someone preparing for a job in this field.`
    });
  }
  async *generateQuestionsForSkill(skill, stream = true) {
    try {
      const result = await run(this.agent, `Generate 5 true/false questions about ${skill}.

Requirements:
- Questions should test practical knowledge
- Mix of conceptual and applied questions
- Provide clear, educational explanations
- Focus on job-relevant scenarios

Format each question as a separate JSON object:
{"text": "Question text here?", "answer": true/false, "why": "Explanation here", "skill": "${skill}"}`, {
        stream
      });
      if (stream && result.stream) {
        const questions = [];
        let currentQuestion = "";
        for await (const event of result.stream) {
          if (event.type === "raw_model_stream_event" && event.data.type === "output_text_delta") {
            currentQuestion += event.data.delta;
            const lines = currentQuestion.split("\n");
            for (const line of lines) {
              if (line.trim().startsWith("{") && line.trim().endsWith("}")) {
                try {
                  const question = JSON.parse(line.trim());
                  questions.push(question);
                  yield question;
                  if (questions.length >= 5) {
                    return;
                  }
                } catch (e) {
                }
              }
            }
          }
        }
      } else {
        const content = this.extractTextFromResult(result);
        const lines = content.split("\n");
        for (const line of lines) {
          if (line.trim().startsWith("{") && line.trim().endsWith("}")) {
            try {
              const question = JSON.parse(line.trim());
              yield question;
            } catch (e) {
              console.error("Error parsing question:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  }
  async generateQuestionsBatch(skill, count = 5) {
    const questions = [];
    for await (const question of this.generateQuestionsForSkill(skill, false)) {
      questions.push(question);
      if (questions.length >= count) break;
    }
    return questions;
  }
  async *generateSingleQuestion(skill) {
    try {
      console.log("AI: Starting generateSingleQuestion for skill:", skill);
      const result = await run(this.agent, `Generate 1 challenging true/false question about ${skill}.

Requirements:
- Create a specific, practical question that tests real understanding
- Focus on common misconceptions, best practices, or technical details
- Mix true and false answers (randomly distribute - don't always make it true)
- Make it job-interview level difficulty
- Include a clear, educational explanation that teaches something valuable
- Return ONLY the JSON object, no extra text

Examples of good questions:
- "In PyTorch, gradients are automatically zeroed after each backward pass?" (False - you must manually zero them)
- "React components re-render every time their parent component re-renders?" (True - unless memoized)
- "In Python, 'is' and '==' always return the same result for strings?" (False - 'is' checks identity, '==' checks value)

Generate JSON:
{"text": "Your specific question here?", "answer": true/false, "why": "Detailed explanation here", "skill": "${skill}"}`, {
        stream: true
      });
      let accumulatedText = "";
      let questionText = "";
      let isCollectingQuestion = false;
      console.log("AI: Checking if result has stream...", !!result.stream);
      if (result.stream) {
        console.log("AI: Starting to process stream events...");
        for await (const event of result.stream) {
          if (event.type === "raw_model_stream_event" && event.data?.type === "output_text_delta") {
            const delta = event.data.delta || "";
            accumulatedText += delta;
            console.log("AI: Got delta:", delta, "Accumulated:", accumulatedText.length, "chars");
            if (accumulatedText.includes("Question") || accumulatedText.includes("question") || isCollectingQuestion) {
              isCollectingQuestion = true;
              const questionMatch = accumulatedText.match(/"text"\s*:\s*"([^"]*(?:\.[^"]*)*)"/);
              if (questionMatch) {
                const currentQuestionText = questionMatch[1];
                if (currentQuestionText !== questionText) {
                  const newChars = currentQuestionText.slice(questionText.length);
                  if (newChars) {
                    yield { type: "chunk", content: newChars };
                    questionText = currentQuestionText;
                  }
                }
              }
            } else {
              yield { type: "chunk", content: delta };
            }
          }
        }
      } else {
        console.log("AI: No stream available, falling back to sync generation");
        const question = await this.generateSingleQuestionSync(skill);
        const questionText2 = `Question: ${question.text}`;
        const chunkSize = 8;
        for (let i = 0; i < questionText2.length; i += chunkSize) {
          const chunk = questionText2.slice(i, i + chunkSize);
          yield { type: "chunk", content: chunk };
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        yield { type: "complete", content: question };
        return;
      }
      const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const question = JSON.parse(jsonMatch[0]);
          if (question.text && typeof question.answer === "boolean" && question.why) {
            yield { type: "complete", content: question };
          } else {
            throw new Error("Invalid question format");
          }
        } catch (parseError) {
          console.error("Error parsing final question JSON:", parseError);
          const question = await this.generateSingleQuestionSync(skill);
          yield { type: "complete", content: question };
        }
      } else {
        const question = await this.generateSingleQuestionSync(skill);
        yield { type: "complete", content: question };
      }
    } catch (error) {
      console.error("Error generating single question:", error);
      throw error;
    }
  }
  async generateSingleQuestionSync(skill) {
    try {
      const result = await run(this.agent, `Generate 1 challenging true/false question about ${skill}.

Requirements:
- Create a specific, practical question that tests real understanding
- Focus on common misconceptions, best practices, or technical details
- Mix true and false answers (randomly distribute - don't always make it true)
- Make it job-interview level difficulty
- Include a clear, educational explanation that teaches something valuable
- Return ONLY the JSON object, no extra text

Examples of good questions:
- "In PyTorch, gradients are automatically zeroed after each backward pass?" (False - you must manually zero them)
- "React components re-render every time their parent component re-renders?" (True - unless memoized)
- "In Python, 'is' and '==' always return the same result for strings?" (False - 'is' checks identity, '==' checks value)

Generate JSON:
{"text": "Your specific question here?", "answer": true/false, "why": "Detailed explanation here", "skill": "${skill}"}`);
      const content = this.extractTextFromResult(result);
      let jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          const sanitizedJson = jsonMatch[0].trim().replace(/:\s*undefined/g, ": null");
          const question = JSON.parse(sanitizedJson);
          if (question.text && typeof question.answer === "boolean" && question.why) {
            return {
              text: question.text,
              answer: question.answer,
              why: question.why,
              skill
            };
          }
        } catch (parseError) {
          console.error("Error parsing question JSON:", parseError);
        }
      }
      return {
        text: `What is a key concept in ${skill}?`,
        answer: true,
        why: `This is a fallback question about ${skill}. Please try generating again.`,
        skill
      };
    } catch (error) {
      console.error("Error generating question:", error);
      return {
        text: `What is a key concept in ${skill}?`,
        answer: true,
        why: `This is a fallback question about ${skill}. Please try generating again.`,
        skill
      };
    }
  }
  extractTextFromResult(result) {
    if (result.output?.text) {
      return result.output.text;
    }
    if (Array.isArray(result.output)) {
      return result.output.map((item) => item.text || "").join("");
    }
    return "";
  }
};
var EnhancedQuizAgent = class {
  jobAnalyzer;
  questionGenerator;
  constructor() {
    this.jobAnalyzer = new JobAnalysisAgent();
    this.questionGenerator = new QuestionGenerationAgent();
  }
  async analyzeJobPosting(input) {
    return this.jobAnalyzer.analyzeJobPosting(input);
  }
  async analyzeJobPostingFast(input) {
    return this.jobAnalyzer.analyzeJobPostingFast(input);
  }
  async *generateSkillBasedQuiz(skills, questionsPerSkill = 5) {
    for (const skill of skills) {
      const questions = [];
      try {
        for await (const question of this.questionGenerator.generateQuestionsForSkill(skill, true)) {
          questions.push(question);
          if (questions.length >= questionsPerSkill) {
            yield {
              questions,
              skill,
              completed: true
            };
            break;
          }
          if (questions.length > 0) {
            yield {
              questions: [...questions],
              skill,
              completed: false
            };
          }
        }
      } catch (error) {
        console.error(`Error generating questions for skill ${skill}:`, error);
      }
    }
  }
  async generateQuestionsForSkill(skill, count = 5) {
    return this.questionGenerator.generateQuestionsBatch(skill, count);
  }
};
var createEnhancedQuizAgent = () => new EnhancedQuizAgent();
var createJobAnalysisAgent = () => new JobAnalysisAgent();
var createQuestionGenerationAgent = () => new QuestionGenerationAgent();
export {
  Agent2 as Agent,
  EnhancedQuizAgent,
  JobAnalysisAgent,
  QuestionGenerationAgent,
  createEnhancedQuizAgent,
  createJobAnalysisAgent,
  createQuestionGenerationAgent,
  run2 as run
};
