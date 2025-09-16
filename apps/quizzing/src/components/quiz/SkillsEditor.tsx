import React, { useState } from 'react';
import { Question } from '../../types/quiz';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SkillChip } from '../ui/SkillChip';
import { SkillAnalysisResult } from '@sandbox-apps/ai';

interface SkillsEditorProps {
  skills: string[];
  questions: Question[];
  analysis?: SkillAnalysisResult;
  onNext: (data: { skills: string[]; deck: Question[] }) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  skills: initialSkills,
  questions,
  analysis: _analysis, // eslint-disable-line @typescript-eslint/no-unused-vars
  onNext
}) => {
  const [skills, setSkills] = useState(initialSkills);
  const [newSkill, setNewSkill] = useState('');
  const [filterOnly, setFilterOnly] = useState(false);

  const suggested = Array.from(new Set(
    questions.flatMap((q) => q.skills || [])
  )).filter((s) => !skills.includes(s));

  const addSkill = (skill?: string) => {
    const value = (skill || newSkill).trim();
    if (!value) return;
    if (!skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((k) => k !== skill));
  };

  const startQuiz = () => {
    const filtered = filterOnly
      ? questions.filter((q) => (q.skills || []).some((k) => skills.includes(k)))
      : questions;
    const deck = filtered.map((q) => ({
      ...q,
      skills: q.skills && q.skills.length ? q.skills : [] // tagQuestionSkills(q)
    }));
    onNext({ skills, deck });
  };

  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-pink-500" />
        <div className="font-bold text-lg">Review skills</div>
      </div>

      <div className="text-sm text-gray-400 mb-4">
        Add or remove skills before starting the quiz.
      </div>

      <div className="flex gap-3 w-full">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a skill (e.g., Feature Engineering)"
          className="flex-1"
        />
        <Button onClick={() => addSkill()} variant="secondary">
          Add
        </Button>
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-3">Selected skills</div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillChip
              key={skill}
              skill={skill}
              onRemove={() => removeSkill(skill)}
            />
          ))}
          {skills.length === 0 && (
            <span className="text-gray-500 text-sm">(none)</span>
          )}
        </div>
      </div>

      {suggested.length > 0 && (
        <div>
          <div className="text-sm text-gray-400 mb-3">Suggested from JD</div>
          <div className="flex flex-wrap gap-2">
            {suggested.map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                {skill} +
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-3 text-sm text-gray-400">
        <input
          type="checkbox"
          checked={filterOnly}
          onChange={(e) => setFilterOnly(e.target.checked)}
          className="rounded border-white/20 bg-white/10"
        />
        Filter questions to selected skills only
      </label>

      <Button onClick={startQuiz} variant="primary" className="mt-4">
        Start quiz
      </Button>
    </div>
  );
};
