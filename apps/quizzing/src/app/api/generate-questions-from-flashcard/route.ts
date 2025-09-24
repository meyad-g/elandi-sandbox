import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { flashcard, count = 3, difficulty = 'medium' } = await request.json();

    if (!flashcard || !flashcard.title || !flashcard.content) {
      return NextResponse.json(
        { error: 'Flashcard with title and content is required' },
        { status: 400 }
      );
    }

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
            content: `You are creating quiz questions based on flashcard content. Generate ONLY a JSON array of questions, no other text.`
          },
          {
            role: 'user',
            content: `Based on this flashcard, generate ${count} related true/false questions for deeper learning:

Flashcard Topic: ${flashcard.title}
Flashcard Content: ${flashcard.content}
Skill: ${flashcard.skill}
Difficulty: ${difficulty}

Requirements:
- Create questions that dive deeper into the topic
- Cover different aspects mentioned in the flashcard content
- Mix of true/false answers (not all the same)
- ${difficulty} difficulty level appropriate for interviews
- Include educational explanations
- Questions should help reinforce and expand on the flashcard knowledge

Return this exact JSON format (array of ${count} questions):
[
  {
    "text": "Question 1 about the topic?",
    "answer": true/false,
    "why": "Educational explanation that adds to the flashcard knowledge",
    "skill": "${flashcard.skill}",
    "relatedTo": "${flashcard.title}"
  },
  {
    "text": "Question 2 about another aspect?",
    "answer": true/false,
    "why": "Another educational explanation",
    "skill": "${flashcard.skill}",
    "relatedTo": "${flashcard.title}"
  }
]`
          }
        ],
        temperature: 0.8,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      // Parse the JSON array response
      const questions = JSON.parse(content);
      
      // Validate that we got an array
      if (!Array.isArray(questions)) {
        throw new Error('Expected an array of questions');
      }

      // Validate each question has required fields
      const validQuestions = questions.filter(q => 
        q.text && typeof q.answer === 'boolean' && q.why && q.skill
      );

      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }

      return NextResponse.json({ questions: validQuestions });

    } catch (parseError) {
      console.error('Error parsing questions:', parseError);
      
      // Fallback to generating individual questions
      const fallbackQuestions = [];
      for (let i = 0; i < count; i++) {
        fallbackQuestions.push({
          text: `What is a key aspect of ${flashcard.title} in ${flashcard.skill}?`,
          answer: true,
          why: `${flashcard.title} is an important concept in ${flashcard.skill} with multiple key aspects to understand.`,
          skill: flashcard.skill,
          relatedTo: flashcard.title
        });
      }
      
      return NextResponse.json({ questions: fallbackQuestions });
    }

  } catch (error) {
    console.error('Error generating questions from flashcard:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to generate questions from flashcard'
      },
      { status: 500 }
    );
  }
}
