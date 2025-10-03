'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProfile, getAllExams } from '@/lib/certifications';
import { StreamingQuestionDisplay } from './quiz/StreamingQuestionDisplay';
import { ObjectivesStrip } from './quiz/ObjectivesStrip';
import { ArrowLeft, RotateCcw, Trophy, Zap, Brain, XCircle } from 'lucide-react';

interface StreamingAnswer {
  selectedOption?: number;
  selectedOptions?: number[];
  correct?: boolean;
  points?: number;
}

interface StreamingState {
  thinking: string;
  questionText: string;
  options: string[];
  explanation: string;
  correctAnswer: number;
  isComplete: boolean;
}

interface CertificationQuizV3Props {
  levelId: string;
  onExit: () => void;
}

export const CertificationQuizV3: React.FC<CertificationQuizV3Props> = ({
  levelId,
  onExit
}) => {
  const [examProfile, setExamProfile] = useState<ExamProfile | null>(null);
  const [currentObjectiveIndex, setCurrentObjectiveIndex] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [answers, setAnswers] = useState<StreamingAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    thinking: '',
    questionText: '',
    options: [],
    explanation: '',
    correctAnswer: 0,
    isComplete: false
  });

  const score = {
    correct: answers.filter(a => a.correct).length,
    total: answers.length,
    percentage: answers.length > 0 ? Math.round((answers.filter(a => a.correct).length / answers.length) * 100) : 0
  };

  const generateQuestion = useCallback(async (profile: ExamProfile, objectiveIndex: number) => {
    if (isGenerating) return; // Prevent multiple simultaneous generations
    
    setIsGenerating(true);
    setError(null);
    
    // Reset streaming state
    setStreamingState({
      thinking: '',
      questionText: '',
      options: [],
      explanation: '',
      correctAnswer: 0,
      isComplete: false
    });

    try {
      const objective = profile.objectives[objectiveIndex];
      const questionType = profile.questionTypes[Math.floor(Math.random() * profile.questionTypes.length)];

      console.log(`🎯 Generating ${questionType} question for ${objective.title}...`);

      const response = await fetch('/api/v2/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: profile.id,
          objectiveId: objective.id,
          questionType
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate question: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'thinking') {
                setStreamingState(prev => ({
                  ...prev,
                  thinking: prev.thinking + data.content
                }));
              } else if (data.type === 'question_start') {
                setStreamingState(prev => ({
                  ...prev,
                  thinking: prev.thinking + '\n\n✨ Crafting your question...'
                }));
              } else if (data.type === 'question_chunk') {
                // Try to extract question text and options as they stream
                const fullText = streamingState.thinking + streamingState.questionText + data.content;
                
                // Extract question from accumulated content
                const questionMatch = fullText.match(/"question":\s*"([^"]*(?:\\.[^"]*)*)"/);
                if (questionMatch) {
                  setStreamingState(prev => ({
                    ...prev,
                    questionText: questionMatch[1].replace(/\\"/g, '"')
                  }));
                }
                
                // Extract options as they appear
                const optionsMatch = fullText.match(/"options":\s*\[([\s\S]*?)\]/);
                if (optionsMatch) {
                  try {
                    const optionsArray = JSON.parse(`[${optionsMatch[1]}]`);
                    setStreamingState(prev => ({
                      ...prev,
                      options: optionsArray
                    }));
                  } catch {
                    // Still parsing, continue
                  }
                }
              } else if (data.type === 'complete') {
                // Final question data
                const questionData = data.content;
                setStreamingState({
                  thinking: '',
                  questionText: questionData.question,
                  options: questionData.options,
                  explanation: questionData.explanation,
                  correctAnswer: questionData.correct,
                  isComplete: true
                });
                break;
              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch (parseError) {
              // Ignore partial JSON parsing errors during streaming
              console.debug('Parsing chunk:', parseError);
            }
          }
        }
      }

    } catch (err) {
      console.error('Error generating question:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate question');
      
      // Fallback question
      setStreamingState({
        thinking: '',
        questionText: `What is a key concept in ${profile.objectives[objectiveIndex]?.title}?`,
        options: ['Concept A', 'Concept B', 'Concept C'],
        explanation: 'This is a fallback question. Please try generating again.',
        correctAnswer: 0,
        isComplete: true
      });
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, streamingState.thinking, streamingState.questionText]);

  useEffect(() => {
    const allExams = getAllExams();
    const profile = allExams.find(exam => exam.id === levelId);
    
    if (profile) {
      setExamProfile(profile);
      generateQuestion(profile, 0); // Start with first objective
    } else {
      setError(`Exam profile not found for: ${levelId}`);
    }
  }, [levelId, generateQuestion]);

  const handleAnswer = (answer: StreamingAnswer) => {
    // Update the answer with correct status based on streaming state
    const updatedAnswer = {
      ...answer,
      correct: answer.selectedOption === streamingState.correctAnswer,
      points: answer.selectedOption === streamingState.correctAnswer ? 1 : 0
    };
    
    setAnswers(prev => [...prev, updatedAnswer]);
  };

  const handleNext = () => {
    if (!examProfile) return;
    
    setQuestionCount(prev => prev + 1);
    
    // Move to next objective or cycle back
    const nextObjectiveIndex = (currentObjectiveIndex + 1) % examProfile.objectives.length;
    setCurrentObjectiveIndex(nextObjectiveIndex);
    
    generateQuestion(examProfile, nextObjectiveIndex);
  };

  const handleObjectiveSelect = (objectiveId: string) => {
    if (!examProfile || isGenerating) return;
    
    const objectiveIndex = examProfile.objectives.findIndex(obj => obj.id === objectiveId);
    if (objectiveIndex !== -1 && objectiveIndex !== currentObjectiveIndex) {
      setCurrentObjectiveIndex(objectiveIndex);
      generateQuestion(examProfile, objectiveIndex);
    }
  };

  const resetQuiz = () => {
    setQuestionCount(1);
    setCurrentObjectiveIndex(0);
    setAnswers([]);
    if (examProfile) {
      generateQuestion(examProfile, 0);
    }
  };

  const currentObjective = examProfile?.objectives[currentObjectiveIndex];
  const currentAnswer = answers[answers.length - 1]; // Last answer for current question

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4 mx-auto">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-red-400 mb-4 text-xl font-bold">Generation Error</h3>
          <p className="text-white mb-6 leading-relaxed">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => examProfile && generateQuestion(examProfile, currentObjectiveIndex)}
              className="px-4 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full font-medium hover:bg-white/20 transition-colors"
            >
              Back to Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!examProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <div className="text-white text-xl mb-2">Loading Exam Profile</div>
          <div className="text-white/70">Preparing {levelId}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black/50 to-black/80">
      {/* Header */}
      <div className="flex-none border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{examProfile.name}</h1>
                <div className="text-sm text-white/70">{examProfile.provider}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Score */}
            <div className="flex items-center gap-4 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold">
                  {score.correct}/{score.total}
                </span>
              </div>
              <div className="text-white/70 text-sm font-medium">
                {score.percentage}%
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={resetQuiz}
              className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              title="Reset Quiz"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Objectives strip */}
        <ObjectivesStrip
          objectives={examProfile.objectives}
          activeObjectiveId={currentObjective?.id}
          examName={examProfile.name}
          onObjectiveSelect={handleObjectiveSelect}
        />
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={questionCount}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="min-h-full"
          >
            <StreamingQuestionDisplay
              examName={examProfile.name}
              objectiveName={currentObjective?.title}
              questionNumber={questionCount}
              onAnswer={handleAnswer}
              onNext={handleNext}
              isGenerating={isGenerating}
              streamingState={streamingState}
              answered={currentAnswer}
            />
          </motion.div>
        </AnimatePresence>

        {/* Generation Status Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="bg-black/80 border border-purple-500/30 rounded-2xl p-8 text-center max-w-md mx-4">
                <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                <div className="flex items-center gap-2 text-white text-lg font-bold mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Gemini AI is thinking...
                </div>
                <div className="text-white/70 text-sm">
                  Crafting a perfect {examProfile.name} question
                </div>
                {currentObjective && (
                  <div className="mt-3 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-xs">
                    {currentObjective.title}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
