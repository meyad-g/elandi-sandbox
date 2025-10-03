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
<option correct="true">A) Option A text</option>
<option correct="false">B) Option B text</option>
<option correct="false">C) Option C text</option>
<explanation>Detailed explanation of why the correct answer is right and others are wrong</explanation>

IMPORTANT: 
- Do NOT include XML tags in the question text itself
- The question should be clean text without any XML markup
- Options should contain only the option text, not the XML structure
- Each section should be properly separated with the XML tags
- Use this XML format exactly. Do not include any other text or formatting.`;

    let accumulatedText = '';
    let processedSections = {
      thinking: false,
      question: false,
      explanation: false
    };
    let optionCount = 0;
    let correctAnswerIndex = -1;
    
    for await (const chunk of generateStreamingText(enhancedPrompt, model)) {
      accumulatedText += chunk;
      
      // Clean up and validate the accumulated text
      // Remove any extraneous content before the first XML tag
      const xmlStartMatch = accumulatedText.match(/(<thinking>|<question>|<option|<explanation>)/);
      if (xmlStartMatch) {
        const xmlStartIndex = xmlStartMatch.index || 0;
        if (xmlStartIndex > 0) {
          accumulatedText = accumulatedText.substring(xmlStartIndex);
        }
      }
      
      // Parse thinking section
      if (accumulatedText.includes('<thinking>') && accumulatedText.includes('</thinking>') && !processedSections.thinking) {
        const thinkingMatch = accumulatedText.match(/<thinking>([\s\S]*?)<\/thinking>/);
        if (thinkingMatch) {
          const thinkingContent = thinkingMatch[1].trim();
          // Ensure thinking content doesn't contain XML tags
          if (!thinkingContent.includes('<') && !thinkingContent.includes('>')) {
            yield { type: 'thinking', content: thinkingContent };
            processedSections.thinking = true;
          }
        }
      }
      
      // Parse question text
      if (accumulatedText.includes('<question>') && accumulatedText.includes('</question>') && !processedSections.question) {
        const questionMatch = accumulatedText.match(/<question>([\s\S]*?)<\/question>/);
        if (questionMatch) {
          let questionContent = questionMatch[1].trim();
          // Clean any XML that might have leaked into the question text
          questionContent = questionContent.replace(/<[^>]*>/g, '').trim();
          if (questionContent && questionContent.length > 10) { // Ensure it's a substantial question
            yield { type: 'question_text', content: questionContent };
            processedSections.question = true;
          }
        }
      }
      
      // Parse options one by one
      const optionMatches = accumulatedText.match(/<option correct="(true|false)"[^>]*>([\s\S]*?)<\/option>/g);
      if (optionMatches && optionMatches.length > optionCount) {
        for (let i = optionCount; i < optionMatches.length; i++) {
          const optionMatch = optionMatches[i].match(/<option correct="(true|false)"[^>]*>([\s\S]*?)<\/option>/);
          if (optionMatch) {
            const isCorrect = optionMatch[1] === 'true';
            let optionContent = optionMatch[2].trim();
            
            // Clean any XML that might have leaked into the option text
            optionContent = optionContent.replace(/<[^>]*>/g, '').trim();
            
            if (optionContent && optionContent.length > 2) { // Ensure it's a meaningful option
              if (isCorrect) {
                correctAnswerIndex = i;
              }
              yield { 
                type: 'option', 
                content: optionContent, 
                optionIndex: i,
                correct: correctAnswerIndex 
              };
              optionCount++;
            }
          }
        }
      }
      
      // Parse explanation
      if (accumulatedText.includes('<explanation>') && accumulatedText.includes('</explanation>') && !processedSections.explanation) {
        const explanationMatch = accumulatedText.match(/<explanation>([\s\S]*?)<\/explanation>/);
        if (explanationMatch) {
          let explanationContent = explanationMatch[1].trim();
          
          // Try to parse structured explanation
          const correctAnswerMatch = explanationContent.match(/<correct_answer>([\s\S]*?)<\/correct_answer>/);
          const wrongAnswersMatch = explanationContent.match(/<wrong_answers>([\s\S]*?)<\/wrong_answers>/);
          
          if (correctAnswerMatch && wrongAnswersMatch) {
            // Parse structured explanation
            const correctReasonMatch = correctAnswerMatch[1].match(/<reason>([\s\S]*?)<\/reason>/);
            const correctOptionMatch = correctAnswerMatch[1].match(/<option>([\s\S]*?)<\/option>/);
            
            const wrongOptions = [...wrongAnswersMatch[1].matchAll(/<wrong_option>([\s\S]*?)<\/wrong_option>/g)];
            
            if (correctReasonMatch && correctOptionMatch) {
              // Build formatted explanation
              let formattedExplanation = `✓ **${correctOptionMatch[1].trim()}** is correct: ${correctReasonMatch[1].trim()}\n\n`;
              
              if (wrongOptions.length > 0) {
                formattedExplanation += '✗ **Why others are wrong:**\n';
                wrongOptions.forEach(wrongMatch => {
                  const wrongOptionMatch = wrongMatch[1].match(/<option>([\s\S]*?)<\/option>/);
                  const wrongReasonMatch = wrongMatch[1].match(/<reason>([\s\S]*?)<\/reason>/);
                  if (wrongOptionMatch && wrongReasonMatch) {
                    formattedExplanation += `• **${wrongOptionMatch[1].trim()}**: ${wrongReasonMatch[1].trim()}\n`;
                  }
                });
              }
              
              explanationContent = formattedExplanation.trim();
            }
          } else {
            // Clean any XML that might have leaked into the explanation
            explanationContent = explanationContent.replace(/<[^>]*>/g, '').trim();
          }
          
          if (explanationContent && explanationContent.length > 10) { // Ensure substantial explanation
            yield { 
              type: 'explanation', 
              content: explanationContent,
              correct: correctAnswerIndex
            };
            processedSections.explanation = true;
            
            // Signal completion if we have all required components
            if (processedSections.thinking && processedSections.question && optionCount >= 2) {
              yield { 
                type: 'complete', 
                content: 'Question generation complete',
                correct: correctAnswerIndex
              };
              break;
            }
          }
        }
      }
    }
    
    // If we haven't completed but have essential components, force completion
    if (!processedSections.explanation && processedSections.question && optionCount >= 2) {
      yield { 
        type: 'complete', 
        content: 'Question generation complete',
        correct: correctAnswerIndex
      };
    }
    
  } catch (error) {
    console.error('Error in streaming question generation:', error);
    throw error;
  }
}
