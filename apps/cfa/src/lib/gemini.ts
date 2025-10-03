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

// XML-based streaming for real-time component rendering
export async function* generateStreamingQuestion(prompt: string, model: string = 'gemini-2.5-flash-lite'): AsyncGenerator<{
  type: 'thinking' | 'question_text' | 'option' | 'explanation' | 'complete',
  content: string,
  optionIndex?: number,
  correct?: number
}> {
  try {
    const enhancedPrompt = `${prompt}

CRITICAL: Format your response as XML for streaming. Think briefly, then provide the question in this EXACT format:

<thinking>Brief explanation of your approach to this question</thinking>
<question>The question text here</question>
<option correct="true">Option A text</option>
<option correct="false">Option B text</option>
<option correct="false">Option C text</option>
<explanation>Detailed explanation of why the correct answer is right and others are wrong</explanation>

Use this XML format exactly. Do not include any other text or formatting.`;

    let accumulatedText = '';
    let inThinking = false;
    let inQuestion = false;
    let inExplanation = false;
    let optionCount = 0;
    let correctAnswerIndex = -1;
    
    for await (const chunk of generateStreamingText(enhancedPrompt, model)) {
      accumulatedText += chunk;
      
      // Parse thinking section
      if (accumulatedText.includes('<thinking>') && !inThinking) {
        inThinking = true;
      }
      if (inThinking && accumulatedText.includes('</thinking>')) {
        const thinkingMatch = accumulatedText.match(/<thinking>([\s\S]*?)<\/thinking>/);
        if (thinkingMatch) {
          yield { type: 'thinking', content: thinkingMatch[1].trim() };
          inThinking = false;
        }
      }
      
      // Parse question text
      if (accumulatedText.includes('<question>') && !inQuestion) {
        inQuestion = true;
      }
      if (inQuestion && accumulatedText.includes('</question>')) {
        const questionMatch = accumulatedText.match(/<question>([\s\S]*?)<\/question>/);
        if (questionMatch) {
          yield { type: 'question_text', content: questionMatch[1].trim() };
          inQuestion = false;
        }
      }
      
      // Parse options one by one
      const optionMatches = accumulatedText.match(/<option correct="(true|false)">([\s\S]*?)<\/option>/g);
      if (optionMatches && optionMatches.length > optionCount) {
        for (let i = optionCount; i < optionMatches.length; i++) {
          const optionMatch = optionMatches[i].match(/<option correct="(true|false)">([\s\S]*?)<\/option>/);
          if (optionMatch) {
            const isCorrect = optionMatch[1] === 'true';
            if (isCorrect) {
              correctAnswerIndex = i;
            }
            yield { 
              type: 'option', 
              content: optionMatch[2].trim(), 
              optionIndex: i,
              correct: correctAnswerIndex 
            };
            optionCount++;
          }
        }
      }
      
      // Parse explanation
      if (accumulatedText.includes('<explanation>') && !inExplanation) {
        inExplanation = true;
      }
      if (inExplanation && accumulatedText.includes('</explanation>')) {
        const explanationMatch = accumulatedText.match(/<explanation>([\s\S]*?)<\/explanation>/);
        if (explanationMatch) {
          yield { 
            type: 'explanation', 
            content: explanationMatch[1].trim(),
            correct: correctAnswerIndex
          };
          inExplanation = false;
          
          // Signal completion
          yield { 
            type: 'complete', 
            content: 'Question generation complete',
            correct: correctAnswerIndex
          };
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('Error in streaming question generation:', error);
    throw error;
  }
}
