'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  CheckCircle, 
  XCircle,
  Brain
} from 'lucide-react';

import { ExamProfile, getExamProfile } from '@/lib/certifications';
import { 
  StudySession, 
  StudySessionManager, 
  StudySessionConfig, 
  QuestionAttempt
} from '@/lib/studySession';
import { CertificationQuizPage } from './quiz/CertificationQuizPage';
import { ObjectivesStrip } from './quiz/ObjectivesStrip';
import { Button } from './ui/Button';
import { AIThinkingBox } from './ui/AIThinkingBox';

interface GeminiQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  type?: 'multiple_choice' | 'multiple_response' | 'vignette';
  vignette?: string;
  questions?: GeminiQuestion[];
}

interface CertificationAnswer {
  questionId?: string;
  booleanAnswer?: boolean;
  selectedOption?: number;
  selectedOptions?: number[];
  essayText?: string;
  correct?: boolean;
  points?: number;
}

interface EnhancedCertificationQuizProps {
  levelId: string;
  onExit: () => void;
  studyMode?: 'focus' | 'review' | 'comprehensive' | 'weakness';
  targetObjectiveIds?: string[];
  questionsPerObjective?: number;
}

export const EnhancedCertificationQuiz: React.FC<EnhancedCertificationQuizProps> = ({
  levelId,
  onExit,
  studyMode = 'comprehensive',
  targetObjectiveIds,
  questionsPerObjective
}) => {
  // Core state
  const [examProfile, setExamProfile] = useState<ExamProfile | null>(null);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<GeminiQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<CertificationAnswer | null>(null);
  
  // Question management
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  
  // Streaming state for real-time question building
  const [streamingState, setStreamingState] = useState({
    thinking: '',
    questionText: '',
    options: [] as string[],
    explanation: '',
    correctAnswer: -1,
    isComplete: false
  });
  
  // UI state
  const [showObjectiveCompletion, setShowObjectiveCompletion] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);

  // Initialize study session
  useEffect(() => {
    const profile = getExamProfile(levelId);
    if (profile) {
      setExamProfile(profile);
      
      const config: StudySessionConfig = {
        examId: levelId,
        studyMode,
        targetObjectiveIds,
        questionsPerObjective,
        adaptiveDifficulty: profile.studySettings?.adaptiveDifficulty || false,
        spaceRepetition: profile.studySettings?.spaceRepetition || false
      };
      
      const session = StudySessionManager.createStudySession(config, profile);
      setStudySession(session);
      StudySessionManager.saveSession(session);
      
      console.log('🎯 Enhanced Quiz: Created study session:', session);
      
      // Generate first question
      generateQuestionForCurrentObjective(session);
    } else {
      setError(`Exam profile not found for: ${levelId}`);
    }
  }, [levelId, studyMode, targetObjectiveIds, questionsPerObjective]);

  const generateQuestionForCurrentObjective = async (session: StudySession) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    setCurrentAnswer(null);
    setCurrentQuestion(null);
    setQuestionStartTime(new Date());
    
    // Reset streaming state
    setStreamingState({
      thinking: '',
      questionText: '',
      options: [],
      explanation: '',
      correctAnswer: -1,
      isComplete: false
    });
    
    const currentObjective = session.examProfile.objectives.find(
      obj => obj.id === session.currentObjectiveId
    );
    
    if (!currentObjective) {
      setError('Current objective not found');
      setIsGenerating(false);
      return;
    }

    try {
      console.log(`🎯 Generating question for ${currentObjective.title}...`);
      
      const questionType = session.examProfile.questionTypes[
        Math.floor(Math.random() * session.examProfile.questionTypes.length)
      ];
      
      const response = await fetch('/api/v2/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: session.examId,
          objectiveId: session.currentObjectiveId,
          questionType
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate question: ${response.status}`);
      }

      // Handle streaming response with real-time updates
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      // Accumulate the complete question from streaming chunks
      let questionText = '';
      const options: string[] = [];
      let explanation = '';
      let correctAnswer = -1;
      let isComplete = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              switch (data.type) {
                case 'thinking':
                  setStreamingState(prev => ({
                    ...prev,
                    thinking: data.content
                  }));
                  break;
                  
                case 'question_text':
                  questionText = data.content;
                  setStreamingState(prev => ({
                    ...prev,
                    questionText: data.content
                  }));
                  break;
                  
                case 'option':
                  options[data.optionIndex] = data.content;
                  if (data.correct !== undefined && data.correct >= 0) {
                    correctAnswer = data.correct;
                  }
                  setStreamingState(prev => {
                    const newOptions = [...prev.options];
                    newOptions[data.optionIndex] = data.content;
                    return {
                      ...prev,
                      options: newOptions,
                      correctAnswer: data.correct >= 0 ? data.correct : prev.correctAnswer
                    };
                  });
                  break;
                  
                case 'explanation':
                  explanation = data.content;
                  if (data.correct !== undefined && data.correct >= 0) {
                    correctAnswer = data.correct;
                  }
                  setStreamingState(prev => ({
                    ...prev,
                    explanation: data.content,
                    correctAnswer: data.correct >= 0 ? data.correct : prev.correctAnswer
                  }));
                  break;
                  
                case 'complete':
                  isComplete = true;
                  setStreamingState(prev => ({
                    ...prev,
                    isComplete: true
                  }));
                  break;
              }
              
              if (isComplete && questionText && options.length > 0 && explanation) {
                break;
              }
            } catch (err) {
              // Ignore parsing errors for partial chunks
              console.warn('Failed to parse chunk:', line, err);
            }
          }

          if (isComplete && questionText && options.length > 0 && explanation) {
            break;
          }
        }
      }

      // Build the complete question object
      const questionData = {
        question: questionText,
        options: options.filter(opt => opt), // Remove undefined options
        correct: correctAnswer,
        explanation: explanation
      };

      // Validate question structure
      if (!questionData.question || !questionData.options || !Array.isArray(questionData.options) || questionData.options.length === 0) {
        console.error('❌ Invalid question format:', questionData);
        throw new Error(`Invalid question format received from API. Missing: ${
          !questionData.question ? 'question text, ' : ''
        }${
          !questionData.options ? 'options array, ' : ''
        }${
          questionData.options && questionData.options.length === 0 ? 'option content' : ''
        }`);
      }
      
      console.log('🎯 Complete question data built:', questionData);
      setCurrentQuestion(questionData);
      console.log('✅ Question set successfully:', {
        question: questionData.question?.substring(0, 50) + '...',
        optionsCount: questionData.options?.length,
        correctAnswer: questionData.correct,
        hasExplanation: !!questionData.explanation
      });
    } catch (err) {
      console.error('Error generating question:', err);
      setError('Failed to generate question. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = useCallback((answer: CertificationAnswer) => {
    if (!studySession || !currentQuestion) return;

    setCurrentAnswer(answer);
    
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
    
    const attempt: QuestionAttempt = {
      questionId: `q-${Date.now()}`,
      objectiveId: studySession.currentObjectiveId,
      correct: answer.correct || false,
      timeSpent,
      attempt: 1, // Could be enhanced to track retry attempts
      timestamp: new Date(),
      difficulty: 'medium' // Could be determined by question complexity
    };

    // Update study session with the attempt
    const updatedSession = StudySessionManager.recordQuestionAttempt(studySession, attempt);
    setStudySession(updatedSession);
    StudySessionManager.saveSession(updatedSession);
    
    console.log('📊 Question attempt recorded:', attempt);
    console.log('📈 Updated session progress:', updatedSession.objectives.find(obj => obj.objectiveId === studySession.currentObjectiveId));

  }, [studySession, currentQuestion, questionStartTime]);

  const handleNext = useCallback(async () => {
    if (!studySession || !currentAnswer) return;

    // Check if we should move to next objective
    const shouldMoveToNext = StudySessionManager.shouldMoveToNextObjective(
      studySession, 
      studySession.currentObjectiveId
    );

    if (shouldMoveToNext) {
      // Show objective completion
      setShowObjectiveCompletion(true);
      
      setTimeout(() => {
        setShowObjectiveCompletion(false);
        
        const nextObjective = StudySessionManager.getNextObjective(studySession);
        
        if (nextObjective) {
          // Move to next objective
          const updatedSession = {
            ...studySession,
            currentObjectiveId: nextObjective.objectiveId,
            currentObjectiveIndex: nextObjective.objectiveIndex
          };
          setStudySession(updatedSession);
          StudySessionManager.saveSession(updatedSession);
          
          // Generate question for new objective
          generateQuestionForCurrentObjective(updatedSession);
        } else {
          // All objectives completed - show session summary
          setShowSessionSummary(true);
        }
      }, 2000);
    } else {
      // Continue with same objective
      generateQuestionForCurrentObjective(studySession);
    }
  }, [studySession, currentAnswer]);

  const handleObjectiveSelect = (objectiveId: string) => {
    if (!studySession || isGenerating) return;
    
    const objectiveIndex = studySession.examProfile.objectives.findIndex(obj => obj.id === objectiveId);
    if (objectiveIndex !== -1 && objectiveId !== studySession.currentObjectiveId) {
      const updatedSession = {
        ...studySession,
        currentObjectiveId: objectiveId,
        currentObjectiveIndex: objectiveIndex
      };
      setStudySession(updatedSession);
      StudySessionManager.saveSession(updatedSession);
      
      // Generate new question for selected objective
      generateQuestionForCurrentObjective(updatedSession);
    }
  };

  const resetQuiz = () => {
    if (!examProfile) return;
    
    const config: StudySessionConfig = {
      examId: levelId,
      studyMode,
      targetObjectiveIds,
      questionsPerObjective,
      adaptiveDifficulty: examProfile.studySettings?.adaptiveDifficulty || false,
      spaceRepetition: examProfile.studySettings?.spaceRepetition || false
    };
    
    const newSession = StudySessionManager.createStudySession(config, examProfile);
    setStudySession(newSession);
    setCurrentQuestion(null);
    setCurrentAnswer(null);
    setShowObjectiveCompletion(false);
    setShowSessionSummary(false);
    StudySessionManager.saveSession(newSession);
    
    generateQuestionForCurrentObjective(newSession);
  };

  // Get current objective info
  const currentObjective = studySession?.examProfile.objectives.find(
    obj => obj.id === studySession.currentObjectiveId
  );
  const currentProgress = studySession?.objectives.find(
    obj => obj.objectiveId === studySession.currentObjectiveId
  );

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <Button variant="primary" onClick={onExit}>
            Back to Selection
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!studySession || !examProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <div className="text-white">Initializing study session...</div>
        </div>
      </div>
    );
  }

  // Session completion summary
  if (showSessionSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
            <p className="text-white/70">Great work on your {examProfile.name} study session</p>
          </div>
          
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{studySession.totalQuestionsAnswered}</div>
                <div className="text-sm text-white/70">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{studySession.totalCorrectAnswers}</div>
                <div className="text-sm text-white/70">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{Math.round(studySession.sessionScore)}%</div>
                <div className="text-sm text-white/70">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{studySession.objectives.length}</div>
                <div className="text-sm text-white/70">Objectives</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white mb-3">Objective Progress</h3>
              {studySession.objectives.map((progress) => {
                const objective = examProfile.objectives.find(obj => obj.id === progress.objectiveId);
                return (
                  <div key={progress.objectiveId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-white">{objective?.title}</div>
                      <div className="text-sm text-white/60">
                        {progress.questionsAttempted} questions • {Math.round(progress.averageScore)}% correct
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      progress.masteryLevel === 'mastery' ? 'bg-green-500/20 text-green-400' :
                      progress.masteryLevel === 'proficient' ? 'bg-blue-500/20 text-blue-400' :
                      progress.masteryLevel === 'developing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {progress.masteryLevel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={resetQuiz} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
            <Button variant="primary" onClick={onExit} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Objective completion overlay
  if (showObjectiveCompletion && currentObjective && currentProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Objective Complete!</h2>
          <p className="text-white/70 mb-4">{currentObjective.title}</p>
          
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-bold text-white">{currentProgress.questionsAttempted}</div>
                <div className="text-sm text-white/70">Questions</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">{Math.round(currentProgress.averageScore)}%</div>
                <div className="text-sm text-white/70">Score</div>
              </div>
            </div>
            <div className={`mt-3 px-3 py-1 rounded-full text-sm font-medium inline-block ${
              currentProgress.masteryLevel === 'mastery' ? 'bg-green-500/20 text-green-400' :
              currentProgress.masteryLevel === 'proficient' ? 'bg-blue-500/20 text-blue-400' :
              currentProgress.masteryLevel === 'developing' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {currentProgress.masteryLevel.charAt(0).toUpperCase() + currentProgress.masteryLevel.slice(1)}
            </div>
          </div>
          
          <p className="text-sm text-white/60">Moving to next objective...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex-none">
        <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-lg font-bold text-white">{examProfile.name}</h1>
              <div className="text-xs text-white/70">
                {studyMode.charAt(0).toUpperCase() + studyMode.slice(1)} Mode
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Session Stats */}
            <div className="flex items-center gap-3 px-3 py-2 bg-white/10 border border-white/20 rounded-xl">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold text-sm">
                  {studySession.totalCorrectAnswers}/{studySession.totalQuestionsAnswered}
                </span>
              </div>
              <div className="text-white/70 text-xs font-medium">
                {Math.round(studySession.sessionScore)}%
              </div>
            </div>

            {/* Progress for current objective */}
            {currentProgress && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-xl">
                <Brain className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-white">
                  {currentProgress.questionsAttempted}/{currentObjective?.questionsPerSession || studySession.questionsPerObjective}
                </span>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={resetQuiz}
              className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              title="Reset Study Session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Enhanced Objectives Strip */}
        <ObjectivesStrip
          objectives={examProfile.objectives.map(obj => {
            const progress = studySession.objectives.find(p => p.objectiveId === obj.id);
            return {
              ...obj,
              progress: progress ? {
                attempted: progress.questionsAttempted,
                total: obj.questionsPerSession || studySession.questionsPerObjective,
                score: progress.averageScore,
                mastery: progress.masteryLevel
              } : undefined
            };
          })}
          activeObjectiveId={studySession.currentObjectiveId}
          examName={examProfile.name}
          onObjectiveSelect={handleObjectiveSelect}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <CertificationQuizPage
            question={{
              text: streamingState.questionText || currentQuestion?.question || 'Loading question...',
              type: 'multiple_choice' as const,
              options: streamingState.options.length > 0 ? streamingState.options : (currentQuestion?.options || []),
              correct: streamingState.correctAnswer >= 0 ? streamingState.correctAnswer : (currentQuestion?.correct || 0),
              why: streamingState.explanation || currentQuestion?.explanation || 'Loading explanation...'
            }}
            index={studySession.totalQuestionsAnswered}
            onAnswer={handleAnswer}
            answered={currentAnswer}
            examName={examProfile.name}
            objectiveName={currentObjective?.title}
            isStreaming={isGenerating}
            streamingState={streamingState}
            onNext={handleNext}
          />
        </div>
      </div>

      {/* Navigation - Remove old bottom bar since it's now in CertificationQuizPage */}

      {/* AI Thinking Box - Fixed bottom right */}
      <AIThinkingBox 
        thinking={streamingState.thinking}
        isVisible={isGenerating && !!streamingState.thinking}
        onClose={() => setStreamingState(prev => ({ ...prev, thinking: '' }))}
      />
    </div>
  );
};
