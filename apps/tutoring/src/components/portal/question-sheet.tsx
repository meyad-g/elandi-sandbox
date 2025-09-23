'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye,
  EyeOff,
  Calculator,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface Question {
  question: string;
  marks: number;
  modelAnswer: string;
  markScheme: string[];
  commonMistakes: string[];
}

interface QuestionSheetProps {
  questions: Question[];
  examBoard: string;
  totalMarks: number;
  calculatorAllowed: boolean;
}

export function QuestionSheet({ questions, examBoard, totalMarks, calculatorAllowed }: QuestionSheetProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestionExpansion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <div className="space-y-8">
      {/* Question Sheet Header */}
      <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-cyan-500/5" />
        
        {/* Top highlight */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-white font-light text-4xl tracking-tight flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📝</span>
                </div>
                <span>Question Sheet</span>
              </h4>
              <p className="text-white/60 text-lg font-light">Exam-style questions with detailed mark schemes</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Print Questions</span>
              </motion.button>
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Print with Answers</span>
              </motion.button>
              <motion.button
                onClick={() => setShowAnswers(!showAnswers)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg ${
                  showAnswers 
                    ? 'bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>
                  {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Question Sheet Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-5 border border-blue-400/20">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-blue-300 font-medium text-sm">Exam Board</div>
                  <div className="text-white font-semibold text-lg">{examBoard}</div>
                </div>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-5 border border-green-400/20">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-green-300 font-medium text-sm">Total Marks</div>
                  <div className="text-white font-semibold text-lg">{totalMarks}</div>
                </div>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-slate-500/10 to-gray-500/10 backdrop-blur-sm rounded-2xl p-5 border border-slate-400/20">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent" />
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  calculatorAllowed 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-red-500 to-pink-600'
                }`}>
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-slate-300 font-medium text-sm">Calculator</div>
                  <div className="text-white font-semibold text-lg">{calculatorAllowed ? 'Allowed' : 'Not Allowed'}</div>
                </div>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-5 border border-purple-400/20">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-purple-300 font-medium text-sm">Questions</div>
                  <div className="text-white font-semibold text-lg">{questions.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, index) => (
          <motion.div
            key={index}
            className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
          >
            {/* Subtle question-specific glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-pink-500/3" />
            
            {/* Top highlight */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="relative z-10">
              {/* Question Header */}
              <div className="p-8 border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="text-white font-light text-3xl tracking-tight">Question {index + 1}</h5>
                  <div className="flex items-center space-x-4">
                    <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-lg rounded-2xl font-medium shadow-lg">
                      {question.marks} marks
                    </div>
                    {showAnswers && (
                      <motion.button
                        onClick={() => toggleQuestionExpansion(index)}
                        className="px-6 py-3 bg-black/30 hover:bg-black/40 border border-white/20 text-white rounded-2xl transition-all duration-200 font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {expandedQuestions.has(index) ? 'Show Less' : 'Show More'}
                      </motion.button>
                    )}
                  </div>
                </div>
                
                {/* Question Text */}
                <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <p className="text-white text-xl leading-relaxed font-light">{question.question}</p>
                </div>
              </div>

            {/* Answer Section */}
            {showAnswers && (
              <div className="p-6 bg-slate-800/30">
                <div className="space-y-5">
                  {/* Model Answer */}
                  <div>
                    <h6 className="text-green-400 font-bold text-base mb-3 flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Model Answer</span>
                    </h6>
                    <div className="bg-green-600/20 p-4 rounded-xl border border-green-600/40">
                      <p className="text-white text-base leading-relaxed font-mono">{question.modelAnswer}</p>
                    </div>
                  </div>

                  {/* Mark Scheme */}
                  {expandedQuestions.has(index) && question.markScheme && question.markScheme.length > 0 && (
                    <div>
                      <h6 className="text-blue-400 font-medium text-sm mb-2">Mark Scheme</h6>
                      <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-700/30">
                        <ul className="space-y-1">
                          {question.markScheme.map((point, pointIndex) => (
                            <li key={pointIndex} className="text-white text-sm flex items-start space-x-2">
                              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">•</span>
                              </div>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {expandedQuestions.has(index) && question.commonMistakes && question.commonMistakes.length > 0 && (
                    <div>
                      <h6 className="text-red-400 font-medium text-sm mb-2 flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Common Mistakes</span>
                      </h6>
                      <div className="bg-red-900/20 p-3 rounded-lg border border-red-700/30">
                        <ul className="space-y-1">
                          {question.commonMistakes.map((mistake, mistakeIndex) => (
                            <li key={mistakeIndex} className="text-white text-sm flex items-start space-x-2">
                              <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">!</span>
                              </div>
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
