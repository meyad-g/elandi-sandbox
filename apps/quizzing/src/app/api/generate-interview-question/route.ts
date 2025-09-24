import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { skill, stage, company, role, previousQuestions = [] } = await request.json();

    if (!skill || !stage) {
      return NextResponse.json(
        { error: 'Skill and interview stage are required' },
        { status: 400 }
      );
    }

    // Build context for interview-focused questions
    const stageContext = {
      'screening': 'Initial HR/recruiter screening focused on background and basic fit',
      'technical': 'Technical deep-dive with coding challenges and technical concepts',
      'system-design': 'System design and architecture discussions for senior roles',
      'behavioral': 'Soft skills, cultural fit, and situational questions',
      'final': 'Strategic thinking and leadership assessment with senior team'
    };

    const questionStyles = {
      'screening': 'basic conceptual questions to verify knowledge',
      'technical': 'practical coding and implementation focused questions',
      'system-design': 'architecture and scalability focused questions',
      'behavioral': 'situation-based questions about teamwork and problem-solving',
      'final': 'strategic and advanced concept questions'
    };

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
            content: `You are creating interview-specific true/false questions for job candidates. Generate ONLY a JSON object, no other text.`
          },
          {
            role: 'user',
            content: `Generate 1 interview-focused true/false question about ${skill} for the ${stage} stage.

Context:
- Company: ${company || 'Tech company'}
- Role: ${role || 'Technical role'}
- Interview Stage: ${stage}
- Stage Focus: ${stageContext[stage as keyof typeof stageContext] || 'Technical assessment'}

Requirements:
- Create a ${questionStyles[stage as keyof typeof questionStyles] || 'technical'} question
- Make it realistic for what would be asked in a ${stage} interview
- Focus on practical knowledge that interviewers actually test
- Mix true and false answers randomly
- Include interview-relevant explanation
- Make it appropriate for the specific interview stage context

Examples by stage:
Screening: "Most modern web frameworks follow the MVC pattern?" (True/False with basic explanation)
Technical: "In React, useState triggers a re-render even if the new value equals the current value?" (False - React bails out)
System-design: "Load balancers can only distribute requests using round-robin algorithm?" (False - many algorithms available)
Behavioral: "The best way to handle conflicting requirements is to escalate immediately to management?" (False - try direct communication first)
Final: "Microservices architecture is always better than monolithic architecture for scalability?" (False - depends on context)

${previousQuestionsText}

Return this exact JSON format:
{"text": "Your interview-style question here?", "answer": true/false, "why": "Interview-relevant explanation that shows understanding", "skill": "${skill}", "stage": "${stage}"}`
          }
        ],
        temperature: 0.8,
        max_tokens: 600,
        stream: true
      }),
    });

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
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  
                  if (content) {
                    accumulatedContent += content;

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
                } catch {
                  // Expected during streaming
                }
              }
            }

            // Try to parse the complete JSON
            try {
              const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const question = JSON.parse(jsonMatch[0]);
                
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'complete',
                  content: question
                }) + '\n'));
              } else {
                throw new Error('No valid JSON found in response');
              }
            } catch (error) {
              console.error('Error parsing final JSON:', error);
              // Fallback question
              const fallbackQuestion = {
                text: `In ${skill}, what is considered a best practice for ${stage} interviews?`,
                answer: true,
                why: `${skill} has several best practices that are commonly discussed in ${stage} interviews.`,
                skill: skill,
                stage: stage
              };
              
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'complete',
                content: fallbackQuestion
              }) + '\n'));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
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
    console.error('Error generating interview question:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate interview question'
      },
      { status: 500 }
    );
  }
}
