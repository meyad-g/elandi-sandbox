'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProfile, getAllExams } from '@/lib/certifications';
import { FinalCleanDisplay } from './quiz/FinalCleanDisplay';
import { ProperFlashcards } from './quiz/ProperFlashcards';
import { ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react';

interface QuestionAnswer {
  selectedOption: number;
  correct: boolean;
  points: number;
}

interface StreamingQuestionState {
  thinking: string;
  questionText: string;
  options: Array<{ text: string; index: number }>;
  explanation: string;
  correctAnswer: number;
  isComplete: boolean;
}

type StudyMode = 'questions' | 'flashcards';

interface CertificationQuizCleanProps {
  levelId: string;
  onExit: () => void;
}

export const CertificationQuizClean: React.FC<CertificationQuizCleanProps> = ({
  levelId,
  onExit
}) => {
  const [examProfile, setExamProfile] = useState<ExamProfile | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>('questions');
  const [currentObjectiveIndex, setCurrentObjectiveIndex] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [streamingState, setStreamingState] = useState<StreamingQuestionState>({
    thinking: '',
    questionText: '',
    options: [],
    explanation: '',
    correctAnswer: -1,
    isComplete: false
  });

  const score = {
    correct: answers.filter(a => a.correct).length,
    total: answers.length,
    percentage: answers.length > 0 ? Math.round((answers.filter(a => a.correct).length / answers.length) * 100) : 0
  };

  // Initialize exam profile
  useEffect(() => {
    const allExams = getAllExams();
    const profile = allExams.find(exam => exam.id === levelId);
    
    if (profile) {
      setExamProfile(profile);
    } else {
      setError(`Exam profile not found for: ${levelId}`);
    }
  }, [levelId]);

  const generateQuestion = async () => {
    if (!examProfile || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    // Reset streaming state
    setStreamingState({
      thinking: '',
      questionText: '',
      options: [],
      explanation: '',
      correctAnswer: -1,
      isComplete: false
    });

    try {
      const objective = examProfile.objectives[currentObjectiveIndex];
      const questionType = examProfile.questionTypes[Math.floor(Math.random() * examProfile.questionTypes.length)];

      console.log(`🎯 Generating ${questionType} question for ${objective.title}...`);

      const response = await fetch('/api/v2/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: examProfile.id,
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
              } else if (data.type === 'question_text') {
                setStreamingState(prev => ({
                  ...prev,
                  questionText: data.content
                }));
              } else if (data.type === 'option') {
                setStreamingState(prev => ({
                  ...prev,
                  options: [...prev.options, { text: data.content, index: data.optionIndex || 0 }],
                  correctAnswer: data.correct !== undefined ? data.correct : prev.correctAnswer
                }));
              } else if (data.type === 'explanation') {
                setStreamingState(prev => ({
                  ...prev,
                  explanation: data.content,
                  correctAnswer: data.correct !== undefined ? data.correct : prev.correctAnswer
                }));
              } else if (data.type === 'complete') {
                setStreamingState(prev => ({
                  ...prev,
                  isComplete: true
                }));
                console.log('🎯 Question generation complete');
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
        thinking: 'Generated fallback question due to error.',
        questionText: `What is a key concept in ${examProfile.objectives[currentObjectiveIndex]?.title}?`,
        options: [
          { text: 'A) Concept A', index: 0 },
          { text: 'B) Concept B', index: 1 },
          { text: 'C) Concept C', index: 2 }
        ],
        explanation: 'This is a fallback question. Please try generating again.',
        correctAnswer: 0,
        isComplete: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate first question when exam profile is loaded (only once!)
  useEffect(() => {
    if (examProfile && questionCount === 1 && streamingState.questionText === '' && !isGenerating) {
      console.log('🎯 Generating initial question...');
      generateQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examProfile]);

  const handleAnswer = (answer: QuestionAnswer) => {
    setAnswers(prev => [...prev, answer]);
  };

  const handleNext = () => {
    if (!examProfile) return;
    
    setQuestionCount(prev => prev + 1);
    
    // Move to next objective or cycle back
    const nextObjectiveIndex = (currentObjectiveIndex + 1) % examProfile.objectives.length;
    setCurrentObjectiveIndex(nextObjectiveIndex);
    
    // Generate new question
    generateQuestion();
  };

  const handleObjectiveSelect = (objectiveId: string) => {
    if (!examProfile || isGenerating) return;
    
    const objectiveIndex = examProfile.objectives.findIndex(obj => obj.id === objectiveId);
    if (objectiveIndex !== -1 && objectiveIndex !== currentObjectiveIndex) {
      setCurrentObjectiveIndex(objectiveIndex);
      
      // FULLY reset all state when switching objectives
      setStreamingState({
        thinking: '',
        questionText: '',
        options: [],
        explanation: '',
        correctAnswer: -1,
        isComplete: false
      });
      
      // Reset question count and answers for this objective
      setQuestionCount(1);
      setAnswers([]); // Clear previous answers
      
      console.log(`🎯 Switching to objective: ${objectiveId}, resetting all state`);
      
      // Generate new question for this objective
      generateQuestion();
    }
  };

  const resetQuiz = () => {
    setQuestionCount(1);
    setCurrentObjectiveIndex(0);
    setAnswers([]);
    if (examProfile) {
      generateQuestion();
    }
  };

  const currentObjective = examProfile?.objectives[currentObjectiveIndex];
  const currentAnswer = answers[answers.length - 1];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-red-400 mb-4 text-xl font-bold">Generation Error</h3>
          <p className="text-white mb-6 leading-relaxed">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={generateQuestion}
              className="px-4 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full font-medium hover:bg-white/20 transition-colors"
            >
              Back
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
    <div className="min-h-screen flex flex-col">
      {/* Compact Header */}
      <div className="flex-none border-b border-white/20 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="p-1 text-white/70 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-white font-medium text-sm">{examProfile.name}</div>
            <div className="text-white/60 text-xs">•</div>
            <div className="text-white/60 text-xs">{score.correct}/{score.total}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStudyMode('questions')}
              className={`px-3 py-1 rounded text-xs ${studyMode === 'questions' ? 'bg-purple-500 text-white' : 'text-white/70 hover:text-white'}`}
            >
              Questions
            </button>
            <button
              onClick={() => setStudyMode('flashcards')}
              className={`px-3 py-1 rounded text-xs ${studyMode === 'flashcards' ? 'bg-purple-500 text-white' : 'text-white/70 hover:text-white'}`}
            >
              Flashcards
            </button>
            <button onClick={resetQuiz} className="p-1 text-white/70 hover:text-white ml-2">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Compact Objectives - only for questions */}
        {studyMode === 'questions' && (
          <div className="px-3 py-2 border-t border-white/10">
            <div className="flex gap-1 overflow-x-auto text-xs">
              {examProfile.objectives.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => handleObjectiveSelect(obj.id)}
                  className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                    obj.id === currentObjective?.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {obj.title.split(' ')[0]} ({obj.weight}%)
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {studyMode === 'questions' ? (
            <motion.div
              key={`question-${questionCount}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <FinalCleanDisplay
                objectiveName={currentObjective?.title || 'Unknown Objective'}
                questionNumber={questionCount}
                onAnswer={handleAnswer}
                onNext={handleNext}
                streamingState={streamingState}
                answered={currentAnswer}
              />
            </motion.div>
          ) : (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ProperFlashcards
                examProfile={examProfile}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* No more conflicting bottom bar - navigation is in content */}
    </div>
  );
};
