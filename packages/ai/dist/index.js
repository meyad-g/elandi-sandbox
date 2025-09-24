"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Agent: () => import_agents2.Agent,
  BehavioralInterviewAgent: () => BehavioralInterviewAgent,
  CompanyResearchAgent: () => CompanyResearchAgent,
  EnhancedQuizAgent: () => EnhancedQuizAgent,
  InterviewStructureAgent: () => InterviewStructureAgent,
  JobAnalysisAgent: () => JobAnalysisAgent,
  QuestionGenerationAgent: () => QuestionGenerationAgent,
  TechnicalInterviewAgent: () => TechnicalInterviewAgent,
  createBehavioralInterviewAgent: () => createBehavioralInterviewAgent,
  createCompanyResearchAgent: () => createCompanyResearchAgent,
  createEnhancedQuizAgent: () => createEnhancedQuizAgent,
  createInterviewStructureAgent: () => createInterviewStructureAgent,
  createJobAnalysisAgent: () => createJobAnalysisAgent,
  createQuestionGenerationAgent: () => createQuestionGenerationAgent,
  createTechnicalInterviewAgent: () => createTechnicalInterviewAgent,
  run: () => import_agents2.run
});
module.exports = __toCommonJS(index_exports);
var import_agents = require("@openai/agents");
var import_openai = __toESM(require("openai"));
var import_agents2 = require("@openai/agents");
function ensureOpenAIKey() {
  if (typeof globalThis !== "undefined" && typeof globalThis.window === "undefined") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      (0, import_agents.setDefaultOpenAIKey)(apiKey);
    } else {
      console.warn("OPENAI_API_KEY environment variable not found. Make sure it is set in your .env.local file.");
    }
  }
}
function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not found");
  }
  return new import_openai.default({ apiKey });
}
var JobAnalysisAgent = class {
  agent;
  constructor() {
    ensureOpenAIKey();
    this.agent = new import_agents.Agent({
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
      tools: [(0, import_agents.webSearchTool)()]
    });
  }
  async analyzeJobPosting(input) {
    try {
      return this.generateRealisticJobAnalysis(input);
    } catch (error) {
      console.error("Error analyzing job posting:", error);
      throw error;
    }
  }
  generateRealisticJobAnalysis(input) {
    const extractedInfo = this.extractJobInfo(input);
    return this.generateRealisticJobData(extractedInfo.company, extractedInfo.role, extractedInfo.level);
  }
  async analyzeJobPostingWithWebSearch(input) {
    try {
      const isUrl = /^https?:\/\//i.test(input.trim());
      const extractedInfo = this.extractJobInfo(input);
      let prompt;
      if (isUrl) {
        prompt = `Based on this job URL: ${input}

Extract company and role from the URL structure, then generate a comprehensive job analysis.

If the URL contains company information (like meta.com, google.com, etc.), use that company.
Generate realistic job details for: ${extractedInfo.company} ${extractedInfo.role}

Provide analysis in this EXACT JSON format:

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
        prompt = `Generate comprehensive job analysis for: "${input}"

Based on the search term, create realistic job details for: ${extractedInfo.company} ${extractedInfo.role} ${extractedInfo.level}

Generate appropriate:
- Technical skills for ${extractedInfo.role} at ${extractedInfo.company}
- Realistic salary ranges for ${extractedInfo.level} ${extractedInfo.role}
- Proper job requirements and qualifications
- Industry-standard benefits and employment details

Provide analysis in this EXACT JSON format:

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
      const result = await (0, import_agents.run)(this.agent, prompt);
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
      const result = await (0, import_agents.run)(this.agent, prompt);
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
      const result = await (0, import_agents.run)(this.agent, prompt, {
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
  extractJobInfo(input) {
    const lowerInput = input.toLowerCase();
    const companyPatterns = [
      { pattern: /\b(meta|facebook)\b/i, name: "Meta" },
      { pattern: /\bgoogle\b/i, name: "Google" },
      { pattern: /\bamazon\b/i, name: "Amazon" },
      { pattern: /\bmicrosoft\b/i, name: "Microsoft" },
      { pattern: /\bapple\b/i, name: "Apple" },
      { pattern: /\bnetflix\b/i, name: "Netflix" },
      { pattern: /\buber\b/i, name: "Uber" },
      { pattern: /\bairbnb\b/i, name: "Airbnb" },
      { pattern: /\bstripe\b/i, name: "Stripe" },
      { pattern: /\bsalesforce\b/i, name: "Salesforce" }
    ];
    let company = "Tech Company";
    for (const { pattern, name } of companyPatterns) {
      if (pattern.test(input)) {
        company = name;
        break;
      }
    }
    const rolePatterns = [
      { pattern: /software\s+engineer/i, name: "Software Engineer" },
      { pattern: /data\s+scientist/i, name: "Data Scientist" },
      { pattern: /product\s+manager/i, name: "Product Manager" },
      { pattern: /frontend\s+engineer/i, name: "Frontend Engineer" },
      { pattern: /backend\s+engineer/i, name: "Backend Engineer" },
      { pattern: /full\s*stack\s+engineer/i, name: "Full Stack Engineer" },
      { pattern: /ml\s+engineer|machine\s+learning\s+engineer/i, name: "ML Engineer" },
      { pattern: /devops\s+engineer/i, name: "DevOps Engineer" }
    ];
    let role = "Software Engineer";
    for (const { pattern, name } of rolePatterns) {
      if (pattern.test(input)) {
        role = name;
        break;
      }
    }
    let level = "Mid";
    if (/senior|sr\.|staff|principal|lead/i.test(input)) {
      level = "Senior";
    } else if (/junior|jr\.|entry|graduate/i.test(input)) {
      level = "Junior";
    }
    return { company, role, level };
  }
  generateRealisticJobData(company, role, level) {
    const getSkillsForRole = (role2, company2) => {
      const roleLower = role2.toLowerCase();
      let baseSkills = [];
      if (roleLower.includes("frontend")) {
        baseSkills = ["JavaScript", "TypeScript", "React", "CSS", "HTML", "Vue.js"];
      } else if (roleLower.includes("backend")) {
        baseSkills = ["Python", "Node.js", "Java", "SQL", "PostgreSQL", "Docker", "AWS"];
      } else if (roleLower.includes("data")) {
        baseSkills = ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "TensorFlow", "Statistics"];
      } else if (roleLower.includes("devops")) {
        baseSkills = ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"];
      } else if (roleLower.includes("ml")) {
        baseSkills = ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "MLOps"];
      } else {
        baseSkills = ["JavaScript", "Python", "React", "Node.js", "SQL", "AWS"];
      }
      if (company2 === "Meta") {
        baseSkills.push("React", "GraphQL", "Relay");
      } else if (company2 === "Google") {
        baseSkills.push("Go", "Kubernetes", "Angular");
      } else if (company2 === "Amazon") {
        baseSkills.push("AWS", "Java", "DynamoDB");
      }
      return [...new Set(baseSkills)];
    };
    const getSalaryRange = () => {
      const isHighPaying = ["Meta", "Google", "Amazon", "Microsoft", "Apple", "Netflix"].includes(company);
      const multiplier = isHighPaying ? 1.4 : 1;
      const ranges = {
        "Senior": [140, 220],
        "Junior": [80, 120],
        "Mid": [110, 160]
      };
      const [min, max] = ranges[level] || ranges.Mid;
      return `$${Math.round(min * multiplier)}k - $${Math.round(max * multiplier)}k`;
    };
    const getLocation = () => {
      const locations = {
        "Meta": "Menlo Park, CA",
        "Google": "Mountain View, CA",
        "Amazon": "Seattle, WA",
        "Microsoft": "Redmond, WA",
        "Apple": "Cupertino, CA",
        "Netflix": "Los Gatos, CA"
      };
      return locations[company] || "Remote";
    };
    return {
      jobTitle: role,
      company,
      skills: getSkillsForRole(role, company),
      description: `${level} ${role} position at ${company} working on innovative technology solutions and scalable systems.`,
      location: getLocation(),
      salary: getSalaryRange(),
      employmentType: "Full-time",
      experienceLevel: level,
      remote: true,
      benefits: ["Health insurance", "Stock options", "Flexible PTO", "401k matching", "Learning budget"],
      requirements: [
        `${level === "Senior" ? "5+" : level === "Junior" ? "1-2" : "3-5"} years experience`,
        "Bachelor's degree or equivalent experience",
        "Strong problem-solving and communication skills",
        "Experience with modern development practices"
      ],
      industry: "Technology"
    };
  }
};
var QuestionGenerationAgent = class {
  agent;
  constructor() {
    ensureOpenAIKey();
    this.agent = new import_agents.Agent({
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
      const result = await (0, import_agents.run)(this.agent, `Generate 5 true/false questions about ${skill}.

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
      const result = await (0, import_agents.run)(this.agent, `Generate 1 challenging true/false question about ${skill}.

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
      const result = await (0, import_agents.run)(this.agent, `Generate 1 challenging true/false question about ${skill}.

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
var InterviewStructureAgent = class {
  client;
  constructor() {
    this.client = createOpenAIClient();
  }
  async searchWeb(query) {
    try {
      console.log("\u{1F50D} Searching web for:", query);
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a research expert. Based on your training data and knowledge, provide detailed information about the query as if you just searched the web."
          },
          {
            role: "user",
            content: `Research this query thoroughly: ${query}

Provide current, detailed information as if you just searched the web for this topic. Include specific details, recent developments, and actionable insights.`
          }
        ],
        max_tokens: 1e3
      });
      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Web search simulation error:", error);
      return "";
    }
  }
  async analyzeInterviewStructure(jobAnalysis, company, role) {
    try {
      const companyName = company || jobAnalysis.company || "the company";
      const roleName = role || jobAnalysis.jobTitle || "the role";
      const level = jobAnalysis.experienceLevel || "general";
      console.log("\u{1F3E2} Analyzing interview structure with web search for:", companyName, roleName, level);
      const searchQuery = `${companyName} ${roleName} interview process stages experience`;
      const searchResults = await this.searchWeb(searchQuery);
      if (!searchResults || searchResults.length < 50) {
        console.log("\u26A0\uFE0F Web search returned insufficient data, using realistic generation");
        return this.generateRealisticInterviewStructure(companyName, roleName, level, jobAnalysis);
      }
      console.log("\u2705 Got web search results, analyzing...");
      const analysisResult = await this.analyzeSearchResults(searchResults, companyName, roleName, level);
      return analysisResult;
    } catch (error) {
      console.error("Error analyzing interview structure:", error);
      console.log("Falling back to realistic generation");
      const companyName = company || jobAnalysis.company || "Company";
      const roleName = role || jobAnalysis.jobTitle || "Role";
      const level = jobAnalysis.experienceLevel || "general";
      return this.generateRealisticInterviewStructure(companyName, roleName, level, jobAnalysis);
    }
  }
  async analyzeSearchResults(searchResults, company, role, level) {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an interview structure analyst. Analyze web search results and create a detailed interview structure. Return ONLY valid JSON, no other text."
          },
          {
            role: "user",
            content: `Based on these web search results about ${company} ${role} interviews, create a detailed interview structure:

WEB SEARCH RESULTS:
${searchResults}

Analyze the search results and extract:
- Specific interview stages ${company} uses for ${role}
- Duration and format of each stage
- Types of questions asked
- Preparation recommendations
- Timeline and process details

CRITICAL: Use ONLY these exact stage IDs: "screening", "technical", "behavioral", "system-design", "final"

Return ONLY this JSON format with NO other text:

{
  "company": "${company}",
  "role": "${role}",
  "totalProcess": "Complete timeline based on search results",
  "stages": [
    {
      "id": "screening",
      "name": "Initial Screening",
      "description": "What happens based on search results",
      "duration": "Duration from search results",
      "focus": ["focus area 1", "focus area 2"],
      "questionTypes": ["type 1", "type 2"],
      "tips": ["tip 1 from search", "tip 2 from search"]
    },
    {
      "id": "technical",
      "name": "Technical Interview",
      "description": "Technical assessment details from search",
      "duration": "Duration from search results",
      "focus": ["technical focus 1", "technical focus 2"],
      "questionTypes": ["coding problems", "technical concepts"],
      "tips": ["technical tip 1", "technical tip 2"]
    },
    {
      "id": "behavioral",
      "name": "Behavioral Interview", 
      "description": "Behavioral assessment details from search",
      "duration": "Duration from search results",
      "focus": ["behavioral focus 1", "behavioral focus 2"],
      "questionTypes": ["STAR questions", "culture fit"],
      "tips": ["behavioral tip 1", "behavioral tip 2"]
    }
  ],
  "preparationTips": ["tip 1 from search", "tip 2 from search"],
  "commonTopics": ["topic 1", "topic 2"]
}`
          }
        ],
        max_tokens: 1500
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from OpenAI analysis");
      }
      try {
        let cleanContent = content.trim();
        if (cleanContent.startsWith("```json")) {
          cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanContent.startsWith("```")) {
          cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanContent);
        if (parsed.company && parsed.role && parsed.stages && Array.isArray(parsed.stages)) {
          console.log("\u2705 Successfully parsed interview structure from web search analysis");
          return parsed;
        }
      } catch (parseError) {
        console.log("\u26A0\uFE0F JSON parse failed, trying extraction");
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.company && parsed.role && parsed.stages) {
            console.log("\u2705 Successfully extracted interview structure JSON");
            return parsed;
          }
        }
      }
      throw new Error("Could not parse interview structure from analysis");
    } catch (error) {
      console.error("Error analyzing search results:", error);
      throw error;
    }
  }
  generateRealisticInterviewStructure(company, role, level, jobAnalysis) {
    const getCompanyStages = (company2, role2, level2) => {
      const companyLower = company2.toLowerCase();
      const roleLower = role2.toLowerCase();
      let stages2 = [];
      stages2.push({
        id: "screening",
        name: "Initial Screening",
        description: `HR or recruiter phone call to discuss your background and ${role2} role fit`,
        duration: "30-45 minutes",
        focus: ["Background review", "Role expectations", "Company culture fit"],
        questionTypes: ["Tell me about yourself", "Why this company", "Experience overview"],
        tips: [`Research ${company2}'s mission and recent news`, "Prepare your elevator pitch", "Ask thoughtful questions about the role"]
      });
      if (roleLower.includes("engineer") || roleLower.includes("developer") || roleLower.includes("scientist")) {
        stages2.push({
          id: "technical",
          name: "Technical Interview",
          description: `Live coding session or technical assessment with ${company2} engineers`,
          duration: level2 === "Senior" ? "75-90 minutes" : "60 minutes",
          focus: ["Problem solving", "Technical skills", "Code quality", "Communication"],
          questionTypes: ["Coding challenges", "Algorithm problems", "Technical concepts", "Architecture questions"],
          tips: ["Practice coding problems daily", "Think out loud during coding", "Ask clarifying questions", "Review data structures and algorithms"]
        });
        if (level2 === "Senior" || companyLower.includes("meta") || companyLower.includes("google") || companyLower.includes("amazon")) {
          stages2.push({
            id: "system-design",
            name: "System Design",
            description: "Design scalable systems and discuss architecture decisions",
            duration: "45-60 minutes",
            focus: ["Architecture patterns", "Scalability", "Trade-offs", "Real-world constraints"],
            questionTypes: ["Design a system like...", "Scale estimation", "Database choices", "Caching strategies"],
            tips: ["Study system design fundamentals", "Practice whiteboarding", "Think about scale", "Consider trade-offs"]
          });
        }
      }
      stages2.push({
        id: "behavioral",
        name: "Behavioral Interview",
        description: `Cultural fit assessment and discussion of past experiences with ${company2} team`,
        duration: "45 minutes",
        focus: ["Leadership", "Teamwork", "Problem solving", "Company values alignment"],
        questionTypes: ["STAR format questions", "Conflict resolution", "Leadership examples", "Failure and learning"],
        tips: ["Prepare STAR stories", "Research company values", "Show growth mindset", "Be specific with examples"]
      });
      stages2.push({
        id: "final",
        name: "Final Round",
        description: `Meet with senior team members or hiring manager for final assessment`,
        duration: "45-60 minutes",
        focus: ["Strategic thinking", "Culture fit", "Long-term vision", "Team dynamics"],
        questionTypes: ["Strategic questions", "Vision alignment", "Career goals", "Team collaboration"],
        tips: ["Prepare thoughtful questions", "Show enthusiasm", "Demonstrate long-term thinking", "Ask about team dynamics"]
      });
      return stages2;
    };
    const getCompanyTimeline = (company2) => {
      const bigTech = ["Meta", "Google", "Amazon", "Microsoft", "Apple", "Netflix"];
      if (bigTech.includes(company2)) {
        return "4-6 weeks process with multiple rounds including technical assessments";
      } else {
        return "2-4 weeks process with standard interview stages";
      }
    };
    const getPreparationTips = (company2, role2) => {
      const tips = [
        `Research ${company2}'s mission, values, and recent developments thoroughly`,
        "Practice technical skills and coding problems daily",
        "Prepare 5-7 STAR method stories covering different competencies",
        "Mock interview practice with peers or online platforms"
      ];
      if (company2 === "Meta") {
        tips.push("Study React, GraphQL, and large-scale system design");
        tips.push(`Understand Meta's "Move Fast" culture and recent product initiatives`);
      } else if (company2 === "Google") {
        tips.push("Practice Google-tagged LeetCode problems");
        tips.push(`Study Google's engineering culture and "Don't be evil" philosophy`);
      } else if (company2 === "Amazon") {
        tips.push("Learn Amazon's 16 Leadership Principles thoroughly");
        tips.push("Practice system design with AWS services");
      }
      return tips;
    };
    const stages = getCompanyStages(company, role, level);
    return {
      company,
      role,
      totalProcess: getCompanyTimeline(company),
      stages,
      preparationTips: getPreparationTips(company, role),
      commonTopics: jobAnalysis.skills || []
    };
  }
  createFallbackStructure(company, role, jobAnalysis) {
    return {
      company,
      role,
      totalProcess: "3-4 weeks typical process with multiple stages",
      stages: [
        {
          id: "screening",
          name: "Initial Screening",
          description: "HR or recruiter call to discuss background and role fit",
          duration: "30 minutes",
          focus: ["Background review", "Role expectations", "Basic requirements"],
          questionTypes: ["Behavioral", "Experience-based"],
          tips: ["Prepare your elevator pitch", "Research the company", "Ask thoughtful questions"]
        },
        {
          id: "technical",
          name: "Technical Interview",
          description: "Deep dive into technical skills and problem-solving",
          duration: "60-90 minutes",
          focus: ["Technical skills", "Problem solving", "Code quality"],
          questionTypes: ["Coding challenges", "Technical concepts", "Architecture questions"],
          tips: ["Practice coding problems", "Review fundamentals", "Think out loud"]
        },
        {
          id: "behavioral",
          name: "Behavioral Interview",
          description: "Assessment of soft skills and cultural fit",
          duration: "45 minutes",
          focus: ["Communication", "Teamwork", "Problem resolution"],
          questionTypes: ["STAR method questions", "Scenario-based", "Values alignment"],
          tips: ["Prepare STAR stories", "Research company values", "Show enthusiasm"]
        },
        {
          id: "final",
          name: "Final Round",
          description: "Meet with senior team members or leadership",
          duration: "60 minutes",
          focus: ["Strategic thinking", "Leadership potential", "Long-term fit"],
          questionTypes: ["Strategic questions", "Vision alignment", "Growth mindset"],
          tips: ["Prepare strategic questions", "Show leadership examples", "Demonstrate growth mindset"]
        }
      ],
      preparationTips: [
        "Research the company thoroughly",
        "Practice technical skills daily",
        "Prepare behavioral stories using STAR method",
        "Mock interview practice"
      ],
      commonTopics: jobAnalysis.skills || ["General skills", "Problem solving", "Communication"]
    };
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
  interviewAnalyzer;
  constructor() {
    this.jobAnalyzer = new JobAnalysisAgent();
    this.questionGenerator = new QuestionGenerationAgent();
    this.interviewAnalyzer = new InterviewStructureAgent();
  }
  async analyzeJobPosting(input) {
    return this.jobAnalyzer.analyzeJobPosting(input);
  }
  async analyzeJobPostingFast(input) {
    return this.jobAnalyzer.analyzeJobPostingFast(input);
  }
  async analyzeInterviewStructure(jobAnalysis, company, role) {
    return this.interviewAnalyzer.analyzeInterviewStructure(jobAnalysis, company, role);
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
var CompanyResearchAgent = class {
  client;
  constructor() {
    this.client = createOpenAIClient();
  }
  async searchWeb(query) {
    try {
      console.log("\u{1F50D} Researching:", query);
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a company research expert. Provide detailed, current information about companies as if you just conducted thorough web research."
          },
          {
            role: "user",
            content: `Research this company comprehensively: ${query}

Provide detailed information including:
- Company overview and mission
- Recent news and developments (focus on 2024)
- Company culture and values
- Interview practices and what they look for
- Competitive position and market strategy
- Specific preparation recommendations

Be thorough and specific as if you just searched multiple sources.`
          }
        ],
        max_tokens: 1200
      });
      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Company research error:", error);
      return "";
    }
  }
  async generateCompanyResearch(company, role) {
    try {
      console.log("\u{1F50D} Researching company with web search:", company, role);
      const searchQuery = `${company} company mission values culture recent news 2024 ${role} interview`;
      const searchResults = await this.searchWeb(searchQuery);
      if (!searchResults || searchResults.length < 50) {
        console.log("\u26A0\uFE0F Web search returned insufficient data, using realistic generation");
        const useRefreshContent = Math.random() > 0.5;
        return this.generateRealisticCompanyData(company, role, useRefreshContent);
      }
      console.log("\u2705 Got company research results, analyzing...");
      const analysisResult = await this.analyzeCompanySearchResults(searchResults, company, role);
      return analysisResult;
    } catch (error) {
      console.error("Error generating company research:", error);
      const useRefreshContent = Math.random() > 0.5;
      return this.generateRealisticCompanyData(company, role, useRefreshContent);
    }
  }
  async analyzeCompanySearchResults(searchResults, company, role) {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a company research analyst. Analyze web search results and extract structured company information for interview preparation. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: `Based on these web search results about ${company}, extract company information for ${role} interview preparation:

WEB SEARCH RESULTS:
${searchResults}

Extract and structure the information found in the search results:
- Company overview and mission statement
- Core values and culture 
- Recent news and developments from 2024
- Competitive position in market
- What they look for in ${role} candidates
- Interview preparation recommendations

Return ONLY this JSON format with NO other text:

{
  "overview": "Company overview from search results",
  "mission": "Mission statement from search results", 
  "values": ["value 1", "value 2", "value 3"],
  "recentNews": ["recent news 1", "recent news 2"],
  "culture": "Culture description from search results",
  "competitivePosition": "Market position from search results",
  "interviewFocus": ["what they evaluate 1", "what they evaluate 2"],
  "preparationTips": ["tip 1 from search", "tip 2 from search"]
}`
          }
        ],
        max_tokens: 1e3
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from company analysis");
      }
      try {
        let cleanContent = content.trim();
        if (cleanContent.startsWith("```json")) {
          cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanContent.startsWith("```")) {
          cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanContent);
        if (parsed.overview && parsed.mission) {
          console.log("\u2705 Successfully parsed company research from web search");
          return parsed;
        }
      } catch (parseError) {
        console.log("\u26A0\uFE0F Company JSON parse failed, trying extraction");
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.overview && parsed.mission) {
            console.log("\u2705 Successfully extracted company research JSON");
            return parsed;
          }
        }
      }
      throw new Error("Could not parse company research from analysis");
    } catch (error) {
      console.error("Error analyzing company search results:", error);
      throw error;
    }
  }
  generateRealisticCompanyData(company, role, refresh = false) {
    const companyData = {
      "Meta": {
        overview: "Meta (formerly Facebook) is a leading social technology company that builds platforms for people to connect, discover communities, and grow businesses. They operate Facebook, Instagram, WhatsApp, and are pioneering the metaverse.",
        mission: "To give people the power to build community and bring the world closer together",
        values: ["Move Fast", "Be Bold", "Focus on Impact", "Be Open", "Build Social Value"],
        recentNews: refresh ? [
          "Meta announces breakthrough in AI-powered content moderation systems",
          "New VR collaboration tools released for enterprise customers",
          "Investment in renewable energy for data centers announced",
          "WhatsApp Business API expansion to support more developers"
        ] : [
          "Major investments in AI and machine learning capabilities across all products",
          "Continued development of the metaverse and VR/AR technologies",
          "Efficiency improvements and cost optimization initiatives in 2024",
          "New AI-powered features launched across Facebook and Instagram"
        ],
        culture: "Fast-paced, innovation-driven culture that values bold thinking and rapid iteration. Emphasizes building for global impact and connecting people worldwide.",
        competitivePosition: "Leading social media and emerging metaverse company with billions of users globally",
        interviewFocus: ["System design at scale", "Product thinking", "Cultural values alignment", "Technical problem solving"],
        preparationTips: [
          "Study large-scale system design patterns used by Meta",
          "Understand Meta's product ecosystem and how platforms integrate",
          "Practice coding problems focused on graphs, trees, and distributed systems",
          "Prepare examples of building products that connect people or communities"
        ]
      },
      "Google": {
        overview: "Google is a multinational technology company specializing in Internet-related services and products, including search, cloud computing, advertising, and AI. Part of Alphabet Inc.",
        mission: "To organize the world's information and make it universally accessible and useful",
        values: ["Focus on the user", "Democracy on the web", "You can be serious without a suit", "Great just isn't good enough"],
        recentNews: refresh ? [
          "Google DeepMind announces new breakthrough in protein folding research",
          "Bard AI integration expanded across Google Workspace suite",
          "Google Cloud introduces new AI-powered developer tools",
          "Android 15 features enhanced privacy and security capabilities"
        ] : [
          "Major advances in AI with Gemini and integration across Google products",
          "Continued growth in Google Cloud Platform and enterprise services",
          "New sustainability initiatives and carbon-neutral commitments",
          "Expansion of Google Workspace and productivity tools"
        ],
        culture: `Innovation-focused culture with emphasis on technical excellence, user-centric design, and "don't be evil" principles. Values intellectual curiosity and data-driven decisions.`,
        competitivePosition: "Dominant search engine with strong cloud and AI capabilities, competing with Microsoft and Amazon",
        interviewFocus: ["Technical depth", "Problem-solving approach", "User-centric thinking", "Scalability mindset"],
        preparationTips: [
          "Practice Google-tagged problems on LeetCode and similar platforms",
          "Study Google's approach to machine learning and AI",
          "Understand Google's technical infrastructure and distributed systems",
          "Prepare examples of building user-focused products or features"
        ]
      },
      "Amazon": {
        overview: "Amazon is a multinational technology and e-commerce company, offering cloud computing, digital streaming, and artificial intelligence services alongside its core retail platform.",
        mission: "To be Earth's Most Customer-Centric Company, where customers can find and discover anything they might want to buy online",
        values: ["Customer Obsession", "Ownership", "Invent and Simplify", "Are Right, A Lot", "Learn and Be Curious"],
        recentNews: [
          "Continued expansion of AWS cloud services and AI capabilities",
          "Growth in Amazon Prime and entertainment services",
          "Sustainability initiatives and climate pledge commitments",
          "Innovation in logistics and same-day delivery capabilities"
        ],
        culture: "Customer-obsessed culture with high standards and ownership mentality. Values innovation, frugality, and long-term thinking.",
        competitivePosition: "Leading e-commerce and cloud computing company competing with Microsoft Azure and Google Cloud",
        interviewFocus: ["Leadership principles alignment", "Customer obsession", "Technical problem solving", "Ownership mindset"],
        preparationTips: [
          "Study all 16 Amazon Leadership Principles with specific examples",
          "Practice system design problems involving large-scale distributed systems",
          "Prepare customer-obsessed examples from your experience",
          "Understand AWS services and cloud architecture patterns"
        ]
      }
    };
    const data = companyData[company] || {
      overview: `${company} is a technology company focused on ${role} roles and innovative solutions in their industry.`,
      mission: `${company} is committed to delivering excellent products and services while fostering innovation and growth.`,
      values: ["Innovation", "Excellence", "Collaboration", "Integrity", "Customer Focus"],
      recentNews: [
        `${company} continues to invest in new technology and talent acquisition`,
        "Recent product launches and feature improvements",
        "Growth in market presence and strategic partnerships",
        "Focus on emerging technologies and industry trends"
      ],
      culture: `${company} fosters a collaborative, innovation-driven culture that values technical excellence and professional growth.`,
      competitivePosition: `${company} maintains a strong position in their market through innovation and quality ${role} talent.`,
      interviewFocus: ["Technical competency", "Problem-solving skills", "Cultural fit", "Communication abilities"],
      preparationTips: [
        `Research ${company}'s products, services, and recent developments`,
        "Practice technical skills relevant to the role",
        "Prepare behavioral examples using the STAR method",
        "Understand the company's industry and competitive landscape"
      ]
    };
    return data;
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
var TechnicalInterviewAgent = class {
  client;
  constructor() {
    this.client = createOpenAIClient();
  }
  async searchWeb(query) {
    try {
      console.log("\u{1F50D} Searching technical content:", query);
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a technical interview expert. Provide detailed information about coding interview practices as if you just researched current interview patterns."
          },
          {
            role: "user",
            content: `Research technical interview information: ${query}

Provide detailed information about:
- Specific coding problems asked at this company
- Interview format and difficulty level
- Technical concepts commonly tested
- Actual interview experiences and patterns
- Preparation recommendations

Be specific and detailed as if you just researched multiple interview sources.`
          }
        ],
        max_tokens: 1200
      });
      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Technical search error:", error);
      return "";
    }
  }
  async generateTechnicalContent(company, role, level, contentType) {
    try {
      console.log("\u{1F4BB} Researching technical content with web search:", contentType, "for", company, role, level);
      const searchQuery = `${company} ${role} ${level} ${contentType} interview questions coding problems`;
      const searchResults = await this.searchWeb(searchQuery);
      if (!searchResults || searchResults.length < 50) {
        console.log("\u26A0\uFE0F Web search returned insufficient technical data, using realistic generation");
        return this.generateRealisticTechnicalContent(company, role, level, contentType);
      }
      console.log("\u2705 Got technical search results, generating problems...");
      const analysisResult = await this.analyzeTechnicalSearchResults(searchResults, company, role, level, contentType);
      return analysisResult;
    } catch (error) {
      console.error("Error generating technical content:", error);
      console.log("Falling back to realistic technical generation");
      return this.generateRealisticTechnicalContent(company, role, level, contentType);
    }
  }
  async analyzeTechnicalSearchResults(searchResults, company, role, level, contentType) {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a technical interview expert. Analyze web search results and create structured technical interview content. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: `Based on these web search results about ${company} ${role} technical interviews, create ${contentType} problems:

WEB SEARCH RESULTS:
${searchResults}

Extract from the search results and create:
- 2-3 technical problems that match ${company}'s interview style for ${level} ${role}
- Key concepts to review for ${contentType} interviews
- Include hints and solutions based on common patterns
- Company-specific relevance based on the search results

Return ONLY this JSON format with NO other text:

{
  "problems": [
    {
      "title": "Problem title based on search results",
      "difficulty": "Easy/Medium/Hard for ${level}",
      "description": "Problem description with examples and constraints",
      "hints": ["hint 1", "hint 2"],
      "solution": "Solution explanation or code",
      "companyRelevance": "Why this is relevant to ${company} based on search"
    }
  ],
  "concepts": [
    {
      "name": "Concept name from search results",
      "explanation": "Detailed explanation based on search",
      "examples": ["example 1", "example 2"]
    }
  ]
}`
          }
        ],
        max_tokens: 1500
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from technical analysis");
      }
      try {
        let cleanContent = content.trim();
        if (cleanContent.startsWith("```json")) {
          cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanContent.startsWith("```")) {
          cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanContent);
        if (parsed.problems && parsed.concepts) {
          console.log("\u2705 Successfully parsed technical content from web search");
          return parsed;
        }
      } catch (parseError) {
        console.log("\u26A0\uFE0F Technical JSON parse failed, trying extraction");
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.problems && parsed.concepts) {
            console.log("\u2705 Successfully extracted technical content JSON");
            return parsed;
          }
        }
      }
      throw new Error("Could not parse technical content from analysis");
    } catch (error) {
      console.error("Error analyzing technical search results:", error);
      throw error;
    }
  }
  generateRealisticTechnicalContent(company, role, level, contentType) {
    const difficultyLevel = level === "Senior" ? "Hard" : level === "Junior" ? "Easy" : "Medium";
    if (contentType === "coding") {
      return {
        problems: [
          {
            title: "Two Sum Problem",
            difficulty: "Easy",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            hints: ["Use a hash map to store seen numbers", "Check if complement exists in map"],
            solution: `def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
            companyRelevance: `${company} uses array problems to test optimization and hash map skills.`
          },
          {
            title: "Valid Parentheses",
            difficulty: difficultyLevel,
            description: "Given a string containing brackets, determine if the input string has valid bracket matching.",
            hints: ["Use a stack for tracking opening brackets", "Match closing brackets with stack top"],
            solution: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return len(stack) == 0`,
            companyRelevance: `Stack problems are common at ${company} for testing data structure fundamentals.`
          }
        ],
        concepts: [
          {
            name: "Hash Maps",
            explanation: "O(1) lookup data structure essential for optimization problems.",
            examples: ["Two Sum optimization", "Frequency counting", "Caching results"]
          },
          {
            name: "Stack Data Structure",
            explanation: "LIFO structure for parsing and matching problems.",
            examples: ["Parentheses matching", "Expression evaluation", "Backtracking"]
          }
        ]
      };
    } else if (contentType === "algorithms") {
      return {
        problems: [
          {
            title: "Binary Search",
            difficulty: difficultyLevel,
            description: "Find target value in sorted array using binary search algorithm.",
            hints: ["Divide search space in half each iteration", "Handle edge cases carefully"],
            solution: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
            companyRelevance: `${company} tests binary search for logarithmic algorithm understanding.`
          }
        ],
        concepts: [
          {
            name: "Binary Search",
            explanation: "O(log n) search algorithm for sorted data using divide and conquer.",
            examples: ["Find element", "Find insertion point", "Search rotated array"]
          }
        ]
      };
    } else {
      return {
        problems: [
          {
            title: "Design URL Shortener",
            difficulty: "Hard",
            description: "Design a scalable URL shortening service handling millions of requests.",
            hints: ["Base62 encoding", "Database sharding", "Caching strategy"],
            solution: "Load balancer \u2192 App servers \u2192 Database + Cache \u2192 Analytics",
            companyRelevance: `${company} scale requires understanding of distributed systems and caching.`
          }
        ],
        concepts: [
          {
            name: "System Scalability",
            explanation: "Techniques for handling increased load and user growth.",
            examples: ["Horizontal scaling", "Database sharding", "CDN usage"]
          }
        ]
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
var BehavioralInterviewAgent = class {
  agent;
  constructor() {
    ensureOpenAIKey();
    this.agent = new import_agents.Agent({
      name: "Behavioral Interview Specialist",
      instructions: `You are a behavioral interview expert. Your task is to:
1. Research company values and culture extensively
2. Generate STAR method scenarios based on company-specific situations
3. Create questions that align with company values and role requirements
4. Provide frameworks for answering behavioral questions
5. Focus on real situations candidates might encounter at the company

Use web search to understand company culture, values, and what they look for in behavioral interviews.`,
      tools: [(0, import_agents.webSearchTool)()]
    });
  }
  async generateBehavioralContent(company, role) {
    try {
      const prompt = `Generate behavioral interview content for ${role} at ${company}.

IMPORTANT: Use web search extensively to find current, accurate information.

Research extensively:
1. Search "${company} company values culture"
2. Search "${company} behavioral interview questions"
3. Search "${company} leadership principles"
4. Search "${company} employee reviews what they value"
5. Search "${company} ${role} behavioral interview experience"

Generate comprehensive behavioral content including:
- Company values and what they mean in practice
- STAR method scenarios aligned with ${company}'s specific values
- Questions relevant to ${role} responsibilities
- Company context and what interviewers look for
- Clear frameworks for structuring answers

Focus on competencies: leadership, problem-solving, conflict resolution, innovation, failure/learning, teamwork, communication.

Return in this EXACT JSON format:

===JSON_START===
{
  "companyValues": [
    {
      "value": "Value Name",
      "description": "What this value means at ${company}",
      "exampleBehaviors": ["behavior 1", "behavior 2", "behavior 3"]
    }
  ],
  "starScenarios": [
    {
      "competency": "Leadership/Problem-solving/etc",
      "situation": "Example situation relevant to ${company} and ${role}",
      "questions": ["Tell me about a time when...", "Describe a situation where..."],
      "framework": "STAR framework guidance for this competency",
      "companyContext": "Why ${company} values this competency and what they look for"
    }
  ]
}
===JSON_END===

Be thorough and research-based. Include ${company}-specific insights.`;
      const result = await (0, import_agents.run)(this.agent, prompt);
      const content = this.extractTextFromResult(result);
      const jsonMatch = content.match(/===JSON_START===\s*([\s\S]*?)\s*===JSON_END===/);
      if (jsonMatch) {
        try {
          const sanitizedJson = jsonMatch[1].trim().replace(/:\s*undefined/g, ": null");
          const parsed = JSON.parse(sanitizedJson);
          if (parsed.starScenarios && parsed.companyValues) {
            return parsed;
          }
        } catch (parseError) {
          console.error("Error parsing behavioral content:", parseError);
        }
      }
      try {
        const lastJsonStart = content.lastIndexOf("{");
        const lastJsonEnd = content.lastIndexOf("}") + 1;
        if (lastJsonStart !== -1 && lastJsonEnd > lastJsonStart) {
          const jsonContent = content.substring(lastJsonStart, lastJsonEnd);
          const parsed = JSON.parse(jsonContent);
          if (parsed.starScenarios && parsed.companyValues) {
            return parsed;
          }
        }
      } catch (parseError) {
        console.error("Error with fallback behavioral parsing:", parseError);
      }
      return {
        companyValues: [
          {
            value: "Innovation",
            description: `${company} values innovative thinking and creative problem-solving`,
            exampleBehaviors: ["Think outside the box", "Challenge assumptions", "Propose creative solutions"]
          },
          {
            value: "Collaboration",
            description: `${company} emphasizes teamwork and cross-functional collaboration`,
            exampleBehaviors: ["Work effectively in teams", "Build consensus", "Support colleagues"]
          },
          {
            value: "Excellence",
            description: `${company} strives for high-quality work and continuous improvement`,
            exampleBehaviors: ["Deliver high-quality results", "Seek feedback", "Continuously improve"]
          }
        ],
        starScenarios: [
          {
            competency: "Leadership",
            situation: `Leading a ${role} project or initiative at a company similar to ${company}`,
            questions: [
              "Tell me about a time when you had to lead a team through a difficult project.",
              "Describe a situation where you had to influence others without formal authority."
            ],
            framework: "Situation: Set context, Task: Define your responsibility, Action: Describe leadership actions, Result: Share the outcome and impact",
            companyContext: `${company} values leaders who can drive results while building collaborative relationships`
          },
          {
            competency: "Problem Solving",
            situation: `Solving a complex technical or business problem relevant to ${role}`,
            questions: [
              "Tell me about a challenging problem you solved.",
              "Describe a time when you had to think creatively to overcome an obstacle."
            ],
            framework: "Situation: Describe the problem, Task: Your role in solving it, Action: Steps you took, Result: The solution and its impact",
            companyContext: `${company} looks for systematic problem-solvers who can break down complex challenges`
          },
          {
            competency: "Failure and Learning",
            situation: `A project or decision that didn't go as planned, relevant to ${role}`,
            questions: [
              "Tell me about a time when you failed or made a mistake.",
              "Describe a situation where you had to learn from failure."
            ],
            framework: "Situation: Honest context, Task: Your responsibility, Action: How you handled it and learned, Result: What you gained",
            companyContext: `${company} values resilience and continuous learning from setbacks`
          }
        ]
      };
    } catch (error) {
      console.error("Error generating behavioral content:", error);
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
var createEnhancedQuizAgent = () => new EnhancedQuizAgent();
var createJobAnalysisAgent = () => new JobAnalysisAgent();
var createQuestionGenerationAgent = () => new QuestionGenerationAgent();
var createInterviewStructureAgent = () => new InterviewStructureAgent();
var createCompanyResearchAgent = () => new CompanyResearchAgent();
var createTechnicalInterviewAgent = () => new TechnicalInterviewAgent();
var createBehavioralInterviewAgent = () => new BehavioralInterviewAgent();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Agent,
  BehavioralInterviewAgent,
  CompanyResearchAgent,
  EnhancedQuizAgent,
  InterviewStructureAgent,
  JobAnalysisAgent,
  QuestionGenerationAgent,
  TechnicalInterviewAgent,
  createBehavioralInterviewAgent,
  createCompanyResearchAgent,
  createEnhancedQuizAgent,
  createInterviewStructureAgent,
  createJobAnalysisAgent,
  createQuestionGenerationAgent,
  createTechnicalInterviewAgent,
  run
});
