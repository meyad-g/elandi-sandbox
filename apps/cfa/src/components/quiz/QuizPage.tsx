import React, { useState, useEffect } from 'react';
import { Question, Answer } from '../../types/quiz';
import { Button } from '../ui/Button';
import { SkillChip } from '../ui/SkillChip';

interface QuizPageProps {
  question: Question;
  index: number;
  onAnswer: (choice: boolean) => void;
  answered?: Answer;
  displaySkills?: string[];
}

export const QuizPage: React.FC<QuizPageProps> = ({
  question,
  index,
  onAnswer,
  answered,
  displaySkills
}) => {
  const [revealed, setRevealed] = useState(Boolean(answered));

  useEffect(() => {
    setRevealed(Boolean(answered));
  }, [answered]);

  const handleAnswer = (choice: boolean) => {
    onAnswer(choice);
    setRevealed(true);
  };

  return (
    <section className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-sm text-gray-400 mb-2">Question {index + 1}</div>
        <h2 className="text-xl font-bold leading-tight mb-3 text-white">
          {question.text}
        </h2>

        {displaySkills && displaySkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {displaySkills.map((skill) => (
              <SkillChip key={skill} skill={skill} variant="default" />
            ))}
          </div>
        )}

        <div className="flex gap-3 w-full mb-4">
          <Button
            variant="secondary"
            className={`flex-1 py-4 text-lg font-bold ${
              revealed
                ? question.answer === true
                  ? 'bg-green-500/30 border-green-500/60 text-green-100'
                  : 'bg-red-500/30 border-red-500/60 text-red-100'
                : ''
            }`}
            disabled={revealed}
            onClick={() => handleAnswer(true)}
          >
            True
          </Button>
          <Button
            variant="secondary"
            className={`flex-1 py-4 text-lg font-bold ${
              revealed
                ? question.answer === false
                  ? 'bg-green-500/30 border-green-500/60 text-green-100'
                  : 'bg-red-500/30 border-red-500/60 text-red-100'
                : ''
            }`}
            disabled={revealed}
            onClick={() => handleAnswer(false)}
          >
            False
          </Button>
        </div>

        {revealed && (
          <div className="bg-gradient-to-br from-white/7 to-white/4 border border-white/20 rounded-xl p-4">
            <div className={`inline-block px-3 py-1 rounded-lg text-sm font-bold mb-3 ${
              answered?.correct
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {answered?.correct ? 'Correct' : `Incorrect — ${question.answer ? 'True' : 'False'}`}
            </div>
            <p className="text-gray-200 mb-3">{question.why}</p>
            <p className="text-sm text-gray-400">Swipe/scroll to continue →</p>
          </div>
        )}
      </div>
    </section>
  );
};
