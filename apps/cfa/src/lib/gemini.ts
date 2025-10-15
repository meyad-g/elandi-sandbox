import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Streaming text generation with Gemini using proper streaming API
export async function* generateStreamingText(prompt: string, model: string = 'gemini-2.5-flash-lite') {
  try {
    const genAI = getGeminiClient();
    const geminiModel = genAI.getGenerativeModel({ model });
    
    const result = await geminiModel.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error('Error in Gemini streaming:', error);
    throw error;
  }
}

// Non-streaming text generation 
export async function generateText(prompt: string, model: string = 'gemini-2.5-flash-lite'): Promise<string> {
  try {
    const genAI = getGeminiClient();
    const geminiModel = genAI.getGenerativeModel({ model });
    
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in Gemini generation:', error);
    throw error;
  }
}

// JSON generation with validation
export async function generateJSON<T>(prompt: string, model: string = 'gemini-2.5-flash-lite'): Promise<T> {
  try {
    const enhancedPrompt = `${prompt}

CRITICAL: Return ONLY valid JSON, no markdown, no explanations, no extra text. The response must start with { and end with }.`;

    const text = await generateText(enhancedPrompt, model);
    
    // Extract JSON from response (handle cases where model adds extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error parsing JSON from Gemini:', error);
    throw error;
  }
}

