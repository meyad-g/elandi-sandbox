import { NextRequest, NextResponse } from 'next/server';

// Type definitions for the question API - using imported Question type

export async function POST(request: NextRequest) {
  try {
    const { skill, previousQuestions = [] } = await request.json();
    console.log('🔥 SIMPLE API: Generating question for skill:', skill);
    console.log('🔥 SIMPLE API: Previous questions:', previousQuestions.length);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill is required' },
        { status: 400 }
      );
    }

    // Build previous questions context to avoid repeats
    const previousQuestionsText = previousQuestions.length > 0 
      ? `\n\nPrevious questions asked (DO NOT repeat these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q.text}`).join('\n')}`
      : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a technical interviewer creating challenging true/false questions. Generate ONLY a JSON object, no other text.`
          },
          {
            role: 'user',
            content: `Generate 1 challenging true/false question about ${skill}.

Requirements:
- Create a specific, practical question that tests real understanding
- Focus on common misconceptions, best practices, or technical details  
- Mix true and false answers (randomly distribute - don't always make it true)
- Make it job-interview level difficulty
- Include a clear, educational explanation that teaches something valuable
- Return ONLY the JSON object, no extra text or markdown

Examples of good questions:
- "In PyTorch, gradients are automatically zeroed after each backward pass?" (False - you must manually zero them)
- "React components re-render every time their parent component re-renders?" (True - unless memoized)
- "In Python, 'is' and '==' always return the same result for strings?" (False - 'is' checks identity, '==' checks value)

${previousQuestionsText}

Return this exact JSON format:
{"text": "Your specific question here?", "answer": true/false, "why": "Detailed explanation here", "skill": "${skill}"}`
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
        stream: true
      }),
    });

    console.log('🔥 SIMPLE API: OpenAI response status:', response.status);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Handle streaming response
    const encoder = new TextEncoder();
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let accumulatedContent = '';
          let streamingText = '';

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim() && line.startsWith('data: '));

              for (const line of lines) {
                const data = line.replace('data: ', '');
                
                if (data === '[DONE]') {
                  console.log('🔥 SIMPLE API: Stream complete');
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  
                  if (content) {
                    accumulatedContent += content;
                    console.log('🔥 SIMPLE API: Got content:', content);

                    // Try to extract question text for streaming
                    const textMatch = accumulatedContent.match(/"text"\s*:\s*"([^"]*)/);
                    if (textMatch) {
                      const questionText = textMatch[1];
                      if (questionText !== streamingText) {
                        const newChars = questionText.slice(streamingText.length);
                        if (newChars) {
                          streamingText = questionText;
                          controller.enqueue(encoder.encode(JSON.stringify({
                            type: 'chunk',
                            content: newChars
                          }) + '\n'));
                        }
                      }
                    }
                  }
                } catch (parseError) {
                  console.log('🔥 SIMPLE API: Parse error (expected):', parseError.message);
                }
              }
            }

            // Try to parse the complete JSON
            try {
              const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const question = JSON.parse(jsonMatch[0]);
                console.log('🔥 SIMPLE API: Final question:', question);
                
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'complete',
                  content: question
                }) + '\n'));
              } else {
                throw new Error('No valid JSON found in response');
              }
            } catch (error) {
              console.error('🔥 SIMPLE API: Error parsing final JSON:', error);
              // Fallback question
              const fallbackQuestion = {
                text: `What is a key concept in ${skill}?`,
                answer: true,
                why: `${skill} is an important skill with many key concepts.`,
                skill: skill
              };
              
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'complete',
                content: fallbackQuestion
              }) + '\n'));
            }
          }

          controller.close();
        } catch (error) {
          console.error('🔥 SIMPLE API: Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('🔥 SIMPLE API: Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate question'
      },
      { status: 500 }
    );
  }
}
