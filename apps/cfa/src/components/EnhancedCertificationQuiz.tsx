'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  CheckCircle, 
  XCircle,
  Brain,
  BookOpen,
  CreditCard,
  History,
  Target,
  FileText
} from 'lucide-react';

import { ExamProfile, getExamProfile } from '@/lib/certifications';
import { 
  StudySession, 
  StudySessionManager, 
  StudySessionConfig, 
  QuestionAttempt,
  FlashcardAttempt
} from '@/lib/studySession';
import { CertificationQuizPage } from './quiz/CertificationQuizPage';
import { ObjectivesStrip } from './quiz/ObjectivesStrip';
import { FlashcardStudyMode } from './quiz/modes/FlashcardStudyMode';
import { FlashcardQuestionMode } from './quiz/modes/FlashcardQuestionMode';
import { EfficientExamMode } from './quiz/modes/EfficientExamMode';
import { MockExamMode } from './quiz/modes/MockExamMode';
import { LearningHistory } from './quiz/LearningHistory';
import { ExamResults } from './quiz/ExamResults';
import { Button } from './ui/Button';

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

interface FlashcardData {
  id: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  objectiveId: string;
  sourceQuestionId?: string;
}

interface FlashcardAnswer {
  difficulty: 'easy' | 'medium' | 'hard';
  masteryLevel: 'again' | 'hard' | 'good' | 'easy';
  timeSpent: number;
}

interface EnhancedCertificationQuizProps {
  levelId: string;
  onExit: () => void;
  studyMode?: 'focus' | 'review' | 'comprehensive' | 'weakness';
  examMode?: 'prep' | 'efficient' | 'mock'; // New exam modes
  targetObjectiveIds?: string[];
  questionsPerObjective?: number;
  onBackToModeSelect?: () => void; // Navigate back to mode selection
}

