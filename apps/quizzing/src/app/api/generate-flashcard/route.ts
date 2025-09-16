import { NextRequest, NextResponse } from 'next/server';

// Type definitions for the flashcard API

export async function POST(request: NextRequest) {
  try {
    const { skill, previousCards = [] } = await request.json();
    console.log('📚 FLASHCARD API: Generating flashcard for skill:', skill);
    console.log('📚 FLASHCARD API: Previous cards:', previousCards.length);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill is required' },
        { status: 400 }
      );
    }

    // Build previous cards context to avoid repeats
    const previousCardsText = previousCards.length > 0 
      ? `\n\nPrevious cards created (DO NOT repeat these topics):\n${previousCards.map((c, i) => `${i + 1}. ${c.title}`).join('\n')}`
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
            content: `You are a technical interview coach creating educational flashcards. Generate ONLY a JSON object, no other text.`
          },
          {
            role: 'user',
            content: `Create 1 interview knowledge flashcard about ${skill}.

Requirements:
- Focus on practical knowledge needed for job interviews
- Cover key concepts, best practices, common pitfalls, or important details
- Make it educational and informative, not a question
- Include clear explanations that help someone learn
- Title should be concise and NOT include the skill name (it's already implied)
- Return ONLY the JSON object, no extra text or markdown

Examples of good flashcards:
- Title: "useEffect Hook" (not "React useEffect Hook")
- Title: "Global Interpreter Lock" (not "Python GIL")
- Title: "Memory Management" (not "C++ Memory Management")
- Title: "Gradient Descent" (not "Machine Learning Gradient Descent")

Content examples:
- "Runs after every render by default. Use dependency array to control when it runs. Empty array [] means run only once. Return cleanup function for subscriptions."
- "Prevents multiple threads from executing bytecode simultaneously. Affects CPU-bound tasks but not I/O-bound. Use multiprocessing for CPU parallelism."
- "Speeds up SELECT queries but slows INSERT/UPDATE/DELETE. B-tree indexes are most common. Composite indexes should match query patterns (leftmost prefix rule)."

${previousCardsText}

Return this exact JSON format:
{"title": "Concise Topic Name", "content": "Detailed explanation with key points, best practices, and interview-relevant details", "skill": "${skill}", "tags": ["tag1", "tag2", "tag3"]}`
          }
        ],
        temperature: 0.8,
        max_tokens: 400,
        stream: true
      }),
    });

    console.log('📚 FLASHCARD API: OpenAI response status:', response.status);

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
          let streamingTitle = '';

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim() && line.startsWith('data: '));

              for (const line of lines) {
                const data = line.replace('data: ', '');
                
                if (data === '[DONE]') {
                  console.log('📚 FLASHCARD API: Stream complete');
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  
                  if (content) {
                    accumulatedContent += content;
                    console.log('📚 FLASHCARD API: Got content:', content);

                    // Try to extract title for streaming
                    const titleMatch = accumulatedContent.match(/"title"\s*:\s*"([^"]*)/);
                    if (titleMatch) {
                      const currentTitle = titleMatch[1];
                      if (currentTitle !== streamingTitle) {
                        const newChars = currentTitle.slice(streamingTitle.length);
                        if (newChars) {
                          streamingTitle = currentTitle;
                          controller.enqueue(encoder.encode(JSON.stringify({
                            type: 'chunk',
                            content: newChars
                          }) + '\n'));
                        }
                      }
                    }
                  }
                } catch (parseError) {
                  console.log('📚 FLASHCARD API: Parse error (expected):', parseError.message);
                }
              }
            }

            // Try to parse the complete JSON
            try {
              const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const flashcard = JSON.parse(jsonMatch[0]);
                console.log('📚 FLASHCARD API: Final flashcard:', flashcard);
                
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'complete',
                  content: flashcard
                }) + '\n'));
              } else {
                throw new Error('No valid JSON found in response');
              }
            } catch (error) {
              console.error('📚 FLASHCARD API: Error parsing final JSON:', error);
              // Fallback flashcard
              const fallbackCard = {
                title: `Key ${skill} Concept`,
                content: `${skill} is an important technology with many key concepts to understand for interviews.`,
                skill: skill,
                tags: [skill.toLowerCase(), 'interview', 'basics']
              };
              
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'complete',
                content: fallbackCard
              }) + '\n'));
            }
          }

          controller.close();
        } catch (error) {
          console.error('📚 FLASHCARD API: Streaming error:', error);
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
    console.error('📚 FLASHCARD API: Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate flashcard'
      },
      { status: 500 }
    );
  }
}
