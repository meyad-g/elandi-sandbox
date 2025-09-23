'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  BookOpen, 
  Calendar, 
  Target,
  Clock,
  Brain,
  FileQuestion,
  Search,
  MessageSquare,
  FileText,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

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

interface ActiveSessionProps {
  student: Student;
  session: Session;
  onStartPrep: (action: string) => void;
}

export function ActiveSession({ student, session, onStartPrep }: ActiveSessionProps) {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Student Header */}
      <Card className="mb-6 bg-gray-50 border-gray-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="text-lg font-semibold bg-gray-200 text-gray-700">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{student.year}</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{student.board || student.grade_level || "General"}</span>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Next Session</div>
              <div className="font-semibold">{session.time} • {session.subject}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Upcoming Exams
              </h3>
              <div className="space-y-1">
                {student.exams.map((exam, index) => (
                  <div key={index} className="text-sm">{exam}</div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Next Deadlines
              </h3>
              <div className="space-y-1">
                {student.nextDeadlines.map((deadline, index) => (
                  <div key={index} className="text-sm">{deadline}</div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Brief Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <span>60-Second Brief</span>
            <Badge variant="outline" className="ml-auto">Ready to read</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Last Lesson Summary</h4>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">
                  {student.lastLessonSummary}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Current Gaps</h4>
                <div className="flex flex-wrap gap-2">
                  {(student.currentGaps || student.current_gaps || []).map((gap, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Suggested Objective</h4>
                <p className="text-sm bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  {student.upcomingObjective}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Key Focus Today</h4>
                <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
                  Integration Techniques
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Start with a Template</CardTitle>
          <p className="text-sm text-muted-foreground">Choose your preparation approach</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => onStartPrep('lesson')}
            >
              <Brain className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Plan a Lesson</span>
              <span className="text-xs text-muted-foreground">60-min structured plan</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => onStartPrep('questions')}
            >
              <FileQuestion className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Generate Questions</span>
              <span className="text-xs text-muted-foreground">10 exam-style items</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => onStartPrep('resources')}
            >
              <Search className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Find Resources</span>
              <span className="text-xs text-muted-foreground">3 sources + 2 videos</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => onStartPrep('interview')}
            >
              <MessageSquare className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">Interview Drill</span>
              <span className="text-xs text-muted-foreground">Oxbridge prep</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => onStartPrep('notes')}
            >
              <FileText className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-medium">Weekly Note</span>
              <span className="text-xs text-muted-foreground">Auto-draft summary</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => onStartPrep('custom')}
            >
              <Lightbulb className="h-6 w-6 text-red-600" />
              <span className="text-sm font-medium">Custom Request</span>
              <span className="text-xs text-muted-foreground">Describe your needs</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Generated lesson plan for Quadratics</span>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Created 15 practice questions</span>
              </div>
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Found resources for Integration</span>
              </div>
              <span className="text-xs text-muted-foreground">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
