'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProfile, getAllExams } from '@/lib/certifications';
import { CertificationQuizPage } from './quiz/CertificationQuizPage';
import { ObjectivesStrip } from './quiz/ObjectivesStrip';
import { ArrowLeft, RotateCcw, Target, Trophy, BookOpen, Zap } from 'lucide-react';

interface CertificationAnswer {
  questionId?: string;
  booleanAnswer?: boolean;
  selectedOption?: number;
  selectedOptions?: number[];
  essayText?: string;
  correct?: boolean;
  points?: number;
}

interface GeminiQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  type?: 'multiple_choice' | 'multiple_response' | 'vignette';
  vignette?: string;
  questions?: GeminiQuestion[];
}

interface CertificationQuizV2Props {
  levelId: string;
  onExit: () => void;
}

export const CertificationQuizV2: React.FC<CertificationQuizV2Props> = ({
  levelId,
  onExit
}) => {
  const [examProfile, setExamProfile] = useState<ExamProfile | null>(null);
  const [currentObjectiveIndex, setCurrentObjectiveIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<GeminiQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, CertificationAnswer>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, points: 0 });

  const generateInitialQuestions = useCallback(async (profile: ExamProfile) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const initialQuestions: GeminiQuestion[] = [];
      
      // Generate one question per objective to start
      for (const objective of profile.objectives.slice(0, 3)) { // Start with first 3 objectives
        try {
          console.log(`Generating question for ${objective.title}...`);
          
          // Get random supported question type
          const supportedTypes = profile.questionTypes;
          const randomType = supportedTypes[Math.floor(Math.random() * supportedTypes.length)];
          
          const response = await fetch('/api/v2/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              examId: profile.id,
              objectiveId: objective.id,
              questionType: randomType
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let questionData = null;

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim());

              for (const line of lines) {
                try {
                  const data = JSON.parse(line);
                  if (data.type === 'complete') {
                    questionData = data.content;
                    break;
                  }
                } catch {
                  // Ignore parsing errors for partial chunks
                }
              }

              if (questionData) break;
            }
          }

          if (questionData) {
            initialQuestions.push({
              ...questionData,
              type: randomType,
              objectiveId: objective.id
            });
          }
        } catch (err) {
          console.error(`Error generating question for ${objective.title}:`, err);
          // Continue with other questions
        }
      }
      
      setQuestions(initialQuestions);
    } catch (err) {
      console.error('Error generating initial questions:', err);
      setError('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    const allExams = getAllExams();
    const profile = allExams.find(exam => exam.id === levelId);
    
    if (profile) {
      setExamProfile(profile);
      generateInitialQuestions(profile);
    } else {
      setError(`Exam profile not found for: ${levelId}`);
    }
  }, [levelId, generateInitialQuestions]);

  const generateMoreQuestions = async () => {
    if (!examProfile) return;
    
    setIsGenerating(true);
    
    try {
      // Generate questions for the current objective
      const currentObjective = examProfile.objectives[currentObjectiveIndex];
      const supportedTypes = examProfile.questionTypes;
      const randomType = supportedTypes[Math.floor(Math.random() * supportedTypes.length)];
      
      const response = await fetch('/api/v2/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: examProfile.id,
          objectiveId: currentObjective.id,
          questionType: randomType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let questionData = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.type === 'complete') {
                questionData = data.content;
                break;
              }
            } catch {
              // Ignore parsing errors
            }
          }

          if (questionData) break;
        }
      }

      if (questionData) {
        setQuestions(prev => [...prev, {
          ...questionData,
          type: randomType,
          objectiveId: currentObjective.id
        }]);
      }
      
    } catch (err) {
      console.error('Error generating more questions:', err);
      setError('Failed to generate new question. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (answer: CertificationAnswer) => {
    const newAnswers = { ...answers, [currentQuestionIndex]: answer };
    setAnswers(newAnswers);
    
    // Update score
    const newScore = Object.values(newAnswers).reduce(
      (acc, ans) => ({
        correct: acc.correct + (ans.correct ? 1 : 0),
        total: acc.total + 1,
        points: acc.points + (ans.points || 0)
      }),
      { correct: 0, total: 0, points: 0 }
    );
    setScore(newScore);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Generate more questions or cycle objectives
      if (currentObjectiveIndex < (examProfile?.objectives.length || 0) - 1) {
        setCurrentObjectiveIndex(currentObjectiveIndex + 1);
      } else {
        setCurrentObjectiveIndex(0); // Cycle back to first objective
      }
      generateMoreQuestions();
      setCurrentQuestionIndex(questions.length); // Move to the new question
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setCurrentObjectiveIndex(0);
    setAnswers({});
    setScore({ correct: 0, total: 0, points: 0 });
    if (examProfile) {
      generateInitialQuestions(examProfile);
    }
  };

  const handleObjectiveSelect = (objectiveId: string) => {
    if (!examProfile) return;
    
    const objectiveIndex = examProfile.objectives.findIndex(obj => obj.id === objectiveId);
    if (objectiveIndex !== -1) {
      setCurrentObjectiveIndex(objectiveIndex);
      generateMoreQuestions();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentObjective = examProfile?.objectives[currentObjectiveIndex];
  const currentAnswer = answers[currentQuestionIndex];

  // Convert Gemini question to our Question format for the UI
  const convertToUIQuestion = (geminiQ: GeminiQuestion) => {
    if (geminiQ.type === 'multiple_choice' || !geminiQ.type) {
      return {
        type: 'multiple_choice' as const,
        text: geminiQ.question,
        options: geminiQ.options,
        correct: geminiQ.correct,
        why: geminiQ.explanation,
        objective: currentObjective?.id,
        examType: examProfile?.id
      };
    }
    
    // Handle other types as needed
    return {
      type: 'multiple_choice' as const,
      text: geminiQ.question,
      options: geminiQ.options,
      correct: geminiQ.correct,
      why: geminiQ.explanation,
      objective: currentObjective?.id,
      examType: examProfile?.id
    };
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
          <div className="text-red-400 mb-4 text-xl font-bold">Error</div>
          <div className="text-white mb-6">{error}</div>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
          >
            Back to Selection
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <div className="flex items-center gap-2 text-white text-xl mb-2">
            <Zap className="w-6 h-6 text-purple-400" />
            Preparing Your Exam
          </div>
          <div className="text-white/70">
            Generating questions with Gemini AI for {examProfile?.name}...
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion && !isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4 text-xl">No questions available</div>
          <button
            onClick={() => examProfile && generateInitialQuestions(examProfile)}
            className="px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors"
          >
            Generate Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex-none">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">{examProfile?.name}</h1>
                <div className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-300 text-xs font-medium">Gemini</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-white/70">{currentObjective?.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Score */}
            <div className="flex items-center gap-4 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">
                  {score.correct}/{score.total}
                </span>
              </div>
              <div className="text-white/70 text-sm">
                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
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
        {examProfile && (
          <ObjectivesStrip
            objectives={examProfile.objectives}
            activeObjectiveId={currentObjective?.id}
            examName={examProfile.name}
            onObjectiveSelect={handleObjectiveSelect}
          />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <CertificationQuizPage
                question={convertToUIQuestion(currentQuestion)}
                index={currentQuestionIndex}
                onAnswer={handleAnswer}
                answered={currentAnswer}
                examName={examProfile?.name}
                objectiveName={currentObjective?.title}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-black/80 border border-purple-500/20 rounded-2xl p-6 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3 mx-auto"></div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Zap className="w-4 h-4 text-purple-400" />
                Generating with Gemini AI...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-none p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2 text-white/70">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
              {isGenerating && '+'}
            </span>
          </div>

          <button
            onClick={nextQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 border border-purple-400 rounded-full text-white hover:bg-purple-600 transition-colors"
          >
            Next
            <Target className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

};