export const EnhancedCertificationQuiz: React.FC<EnhancedCertificationQuizProps> = ({
  levelId,
  onExit,
  studyMode = 'comprehensive',
  examMode = 'prep',
  targetObjectiveIds,
  questionsPerObjective,
  onBackToModeSelect
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
    questionText: '',
    options: [] as string[],
    explanation: '',
    correctAnswer: -1,
    isComplete: false
  });
  
  // UI state
  const [showObjectiveCompletion, setShowObjectiveCompletion] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false); // Mobile objectives sidebar
  // Flashcard and mode state
  const [activeMode, setActiveMode] = useState<'quiz' | 'flashcards' | 'flashcard-questions' | 'history' | 'efficient' | 'mock'>('quiz');
  const [currentFlashcard, setCurrentFlashcard] = useState<FlashcardData | null>(null);
  const [flashcardsForObjective, setFlashcardsForObjective] = useState<FlashcardData[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isGeneratingFlashcard] = useState(false);

  // Mode switching handler
  const handleModeSwitch = useCallback((newMode: 'quiz' | 'flashcards' | 'flashcard-questions' | 'history' | 'efficient' | 'mock') => {
    if (newMode === activeMode) return;
    
    setActiveMode(newMode);
    
    if (studySession) {
      const updatedSession = StudySessionManager.switchActiveMode(studySession, newMode);
      setStudySession(updatedSession);
      StudySessionManager.saveSession(updatedSession);
    }
    
    if (newMode === 'flashcards') {
      // Load or generate flashcards for current objective
      loadFlashcardsForCurrentObjective();
    } else if (newMode === 'quiz') {
      // Reset to quiz mode, generate new question if needed
      if (!currentQuestion && !isGenerating && studySession) {
        generateQuestionForCurrentObjective(studySession);
      }
    }
  }, [activeMode, studySession, currentQuestion, isGenerating]);


  // Load flashcards for current objective
  const loadFlashcardsForCurrentObjective = useCallback(async () => {
    if (!studySession || !examProfile) {
      console.log('🎯 Frontend: Missing studySession or examProfile');
      return;
    }
    
    console.log('🎯 Frontend: Starting flashcard generation for objective:', studySession.currentObjectiveId);
    // For now, generate a new flashcard for the objective
    // In a real implementation, you'd load existing flashcards from storage
    try {
      const response = await fetch('/api/generate-flashcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: studySession.currentObjectiveId,
          examId: examProfile.id,
          previousCards: flashcardsForObjective,
          stream: true
        }),
      });

      console.log('🎯 Frontend: Got response:', response.status, response.ok);
      if (!response.ok) throw new Error('Failed to generate flashcard');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let flashcardData: FlashcardData | null = null;

      if (reader) {
        console.log('🎯 Frontend: Starting to read stream...');
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          console.log('🎯 Frontend: Received chunk:', chunk);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            console.log('🎯 Frontend: Processing line:', line);
            try {
              const data = JSON.parse(line);
              console.log('🎯 Frontend: Parsed data:', data);
              if (data.type === 'complete') {
                console.log('🎯 Frontend: Got complete flashcard:', data.content);
                flashcardData = data.content;
              } else if (data.type === 'error') {
                console.error('🎯 Frontend: API error:', data.content);
                throw new Error(data.content);
              }
            } catch (parseError) {
              console.log('🎯 Frontend: Parse error for line:', line, parseError);
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }

      console.log('🎯 Frontend: Final flashcardData:', flashcardData);
      if (flashcardData) {
        console.log('🎯 Frontend: Setting flashcard data in state');
        setFlashcardsForObjective(prev => [...prev, flashcardData!]);
        setCurrentFlashcard(flashcardData);
        setCurrentFlashcardIndex(flashcardsForObjective.length);
      } else {
        console.log('🎯 Frontend: No flashcard data received');
      }
      
    } catch (error) {
      console.error('🎯 Frontend: Error loading flashcards:', error);
      setError(error instanceof Error ? error.message : 'Failed to load flashcards');
    }
  }, [studySession, examProfile, flashcardsForObjective]);

  // Flashcard navigation handlers
  const handleFlashcardAnswer = useCallback((answer: FlashcardAnswer) => {
    if (!currentFlashcard || !studySession) return;
    
    const attempt: FlashcardAttempt = {
      flashcardId: currentFlashcard.id,
      objectiveId: studySession.currentObjectiveId,
      difficulty: answer.difficulty,
      timeSpent: answer.timeSpent,
      masteryLevel: answer.masteryLevel,
      timestamp: new Date(),
      attempt: 1 // This could be tracked if user reviews the same card multiple times
    };
    
    const updatedSession = StudySessionManager.recordFlashcardAttempt(studySession, attempt);
    setStudySession(updatedSession);
    StudySessionManager.saveSession(updatedSession);
  }, [currentFlashcard, studySession]);

  const handleNextFlashcard = useCallback(() => {
    if (currentFlashcardIndex < flashcardsForObjective.length - 1) {
      const nextIndex = currentFlashcardIndex + 1;
      setCurrentFlashcardIndex(nextIndex);
      setCurrentFlashcard(flashcardsForObjective[nextIndex]);
    } else {
      // Generate a new flashcard or move to next objective
      loadFlashcardsForCurrentObjective();
    }
  }, [currentFlashcardIndex, flashcardsForObjective, loadFlashcardsForCurrentObjective]);

  const handlePreviousFlashcard = useCallback(() => {
    if (currentFlashcardIndex > 0) {
      const prevIndex = currentFlashcardIndex - 1;
      setCurrentFlashcardIndex(prevIndex);
      setCurrentFlashcard(flashcardsForObjective[prevIndex]);
    }
  }, [currentFlashcardIndex, flashcardsForObjective]);

  const handleGenerateQuestionFromFlashcard = useCallback(async () => {
    if (!currentFlashcard || !studySession || !examProfile) return;
    
    try {
      const response = await fetch('/api/generate-question-from-flashcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcardTitle: currentFlashcard.title,
          flashcardContent: currentFlashcard.content,
          objectiveId: studySession.currentObjectiveId,
          examId: examProfile.id,
          difficulty: 'medium',
          questionCount: 1,
          stream: true
        }),
      });

      if (!response.ok) throw new Error('Failed to generate question');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let questionData: GeminiQuestion | null = null;

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
              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }

      if (questionData) {
        // Switch to flashcard-questions mode
        setActiveMode('flashcard-questions');
        setCurrentQuestion(questionData);
        setCurrentAnswer(null);
        setQuestionStartTime(new Date());
        
        if (studySession) {
          const updatedSession = StudySessionManager.switchActiveMode(studySession, 'flashcard-questions', currentFlashcard.id);
          setStudySession(updatedSession);
          StudySessionManager.saveSession(updatedSession);
        }
      }
      
    } catch (error) {
      console.error('Failed to generate question from flashcard:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate question');
    }
  }, [currentFlashcard, studySession, examProfile]);

  // Initialize study session
  useEffect(() => {
    const profile = getExamProfile(levelId);
    if (profile) {
      setExamProfile(profile);
      
      const config: StudySessionConfig = {
        examId: levelId,
        studyMode,
        examMode, // Add the new exam mode
        targetObjectiveIds,
        questionsPerObjective,
        adaptiveDifficulty: profile.studySettings?.adaptiveDifficulty || false,
        spaceRepetition: profile.studySettings?.spaceRepetition || false
      };
      
      const session = StudySessionManager.createStudySession(config, profile);
      setStudySession(session);
      StudySessionManager.saveSession(session);
      
      // Set initial active mode based on exam mode
      setActiveMode(session.activeMode);
      
      console.log('🎯 Enhanced Quiz: Created study session:', session);
      
      // Generate first question only for exam modes that need it
      // History mode doesn't need questions, but all exam modes do
      generateQuestionForCurrentObjective(session);
    } else {
      setError(`Exam profile not found for: ${levelId}`);
    }
  }, [levelId, studyMode, examMode, targetObjectiveIds, questionsPerObjective]);

  const generateQuestionForCurrentObjective = async (session: StudySession) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    setCurrentAnswer(null);
    setCurrentQuestion(null);
    setQuestionStartTime(new Date());
    
    // Reset streaming state
    setStreamingState({
      questionText: '',
      options: [],
      explanation: '',
      correctAnswer: -1,
      isComplete: false
    });
    
    console.log('🔄 Starting question generation - isGenerating:', true);
    
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
          questionType,
          examMode: session.examMode,
          difficulty: currentObjective.difficulty,
          previousQuestions: session.objectives
            .find(obj => obj.objectiveId === session.currentObjectiveId)
            ?.attempts.slice(-3).map(att => att.questionId) || []
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
              console.log('🔍 Received chunk:', { type: data.type, contentLength: data.content?.length, optionIndex: data.optionIndex });
              
              switch (data.type) {
                case 'question_text':
                  questionText = data.content;
                  console.log('📝 Streaming question text:', data.content.substring(0, 50) + '...');
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
                  console.log(`🔤 Streaming option ${data.optionIndex}:`, data.content.substring(0, 30) + '...');
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
                  console.log('🏁 Streaming complete - Final check:', {
                    hasQuestionText: !!questionText,
                    questionTextLength: questionText?.length || 0,
                    optionsCount: options.length,
                    hasExplanation: !!explanation,
                    correctAnswer
                  });
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

      console.log('🔍 Pre-build values:', {
        questionText: questionText || 'EMPTY',
        optionsArray: options,
        correctAnswer,
        explanation: explanation || 'EMPTY',
        isComplete,
        hasQuestionText: !!questionText,
        hasOptions: options.length > 0,
        hasExplanation: !!explanation
      });

      // Build the complete question object (explanations generated on-demand)
      const questionData = {
        question: questionText,
        options: options.filter(opt => opt && opt.trim().length > 0), // Remove undefined/empty options
        correct: correctAnswer,
        explanation: explanation || '' // Optional, may be empty for on-demand generation
      };

      console.log('🔍 Question building debug:', {
        questionText: questionText ? `"${questionText.substring(0, 50)}..."` : 'MISSING',
        optionsLength: options.length,
        filteredOptionsLength: questionData.options.length,
        correctAnswer: correctAnswer,
        explanation: explanation ? `"${explanation.substring(0, 50)}..."` : 'MISSING'
      });

      // Validate question structure with detailed logging (explanations no longer required)
      const validationErrors = [];
      if (!questionData.question || questionData.question.trim().length === 0) {
        validationErrors.push('question text');
      }
      if (!questionData.options || !Array.isArray(questionData.options)) {
        validationErrors.push('options array');
      } else if (questionData.options.length === 0) {
        validationErrors.push('option content');
      }
      if (correctAnswer < 0 || correctAnswer >= questionData.options.length) {
        validationErrors.push('valid correct answer index');
      }
      // Note: explanations are now generated on-demand, so not validated here

      if (validationErrors.length > 0) {
        console.error('❌ Invalid question format:', questionData);
        console.error('❌ Missing/invalid:', validationErrors.join(', '));
        throw new Error(`Invalid question format received from API. Missing: ${validationErrors.join(', ')}`);
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
      console.log('🏁 Question generation finished - isGenerating:', false);
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

  // Handler for early completion of efficient exam
  const handleEndEarlyEfficient = useCallback(() => {
    if (!studySession || studySession.examMode !== 'efficient') return;
    
    // Mark session as complete
    const updatedSession = {
      ...studySession,
      endTime: new Date()
    };
    setStudySession(updatedSession);
    StudySessionManager.saveSession(updatedSession);
    
    // Show results immediately
    setShowSessionSummary(true);
  }, [studySession]);

  const handleObjectiveSelect = (objectiveId: string) => {
    if (!studySession || isGenerating) return;
    
    const objectiveIndex = studySession.examProfile.objectives.findIndex(obj => obj.id === objectiveId);
    if (objectiveIndex !== -1 && objectiveId !== studySession.currentObjectiveId) {
      // Clear flashcard context when switching objectives and reset to quiz mode
      const updatedSession = {
        ...studySession,
        currentObjectiveId: objectiveId,
        currentObjectiveIndex: objectiveIndex,
        currentFlashcardSource: undefined, // Clear flashcard context
        activeMode: 'quiz' as const // Reset to quiz mode
      };
      setStudySession(updatedSession);
      StudySessionManager.saveSession(updatedSession);
      
      // Reset UI state
      setActiveMode('quiz');
      setCurrentFlashcard(null);
      setFlashcardsForObjective([]);
      setCurrentFlashcardIndex(0);
      
      // Generate new question for selected objective
      generateQuestionForCurrentObjective(updatedSession);
    }
  };

  const resetQuiz = () => {
    if (!examProfile) return;
    
    const config: StudySessionConfig = {
      examId: levelId,
      studyMode,
      examMode, // Add the new exam mode
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
    
    // Reset flashcard and mode state
    setActiveMode('quiz');
    setCurrentFlashcard(null);
    setFlashcardsForObjective([]);
    setCurrentFlashcardIndex(0);
    
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

  // Session completion - Use ExamResults for exam modes, simple summary for prep mode  
  if (showSessionSummary) {
    // For exam modes, show comprehensive ExamResults
    if (studySession.examMode === 'efficient' || studySession.examMode === 'mock') {
      return (
        <ExamResults
          studySession={studySession}
          examProfile={examProfile}
          onRetry={resetQuiz}
          onBackToMenu={onExit}
          onContinueStudy={() => {
            // Switch to prep mode for continued study
            setActiveMode('quiz');
            setShowSessionSummary(false);
            const updatedSession = { ...studySession, examMode: 'prep' as const };
            setStudySession(updatedSession);
            StudySessionManager.saveSession(updatedSession);
            generateQuestionForCurrentObjective(updatedSession);
          }}
          onTakeNextMode={(mode) => {
            // Navigate back to mode selection with new mode
            onBackToModeSelect?.();
          }}
        />
      );
    }

    // For prep mode, show simple completion summary
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
      {/* Headers - Hidden for exam modes (efficient/mock) as they have their own minimal headers */}
      {studySession.examMode === 'prep' && (
        <>
          {/* Compact Mobile Header */}
          <div className="md:hidden flex-none border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onExit}
              className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowObjectives(!showObjectives)}
              className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors touch-manipulation"
            >
              <Brain className="w-4 h-4" />
            </button>
            
            <div>
              <h1 className="text-sm font-bold text-white">{examProfile.name}</h1>
              <p className="text-xs text-white/70">
                {activeMode === 'quiz' ? `Q${studySession.totalQuestionsAnswered + 1}` : 
                 activeMode === 'flashcards' ? `F${currentFlashcardIndex + 1}` :
                 `FQ${studySession.totalQuestionsAnswered + 1}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded-full">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="text-white/90 text-xs font-medium">{studySession.totalQuestionsAnswered}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded-full">
              <Brain className="w-3 h-3 text-cyan-400" />
              <span className="text-white/90 text-xs font-medium">{Math.round(currentProgress?.averageScore || 0)}%</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Mode Switcher */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-lg">
            {/* Always show primary exam mode */}
            {examMode === 'prep' ? (
              <>
                <motion.button
                  onClick={() => handleModeSwitch('quiz')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                    activeMode === 'quiz'
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen className="w-3 h-3" />
                  Quiz
                </motion.button>
                <motion.button
                  onClick={() => handleModeSwitch('flashcards')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                    activeMode === 'flashcards'
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <CreditCard className="w-3 h-3" />
                  Flashcards
                </motion.button>
                <motion.button
                  onClick={() => handleModeSwitch('history')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                    activeMode === 'history'
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <History className="w-3 h-3" />
                  History
                </motion.button>
              </>
            ) : examMode === 'efficient' ? (
              <>
                <motion.button
                  onClick={() => handleModeSwitch('efficient')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                    activeMode === 'efficient'
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Target className="w-3 h-3" />
                  Assessment
                </motion.button>
                <motion.button
                  onClick={() => handleModeSwitch('history')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                    activeMode === 'history'
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <History className="w-3 h-3" />
                  History
                </motion.button>
              </>
            ) : examMode === 'mock' ? (
              <>
                <motion.button
                  onClick={() => handleModeSwitch('mock')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                    activeMode === 'mock'
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText className="w-3 h-3" />
                  Mock Exam
                </motion.button>
                <motion.button
                  onClick={() => handleModeSwitch('history')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-200 text-xs font-medium ${
                    activeMode === 'history'
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <History className="w-3 h-3" />
                  History
                </motion.button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden md:block flex-none p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              title="Exit Quiz"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-white">{examProfile.name}</h1>
              <p className="text-sm text-white/70">
                {activeMode === 'quiz' ? `Question ${studySession.totalQuestionsAnswered + 1}` : 
                 activeMode === 'flashcards' ? `Flashcard ${currentFlashcardIndex + 1}` :
                 activeMode === 'efficient' ? `Assessment ${studySession.totalQuestionsAnswered + 1} / ${studySession.examConditions.totalQuestions}` :
                 activeMode === 'mock' ? `Mock Exam ${studySession.totalQuestionsAnswered + 1} / ${studySession.examConditions.totalQuestions}` :
                 activeMode === 'history' ? 'Learning Progress' :
                 `Flashcard Question ${studySession.totalQuestionsAnswered + 1}`} • {currentObjective?.title}
              </p>
            </div>
            
            {/* Mode Switcher - Context aware based on exam mode */}
            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
              {examMode === 'prep' ? (
                <>
                  <motion.button
                    onClick={() => handleModeSwitch('quiz')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      activeMode === 'quiz'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BookOpen className="w-4 h-4" />
                    Quiz
                  </motion.button>
                  <motion.button
                    onClick={() => handleModeSwitch('flashcards')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      activeMode === 'flashcards'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CreditCard className="w-4 h-4" />
                    Flashcards
                  </motion.button>
                  <motion.button
                    onClick={() => handleModeSwitch('history')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      activeMode === 'history'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <History className="w-4 h-4" />
                    History
                  </motion.button>
                </>
              ) : examMode === 'efficient' ? (
                <>
                  <motion.button
                    onClick={() => handleModeSwitch('efficient')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      activeMode === 'efficient'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Target className="w-4 h-4" />
                    Assessment
                  </motion.button>
                  <motion.button
                    onClick={() => handleModeSwitch('history')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      activeMode === 'history'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <History className="w-4 h-4" />
                    History
                  </motion.button>
                </>
              ) : examMode === 'mock' ? (
                <>
                  <motion.button
                    onClick={() => handleModeSwitch('mock')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      activeMode === 'mock'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FileText className="w-4 h-4" />
                    Mock Exam
                  </motion.button>
                  <motion.button
                    onClick={() => handleModeSwitch('history')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      activeMode === 'history'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <History className="w-4 h-4" />
                    History
                  </motion.button>
                </>
              ) : null}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-white/90 text-sm font-medium">
                {studySession.totalQuestionsAnswered}
              </span>
            </div>

            {/* Current objective mastery */}
            {currentObjective && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-white/90 text-sm font-medium">
                  {Math.round(currentProgress?.averageScore || 0)}%
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
      </div>

          {/* Desktop Enhanced Objectives Strip - Hidden on Mobile */}
          <div className="hidden md:block">
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
        </>
      )}

      {/* Main content - Full height, exam modes handle their own layout */}
      <div className={`flex-1 ${
        studySession.examMode === 'prep' 
          ? 'relative overflow-hidden' 
          : '' // Exam modes are full-screen
      }`}>
        <div className={studySession.examMode === 'prep' ? 'absolute inset-0 overflow-y-auto' : ''}>
          {activeMode === 'efficient' ? (
            <EfficientExamMode
              studySession={studySession}
              examProfile={examProfile}
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
              isStreaming={isGenerating}
              streamingState={streamingState}
              onNext={handleNext}
              onComplete={() => setShowSessionSummary(true)}
              onEndEarly={handleEndEarlyEfficient}
            />
          ) : activeMode === 'mock' ? (
            <MockExamMode
              studySession={studySession}
              examProfile={examProfile}
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
              isStreaming={isGenerating}
              streamingState={streamingState}
              onNext={handleNext}
              onComplete={() => setShowSessionSummary(true)}
            />
          ) : activeMode === 'flashcards' ? (
            <FlashcardStudyMode
              flashcard={currentFlashcard}
              flashcardIndex={currentFlashcardIndex}
              totalFlashcards={flashcardsForObjective.length}
              objectiveName={currentObjective?.title}
              examName={examProfile.name}
              isGenerating={isGeneratingFlashcard}
              onAnswer={handleFlashcardAnswer}
              onNext={handleNextFlashcard}
              onPrevious={handlePreviousFlashcard}
              onGenerateQuestion={handleGenerateQuestionFromFlashcard}
              onGenerateNewFlashcard={loadFlashcardsForCurrentObjective}
            />
          ) : activeMode === 'history' ? (
            <LearningHistory
              studySession={studySession}
            />
          ) : activeMode === 'flashcard-questions' ? (
            <FlashcardQuestionMode
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
              onBackToFlashcards={() => setActiveMode('flashcards')}
              flashcardContext={studySession.currentFlashcardSource ? {
                title: currentFlashcard?.title || 'Flashcard',
                id: studySession.currentFlashcardSource
              } : undefined}
            />
          ) : (
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
          )}
        </div>
      </div>

      {/* Mobile Objectives Sidebar Overlay - Only for prep mode */}
      {studySession.examMode === 'prep' && showObjectives && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowObjectives(false)}>
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 h-full bg-black/90 backdrop-blur-xl border-r border-white/20 p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Learning Objectives</h3>
              <button
                onClick={() => setShowObjectives(false)}
                className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {examProfile.objectives.map(obj => {
                const progress = studySession.objectives.find(p => p.objectiveId === obj.id);
                const isActive = obj.id === studySession.currentObjectiveId;
                
                return (
                  <button
                    key={obj.id}
                    onClick={() => {
                      handleObjectiveSelect(obj.id);
                      setShowObjectives(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-100'
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{obj.title}</div>
                        <div className="text-xs text-white/60">
                          {obj.weight}% • {progress?.questionsAttempted || 0} questions
                        </div>
                        {progress && (
                          <div className="text-xs text-cyan-300">
                            {Math.round(progress.averageScore)}% mastery
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}


      {/* Navigation - Remove old bottom bar since it's now in CertificationQuizPage */}
    </div>
  );
};
