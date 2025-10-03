'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface FormattedExplanationProps {
  explanation: string;
}

export const FormattedExplanation: React.FC<FormattedExplanationProps> = ({ explanation }) => {
  // Parse the formatted explanation
  const parseExplanation = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const sections: { type: 'correct' | 'wrong_header' | 'wrong_item' | 'text', content: string }[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('✓ **') && trimmedLine.includes('** is correct:')) {
        // Correct answer line
        const match = trimmedLine.match(/✓ \*\*(.*?)\*\* is correct: (.*)/);
        if (match) {
          sections.push({
            type: 'correct',
            content: `${match[1]} is correct: ${match[2]}`
          });
        }
      } else if (trimmedLine.startsWith('✗ **Why others are wrong:**')) {
        // Wrong answers header
        sections.push({
          type: 'wrong_header',
          content: 'Why others are wrong:'
        });
      } else if (trimmedLine.startsWith('• **') && trimmedLine.includes('**:')) {
        // Wrong answer item
        const match = trimmedLine.match(/• \*\*(.*?)\*\*: (.*)/);
        if (match) {
          sections.push({
            type: 'wrong_item',
            content: `${match[1]}: ${match[2]}`
          });
        }
      } else if (trimmedLine.length > 0) {
        // Regular text
        sections.push({
          type: 'text',
          content: trimmedLine
        });
      }
    }
    
    return sections;
  };

  const sections = parseExplanation(explanation);

  return (
    <div className="space-y-3 sm:space-y-4">
      {sections.map((section, index) => {
        switch (section.type) {
          case 'correct':
            return (
              <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-100 font-medium leading-relaxed text-sm sm:text-base">
                    {section.content}
                  </p>
                </div>
              </div>
            );
            
          case 'wrong_header':
            return (
              <div key={index} className="flex items-center gap-2 mt-4 sm:mt-6 mb-2 sm:mb-3">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                <h4 className="text-red-300 font-medium text-sm sm:text-base">{section.content}</h4>
              </div>
            );
            
          case 'wrong_item':
            const [option, reason] = section.content.split(': ');
            return (
              <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg ml-1 sm:ml-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-300 text-xs sm:text-sm font-medium">{option}</span>
                </div>
                <p className="text-red-100/90 leading-relaxed text-sm sm:text-base">
                  {reason}
                </p>
              </div>
            );
            
          case 'text':
          default:
            return (
              <p key={index} className="text-white/80 leading-relaxed text-sm sm:text-base">
                {section.content}
              </p>
            );
        }
      })}
    </div>
  );
};