// Simplified JSON-based streaming for reliable question generation
export async function* generateStreamingQuestion(prompt: string, model: string = 'gemini-2.5-flash-lite'): AsyncGenerator<{
  type: 'thinking' | 'question_text' | 'option' | 'explanation' | 'complete',
  content: string,
  optionIndex?: number,
  correct?: number
}> {
  try {
    const enhancedPrompt = `${prompt}

INSTRUCTIONS: Generate a multiple choice question and return ONLY valid JSON in this exact format:

{
  "question": "Your question text here?",
  "options": ["Option A", "Option B", "Option C"],
  "correct": 0
}

REQUIREMENTS:
- Use varied question starters (avoid "What is the primary...")
- Return ONLY the JSON object above
- No markdown formatting, no extra text
- Make sure the JSON is valid and complete`;

    let accumulatedText = '';
    let isComplete = false;
    
    for await (const chunk of generateStreamingText(enhancedPrompt, model)) {
      accumulatedText += chunk;
      
      // Clean accumulated text - remove markdown formatting if present
      const cleanText = accumulatedText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^[^{]*/, '') // Remove any text before first {
        .trim();
      
      // Look for complete JSON object - try multiple patterns
      let jsonStr = null;
      
      // Pattern 1: Standard JSON object
      const jsonMatch1 = cleanText.match(/\{[\s\S]*?\}/);
      if (jsonMatch1) {
        jsonStr = jsonMatch1[0];
      }
      
      // Pattern 2: Look for balanced braces (more robust)
      if (!jsonStr) {
        let braceCount = 0;
        const startIndex = cleanText.indexOf('{');
        if (startIndex !== -1) {
          for (let i = startIndex; i < cleanText.length; i++) {
            if (cleanText[i] === '{') braceCount++;
            if (cleanText[i] === '}') braceCount--;
            if (braceCount === 0) {
              jsonStr = cleanText.substring(startIndex, i + 1);
              break;
            }
          }
        }
      }
      
      if (jsonStr && !isComplete) {
        try {
          console.log('🔍 Attempting to parse JSON:', jsonStr.substring(0, 100) + '...');
          const parsedQuestion = JSON.parse(jsonStr);
          
          // Validate the parsed question has required fields
          if (parsedQuestion.question && parsedQuestion.options && Array.isArray(parsedQuestion.options) && 
              typeof parsedQuestion.correct === 'number') {
            
            // Emit thinking phase (simulated)
            yield { 
              type: 'thinking', 
              content: 'Generating question based on style requirements and topic focus...'
            };
            
            // Emit question text
            yield { 
              type: 'question_text', 
              content: parsedQuestion.question.trim()
            };
            
            // Emit each option
            for (let i = 0; i < parsedQuestion.options.length; i++) {
              yield {
                type: 'option',
                content: parsedQuestion.options[i].trim(),
                optionIndex: i,
                correct: parsedQuestion.correct
              };
            }
            
            // Emit completion
            yield {
              type: 'complete',
              content: 'Question generation complete',
              correct: parsedQuestion.correct
            };
            
            isComplete = true;
            break;
          }
        } catch (parseError) {
          console.log('🔍 JSON parse error:', parseError, 'Raw text length:', accumulatedText.length);
          // Continue accumulating if JSON is not yet complete
          continue;
        }
      }
    }
    
    // Fallback if no valid JSON was generated - try one more time with full text
    if (!isComplete) {
      console.log('🚨 No valid JSON found in accumulated text. Raw response:', accumulatedText.substring(0, 500));
      
      // Try to extract JSON from the full accumulated text as last resort
      try {
        const finalJsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
        if (finalJsonMatch) {
          const parsed = JSON.parse(finalJsonMatch[0]);
          if (parsed.question && parsed.options && Array.isArray(parsed.options)) {
            console.log('🎯 Recovered JSON from full text!');
            
            yield { type: 'thinking', content: 'Processing question generation...' };
            yield { type: 'question_text', content: parsed.question };
            
            for (let i = 0; i < parsed.options.length; i++) {
              yield {
                type: 'option',
                content: parsed.options[i],
                optionIndex: i,
                correct: parsed.correct || 0
              };
            }
            
            yield { type: 'complete', content: 'Question generation complete', correct: parsed.correct || 0 };
            return;
          }
        }
      } catch (finalError) {
        console.log('🚨 Final JSON recovery also failed:', finalError);
      }
      
      // Last resort fallback - generate a basic question
      console.log('🚨 Generating fallback question due to JSON parsing failure');
      yield { type: 'thinking', content: 'Generating fallback question due to parsing issues...' };
      yield { type: 'question_text', content: 'What is a key characteristic of dimensional data modeling?' };
      yield { type: 'option', content: 'A) It uses only normalized tables', optionIndex: 0, correct: 1 };
      yield { type: 'option', content: 'B) It employs star and snowflake schemas', optionIndex: 1, correct: 1 };
      yield { type: 'option', content: 'C) It requires real-time processing', optionIndex: 2, correct: 1 };
      yield { type: 'complete', content: 'Fallback question generated', correct: 1 };
    }
    
  } catch (error) {
    console.error('Error in streaming question generation:', error);
    
    // Fallback to non-streaming generation
    console.log('🔄 Attempting non-streaming fallback...');
    try {
      const fallbackResult = await generateJSON<{
        question: string;
        options: string[];
        correct: number;
      }>(enhancedPrompt);
      
      if (fallbackResult.question && fallbackResult.options && Array.isArray(fallbackResult.options)) {
        yield { type: 'thinking', content: 'Using non-streaming fallback generation...' };
        yield { type: 'question_text', content: fallbackResult.question };
        
        for (let i = 0; i < fallbackResult.options.length; i++) {
          yield {
            type: 'option',
            content: fallbackResult.options[i],
            optionIndex: i,
            correct: fallbackResult.correct || 0
          };
        }
        
        yield { type: 'complete', content: 'Question generated via fallback', correct: fallbackResult.correct || 0 };
        return;
      }
    } catch (fallbackError) {
      console.error('Fallback generation also failed:', fallbackError);
    }
    
    throw error;
  }
}

// Non-streaming question generation as a reliable backup
export async function generateQuestionDirect(prompt: string, model: string = 'gemini-2.5-flash-lite'): Promise<{
  question: string;
  options: string[];
  correct: number;
}> {
  const simplePrompt = `${prompt}

Generate a multiple choice question. Return ONLY this JSON format:

{
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C"],
  "correct": 0
}

No markdown, no extra text, just valid JSON.`;

  return await generateJSON<{
    question: string;
    options: string[];
    correct: number;
  }>(simplePrompt, model);
}
