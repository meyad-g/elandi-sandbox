'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Brain, 
  FileQuestion, 
  Search, 
  MessageSquare, 
  FileText,
  Sparkles,
  Loader2,
  CheckCircle,
  Copy,
  Save,
  Download,
  RefreshCw
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  avatar: string;
  year: string;
  board: string;
  exams: string[];
  nextDeadlines: string[];
  currentGaps: string[];
  lastLessonSummary: string;
  upcomingObjective: string;
}

interface Session {
  id: string;
  time: string;
  studentId: string;
  student: string;
  subject: string;
  board: string;
  location: string;
  status: 'active' | 'upcoming' | 'completed';
}

interface SmartPrepResultsProps {
  prepType: string;
  student: Student;
  session: Session;
  onClose: () => void;
}

type StreamingState = 'thinking' | 'generating' | 'complete' | 'error';

export function SmartPrepResults({ prepType, student, session, onClose }: SmartPrepResultsProps) {
  const [streamingState, setStreamingState] = useState<StreamingState>('thinking');
  const [thinkingText, setThinkingText] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setStreamingState('thinking');
    setThinkingText('');
    setGeneratedContent(null);

    // Build smart context from what we already know
    const smartContext = buildSmartContext();

    try {
      const response = await fetch('/api/tutor/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: prepType,
          description: smartContext.description,
          examBoard: smartContext.examBoard,
          topic: smartContext.topic,
          level: smartContext.level,
          timeBox: smartContext.timeBox,
          calculatorAllowed: smartContext.calculatorAllowed,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'thinking') {
                setThinkingText(prev => prev + data.content);
              } else if (data.type === 'result') {
                setStreamingState('complete');
                setGeneratedContent(data.content);
              } else if (data.type === 'error') {
                setStreamingState('error');
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setStreamingState('error');
    }
  };

  const buildSmartContext = () => {
    // Use everything we already know about the student and session
    const primaryGap = student.currentGaps?.[0] || student.current_gaps?.[0] || 'general concepts';
    const subject = session.subject.toLowerCase();
    
    let description = '';
    let topic = primaryGap;
    let timeBox = 60;
    
    switch (prepType) {
      case 'lesson':
        description = `60-minute lesson on ${primaryGap} for ${student.name} (${student.year}, ${session.board}). Focus on addressing their specific gaps while building toward ${student.upcomingObjective}. Last lesson: ${student.lastLessonSummary}`;
        break;
      case 'questions':
        description = `10 exam-style questions on ${primaryGap} for ${session.board} ${student.year}. Mix of difficulty levels with focus on common mistakes in this area.`;
        break;
      case 'resources':
        description = `Best resources for ${primaryGap} at ${student.year} level (${session.board}). Include authoritative sources, video explanations, and practice materials.`;
        break;
      case 'interview':
        description = `Oxbridge-style interview questions on ${primaryGap} or related ${subject} concepts. For ${student.year} preparing for ${student.exams.join(', ')}.`;
        break;
      case 'notes':
        description = `Weekly progress note for ${student.name}'s parents. Cover recent work on ${primaryGap}, next steps toward ${student.upcomingObjective}, and specific actions for home support.`;
        break;
    }

    return {
      description,
      examBoard: session.board,
      topic,
      level: student.year,
      timeBox,
      calculatorAllowed: subject.includes('math') ? false : true, // Smart default
    };
  };

  const getIcon = () => {
    switch (prepType) {
      case 'lesson': return Brain;
      case 'questions': return FileQuestion;
      case 'resources': return Search;
      case 'interview': return MessageSquare;
      case 'notes': return FileText;
      default: return Sparkles;
    }
  };

  const getTitle = () => {
    switch (prepType) {
      case 'lesson': return `Lesson Plan for ${student.name}`;
      case 'questions': return `Questions for ${student.name}`;
      case 'resources': return `Resources for ${student.name}`;
      case 'interview': return `Interview Prep for ${student.name}`;
      case 'notes': return `Weekly Note for ${student.name}`;
      default: return 'AI Content';
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{getTitle()}</h1>
              <p className="text-sm text-muted-foreground">
                {session?.board || student.board || "General"} • {student.currentGaps?.[0] || student.current_gaps?.[0] || "Assessment needed"} • {session.time}
              </p>
            </div>
          </div>
        </div>
        
        {streamingState === 'complete' && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={generateContent}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>
        )}
      </div>

      {/* Smart Context Display */}
      <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Smart Context:</span>
            <Badge variant="secondary">{student.name}</Badge>
            <Badge variant="secondary">{session.board}</Badge>
            <Badge variant="secondary">{student.currentGaps?.[0] || student.current_gaps?.[0] || "Assessment needed"}</Badge>
            <Badge variant="secondary">{student.year}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className={`mb-6 border-2 ${
        streamingState === 'error' 
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' 
          : streamingState === 'complete'
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
          : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {streamingState === 'thinking' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span>AI is analyzing {student.name}'s context and generating content...</span>
              </>
            )}
            {streamingState === 'generating' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span>Generating personalized content...</span>
              </>
            )}
            {streamingState === 'complete' && (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Content generated successfully for {student.name}!</span>
              </>
            )}
            {streamingState === 'error' && (
              <>
                <span className="text-red-600">Error generating content. Please try again.</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Thinking Process */}
      {thinkingText && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>AI Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
              {thinkingText}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Generated {getTitle()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Render JSON content in a structured way */}
            <div className="space-y-4">
              {prepType === 'lesson' && generatedContent.objectives && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Learning Objectives</h4>
                    <ul className="list-disc list-inside space-y-2">
                      {generatedContent.objectives.map((obj: string, index: number) => (
                        <li key={index} className="text-sm leading-relaxed">{obj}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 text-lg">Lesson Structure (60 minutes)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(generatedContent.structure || {}).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                          <div className="font-medium capitalize text-blue-600 text-sm mb-2">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{value as string}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {generatedContent.commonPitfalls && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 text-lg">Common Pitfalls to Watch</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {generatedContent.commonPitfalls.map((pitfall: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{pitfall}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {prepType === 'questions' && generatedContent.questions && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <Badge variant="secondary" className="px-3 py-1">
                      {generatedContent.examBoard} Style
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      Total: {generatedContent.totalMarks} marks
                    </Badge>
                    <Badge variant={generatedContent.calculatorAllowed ? 'default' : 'destructive'} className="px-3 py-1">
                      Calculator: {generatedContent.calculatorAllowed ? 'Allowed' : 'Not allowed'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {generatedContent.questions.map((q: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-medium text-lg">Question {index + 1}</h5>
                            <Badge variant="outline">{q.marks} marks</Badge>
                          </div>
                          <div className="text-sm mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                            {q.question}
                          </div>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium text-green-600">Model Answer:</span>
                              <p className="mt-1 text-gray-700 dark:text-gray-300">{q.modelAnswer}</p>
                            </div>
                            {q.commonMistakes && q.commonMistakes.length > 0 && (
                              <div>
                                <span className="font-medium text-red-600">Common Mistakes:</span>
                                <ul className="mt-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                                  {q.commonMistakes.map((mistake: string, idx: number) => (
                                    <li key={idx}>{mistake}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON fallback for other types */}
              {!(['lesson', 'questions'].includes(prepType)) && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(generatedContent, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
