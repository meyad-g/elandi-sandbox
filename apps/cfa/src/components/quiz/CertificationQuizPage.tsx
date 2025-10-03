import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, TrueFalseQuestion, MultipleChoiceQuestion, MultipleResponseQuestion, VignetteQuestion, EssayQuestion } from '@sandbox-apps/ai';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle, Clock, Target, Book, FileText, Eye, ArrowLeft, ChevronRight } from 'lucide-react';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

interface CertificationAnswer {
  questionId?: string;
  // For true/false
  booleanAnswer?: boolean;
  // For multiple choice
  selectedOption?: number;
  // For multiple response
  selectedOptions?: number[];
  // For essay
  essayText?: string;
  correct?: boolean;
  points?: number;
}

interface CertificationQuizPageProps {
  question: Question;
  index: number;
  onAnswer: (answer: CertificationAnswer) => void;
  answered?: CertificationAnswer;
  examName?: string;
  objectiveName?: string;
  isStreaming?: boolean;
  streamingState?: {
    thinking: string;
    questionText: string;
    options: string[];
    explanation: string;
    correctAnswer: number;
    isComplete: boolean;
  };
  onNext?: () => void; // Add onNext callback
}

export const CertificationQuizPage: React.FC<CertificationQuizPageProps> = ({
  question,
  index,
  onAnswer,
  answered,
  examName,
  objectiveName,
  isStreaming = false,
  streamingState,
  onNext
}) => {
  const [revealed, setRevealed] = useState(Boolean(answered));
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [essayText, setEssayText] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  // Helper function to clean option text of redundant prefixes
  const cleanOptionText = (text: string): string => {
    // Remove A), B), C), D) etc. prefixes (with optional space)
    return text.replace(/^[A-Z]\)\s*/, '').trim();
  };

  useEffect(() => {
    setRevealed(Boolean(answered));
    setShowExplanation(false); // Reset explanation view
    // Reset local state when question changes
    setSelectedOptions([]);
    setEssayText('');
    
    // Populate existing answers
    if (answered) {
      if (answered.selectedOptions) {
        setSelectedOptions(answered.selectedOptions);
      }
      if (answered.essayText) {
        setEssayText(answered.essayText);
      }
    }
  }, [answered, question]);

  const handleTrueFalseAnswer = (choice: boolean) => {
    const correct = (question as TrueFalseQuestion).answer === choice;
    const answer: CertificationAnswer = {
      booleanAnswer: choice,
      correct,
      points: correct ? 1 : 0
    };
    onAnswer(answer);
    setRevealed(true);
  };

  const handleMultipleChoiceAnswer = (optionIndex: number) => {
    const correct = (question as MultipleChoiceQuestion).correct === optionIndex;
    const answer: CertificationAnswer = {
      selectedOption: optionIndex,
      correct,
      points: correct ? 1 : 0
    };
    onAnswer(answer);
    setRevealed(true);
  };

  const handleMultipleResponseSubmit = () => {
    const mcQuestion = question as MultipleResponseQuestion;
    const correctSet = new Set(mcQuestion.correct);
    const selectedSet = new Set(selectedOptions);
    
    // Check if sets are equal
    const correct = correctSet.size === selectedSet.size && 
                   [...correctSet].every(x => selectedSet.has(x));
    
    const answer: CertificationAnswer = {
      selectedOptions: [...selectedOptions],
      correct,
      points: correct ? 1 : 0
    };
    onAnswer(answer);
    setRevealed(true);
  };

  const handleEssaySubmit = () => {
    const answer: CertificationAnswer = {
      essayText,
      points: 0 // Essays need manual grading
    };
    onAnswer(answer);
    setRevealed(true);
  };

  const toggleMultipleResponseOption = (optionIndex: number) => {
    if (revealed) return;
    
    const newSelected = selectedOptions.includes(optionIndex)
      ? selectedOptions.filter(i => i !== optionIndex)
      : [...selectedOptions, optionIndex];
    
    setSelectedOptions(newSelected);
  };

  const getQuestionTypeIcon = () => {
    switch (question.type) {
      case 'true_false':
        return <CheckCircle className="w-4 h-4" />;
      case 'multiple_choice':
        return <Target className="w-4 h-4" />;
      case 'multiple_response':
        return <Book className="w-4 h-4" />;
      case 'vignette':
        return <FileText className="w-4 h-4" />;
      case 'essay':
        return <FileText className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case 'true_false':
        return 'True/False';
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'multiple_response':
        return 'Multiple Response';
      case 'vignette':
        return 'Vignette';
      case 'essay':
        return 'Essay';
      default:
        return 'Question';
    }
  };

  const renderTrueFalseQuestion = (tfQuestion: TrueFalseQuestion) => (
    <div className="flex gap-3 w-full mb-3">
      <Button
        variant="secondary"
        className={`flex-1 py-3 text-base font-bold transition-all duration-200 ${
          revealed
            ? tfQuestion.answer === true
              ? 'bg-green-500/30 border-green-500/60 text-green-100'
              : 'bg-red-500/30 border-red-500/60 text-red-100'
            : 'hover:bg-white/10'
        }`}
        disabled={revealed}
        onClick={() => handleTrueFalseAnswer(true)}
      >
        True
      </Button>
      <Button
        variant="secondary"
        className={`flex-1 py-3 text-base font-bold transition-all duration-200 ${
          revealed
            ? tfQuestion.answer === false
              ? 'bg-green-500/30 border-green-500/60 text-green-100'
              : 'bg-red-500/30 border-red-500/60 text-red-100'
            : 'hover:bg-white/10'
        }`}
        disabled={revealed}
        onClick={() => handleTrueFalseAnswer(false)}
      >
        False
      </Button>
    </div>
  );

  const renderMultipleChoiceQuestion = (mcQuestion: MultipleChoiceQuestion) => (
    <div className="space-y-2 mb-3">
      {mcQuestion.options.map((option, index) => {
        const isCorrect = mcQuestion.correct === index;
        const isSelected = answered?.selectedOption === index;
        const shouldShow = !isStreaming || (streamingState && index < streamingState.options.length);
        const isPlaceholder = isStreaming && (!streamingState?.options[index] || streamingState.options[index] === '');
        
        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: shouldShow ? 1 : 0.3,
              x: 0 
            }}
            transition={{ 
              duration: 0.4,
              delay: isStreaming ? 0.5 + (index * 0.2) : 0
            }}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
              isPlaceholder
                ? 'bg-slate-700/30 border-slate-600/30 cursor-not-allowed'
                : revealed
                ? isCorrect
                  ? 'bg-green-500/20 border-green-500/60 text-green-100'
                  : isSelected
                    ? 'bg-red-500/20 border-red-500/60 text-red-100'
                    : 'bg-white/5 border-white/20 text-white/70'
                : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
            }`}
            disabled={revealed || isStreaming || isPlaceholder}
            onClick={() => !isStreaming && handleMultipleChoiceAnswer(index)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                isPlaceholder
                  ? 'border-slate-500 bg-slate-600/30 text-slate-400'
                  : revealed && isCorrect
                  ? 'border-green-500 bg-green-500 text-white'
                  : revealed && isSelected
                    ? 'border-red-500 bg-red-500 text-white'
                    : 'border-white/30 text-white/70'
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex-1 text-sm">
                {isPlaceholder ? (
                  <span className="text-slate-400">Loading option...</span>
                ) : (
                  <MarkdownRenderer content={cleanOptionText(option)} className="text-white" />
                )}
              </div>
              {revealed && isCorrect && !isPlaceholder && <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
              {revealed && isSelected && !isCorrect && !isPlaceholder && <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
            </div>
          </motion.button>
        );
      })}
    </div>
  );

  const renderMultipleResponseQuestion = (mrQuestion: MultipleResponseQuestion) => {
    const minSelect = mrQuestion.minSelect || 2;
    const canSubmit = selectedOptions.length >= minSelect && !revealed;
    
    return (
      <div className="space-y-3 mb-4">
        <div className="text-sm text-white/70 mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
          <strong>Select {mrQuestion.minSelect ? `at least ${mrQuestion.minSelect}` : 'multiple'} answers.</strong>
          {mrQuestion.maxSelect && ` (Maximum ${mrQuestion.maxSelect})`}
        </div>
        
        {mrQuestion.options.map((option, index) => {
          const isCorrect = mrQuestion.correct.includes(index);
          const isSelected = selectedOptions.includes(index);
          
          return (
            <button
              key={index}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                revealed
                  ? isCorrect
                    ? 'bg-green-500/20 border-green-500/60 text-green-100'
                    : isSelected
                      ? 'bg-red-500/20 border-red-500/60 text-red-100'
                      : 'bg-white/5 border-white/20 text-white/70'
                  : isSelected
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-100'
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
              }`}
              disabled={revealed}
              onClick={() => toggleMultipleResponseOption(index)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded border-2 flex items-center justify-center ${
                  revealed && isCorrect
                    ? 'border-green-500 bg-green-500'
                    : revealed && isSelected
                      ? 'border-red-500 bg-red-500'
                      : isSelected
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-white/30'
                }`}>
                  {(isSelected || (revealed && isCorrect)) && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="flex-1">{option}</span>
              </div>
            </button>
          );
        })}
        
        {!revealed && (
          <Button
            variant="primary"
            className={`w-full mt-4 ${canSubmit ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!canSubmit}
            onClick={handleMultipleResponseSubmit}
          >
            Submit Answers ({selectedOptions.length} selected)
          </Button>
        )}
      </div>
    );
  };

  const renderVignetteQuestion = (vQuestion: VignetteQuestion) => (
    <div className="space-y-6 mb-4">
      {/* Vignette text */}
      <div className="bg-white/5 border border-white/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-white/70" />
          <span className="text-sm font-medium text-white/70">Scenario</span>
        </div>
        <div className="text-white leading-relaxed whitespace-pre-line">
          {vQuestion.vignette}
        </div>
      </div>
      
      {/* Sub-questions */}
      <div className="space-y-4">
        {vQuestion.questions.map((subQuestion, subIndex) => (
          <div key={subIndex} className="border-l-4 border-cyan-400/30 pl-4">
            <div className="text-sm text-white/70 mb-2">Question {subIndex + 1}</div>
            <div className="text-white mb-3">{subQuestion.text}</div>
            {/* Render as multiple choice */}
            {renderMultipleChoiceQuestion(subQuestion as MultipleChoiceQuestion)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderEssayQuestion = (eQuestion: EssayQuestion) => (
    <div className="space-y-4 mb-4">
      {/* Rubric */}
      {eQuestion.rubric && (
        <div className="bg-white/5 border border-white/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-white/70" />
            <span className="text-sm font-medium text-white/70">
              Grading Rubric (Total: {eQuestion.rubric.maxPoints} points)
            </span>
          </div>
          <div className="space-y-2">
            {eQuestion.rubric.criteria.map((criterion, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-white/80">{criterion.item}</span>
                <span className="text-white font-medium">{criterion.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Essay input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Your Response:</label>
        <textarea
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          disabled={revealed}
          placeholder="Write your detailed response here..."
          className="w-full h-40 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-cyan-400/50 focus:bg-white/10"
        />
        <div className="text-xs text-white/50">
          {essayText.length} characters • ~{Math.ceil(essayText.split(' ').length / 4)} words
        </div>
      </div>
      
      {!revealed && (
        <Button
          variant="primary"
          className={`w-full ${essayText.trim().length < 50 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={essayText.trim().length < 50}
          onClick={handleEssaySubmit}
        >
          Submit Essay
        </Button>
      )}
    </div>
  );

  const renderAnswerExplanation = () => {
    // Remove the old scattered UI - we'll put everything in the bottom bar
    return null;
  };

  // New consolidated bottom bar with all controls
  const renderBottomBar = () => {
    if (!revealed || showExplanation) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-600/30 p-4 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left: Result Status */}
          <div className="flex items-center gap-3">
            {answered?.correct ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold shadow-lg">
                <CheckCircle className="w-4 h-4" />
                Correct
              </div>
            ) : question.type === 'essay' ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold shadow-lg">
                <Clock className="w-4 h-4" />
                Submitted
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold shadow-lg">
                <XCircle className="w-4 h-4" />
                Incorrect
              </div>
            )}
            
            {answered?.points !== undefined && (
              <span className="text-sm text-white/70 font-medium">
                {answered.points} {answered.points === 1 ? 'point' : 'points'}
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowExplanation(true)}
              className="px-2 py-1 text-xs flex items-center gap-1 bg-slate-700 hover:bg-slate-600 border-slate-600"
            >
              <Eye className="w-3 h-3" />
              View Explanation
            </Button>
            
            {onNext && (
              <Button
                variant="primary"
                onClick={onNext}
                className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-0 shadow-lg flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExplanationView = () => {
    const mcQuestion = question as MultipleChoiceQuestion;
    const correctOption = mcQuestion.options?.[mcQuestion.correct];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Back button */}
        <button
          onClick={() => setShowExplanation(false)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Question
        </button>

        {/* Correct Answer Box */}
        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center font-bold text-sm text-white">
              {String.fromCharCode(65 + mcQuestion.correct)}
            </div>
            <div className="flex-1">
              <div className="text-green-300 text-xs font-medium mb-1">Correct Answer</div>
              <MarkdownRenderer content={cleanOptionText(correctOption || 'N/A')} className="text-green-100" />
            </div>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-slate-800/40 border border-slate-600/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-cyan-400" />
            Explanation
          </h3>
          <div className="text-white/90 leading-relaxed max-h-80 overflow-y-auto pr-2">
            <MarkdownRenderer content={question.why} className="text-white/90" />
          </div>
        </div>
      </motion.div>
    );
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'true_false':
        return renderTrueFalseQuestion(question as TrueFalseQuestion);
      case 'multiple_choice':
        return renderMultipleChoiceQuestion(question as MultipleChoiceQuestion);
      case 'multiple_response':
        return renderMultipleResponseQuestion(question as MultipleResponseQuestion);
      case 'vignette':
        return renderVignetteQuestion(question as VignetteQuestion);
      case 'essay':
        return renderEssayQuestion(question as EssayQuestion);
        default:
          return <div className="text-red-400">Unknown question type: {(question as Question & { type: string }).type}</div>;
    }
  };

  return (
    <>
      <section className="min-h-full flex items-center justify-center p-4 pb-24">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            {showExplanation ? (
              renderExplanationView()
            ) : (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Question header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400">Question {index + 1}</div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                      {getQuestionTypeIcon()}
                      <span className="text-xs text-white/70">{getQuestionTypeLabel()}</span>
                    </div>
                    {isStreaming && (
                      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30">
                        <div className="w-2 h-2 border border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-cyan-300 text-xs font-medium">Generating...</span>
                      </div>
                    )}
                  </div>
                  
                  {(examName || objectiveName) && (
                    <div className="flex flex-col items-end text-xs text-white/50">
                      {examName && <div>{examName}</div>}
                      {objectiveName && <div>{objectiveName}</div>}
                    </div>
                  )}
                </div>

                {/* Question text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <div className={`${
                    isStreaming && !streamingState?.questionText 
                      ? 'text-white/50' 
                      : 'text-white'
                  }`}>
                    {isStreaming && !streamingState?.questionText ? (
                      <div className="text-lg font-bold">Generating question...</div>
                    ) : (
                      <MarkdownRenderer 
                        content={question.text} 
                        className="text-lg font-bold leading-tight" 
                      />
                    )}
                  </div>
                </motion.div>

                {/* Question content */}
                {renderQuestionContent()}

                {/* Answer result - removed, now in bottom bar */}
                {renderAnswerExplanation()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      
      {/* Consolidated Bottom Bar */}
      {renderBottomBar()}
    </>
  );
};
