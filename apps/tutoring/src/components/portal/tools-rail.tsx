'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Clock, 
  Calculator, 
  BookOpen,
  Target,
  Settings,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

interface Student {
  id: string;
  name: string;
  avatar: string;
  year: string;
  board: string;
  exams: string[];
  nextDeadlines: string[];
  currentGaps: string[];
  lastLessonSummary: string;
  upcomingObjective: string;
}

interface Session {
  id: string;
  time: string;
  studentId: string;
  student: string;
  subject: string;
  board: string;
  location: string;
  status: 'active' | 'upcoming' | 'completed';
}

interface ToolsRailProps {
  session: Session;
  student: Student;
}

export function ToolsRail({ session, student }: ToolsRailProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const contextChips = [
    { id: 'board', label: session.board, type: 'exam-board', removable: false },
    { id: 'subject', label: session.subject, type: 'subject', removable: false },
    { id: 'level', label: student.year, type: 'level', removable: false },
  ];

  const availableChips = [
    { id: 'integration', label: 'Integration', type: 'topic' },
    { id: 'substitution', label: 'Substitution', type: 'topic' },
    { id: 'grade-79', label: 'Grade 7-9', type: 'difficulty' },
    { id: 'no-calc', label: 'Non-calculator', type: 'format' },
    { id: '30min', label: '30 mins', type: 'time' },
    { id: '60min', label: '60 mins', type: 'time' },
    { id: 'exam-style', label: 'Exam-style', type: 'format' },
    { id: 'practice', label: 'Practice', type: 'goal' },
    { id: 'stretch', label: 'Stretch', type: 'goal' },
  ];

  const filterOptions = [
    { id: 'difficulty', label: 'Difficulty', icon: Target },
    { id: 'format', label: 'Format', icon: BookOpen },
    { id: 'time', label: 'Time box', icon: Clock },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
  ];

  const toggleChip = (chipId: string) => {
    setActiveFilters(prev =>
      prev.includes(chipId)
        ? prev.filter(id => id !== chipId)
        : [...prev, chipId]
    );
  };

  const getChipColor = (type: string) => {
    switch (type) {
      case 'exam-board': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'subject': return 'bg-green-100 text-green-800 border-green-200';
      case 'level': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'topic': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'difficulty': return 'bg-red-100 text-red-800 border-red-200';
      case 'format': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'time': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'goal': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
      {/* Context Chips */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Smart Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {contextChips.map((chip) => (
              <Badge
                key={chip.id}
                variant="secondary"
                className={`text-xs px-2 py-1 ${getChipColor(chip.type)}`}
              >
                {chip.label}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Auto-detected from your session
          </p>
        </CardContent>
      </Card>

      {/* Available Chips */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span>Quick Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {availableChips.map((chip) => (
              <Badge
                key={chip.id}
                variant={activeFilters.includes(chip.id) ? "default" : "outline"}
                className={`text-xs px-2 py-1 cursor-pointer transition-colors hover:opacity-80 ${
                  activeFilters.includes(chip.id) 
                    ? getChipColor(chip.type) 
                    : 'hover:bg-accent'
                }`}
                onClick={() => toggleChip(chip.id)}
              >
                {chip.label}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Tap to add or remove filters
          </p>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Filter className="h-4 w-4 text-green-500" />
            <span>Advanced Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                >
                  <Icon className="h-3 w-3 mr-2" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Session Info */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span>Session Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Student:</span>
              <span className="font-medium">{student.name}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{session.subject}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Board:</span>
              <span className="font-medium">{session.board}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{session.time}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{session.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-500" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Reset Filters
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs">
              Save Preset
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs">
              Export Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
