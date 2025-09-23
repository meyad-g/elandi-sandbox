'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Video, 
  MapPin,
  Phone,
  FileText,
  Play
} from 'lucide-react';

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

interface SessionRailProps {
  sessions: Session[];
  selectedSession: Session;
  onSessionSelect: (session: Session) => void;
  viewMode: 'today' | 'week';
  onViewModeChange: (mode: 'today' | 'week') => void;
}

export function SessionRail({
  sessions,
  selectedSession,
  onSessionSelect,
  viewMode,
  onViewModeChange,
}: SessionRailProps) {
  return (
    <div className="w-80 bg-card border-r border-border p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Schedule</h2>
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'today' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('today')}
            className="text-xs px-3"
          >
            Today
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('week')}
            className="text-xs px-3"
          >
            Week
          </Button>
        </div>
      </div>

      {/* Session Cards */}
      <div className="space-y-3">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSession.id === session.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSessionSelect(session)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{session.time}</span>
                </div>
                <Badge 
                  variant={session.status === 'active' ? 'default' : 'outline'}
                  className={`text-xs ${session.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}`}
                >
                  {session.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{session.student}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="h-3 w-3 text-gray-500" />
                  <span>{session.subject}</span>
                  <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                    {session.board}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {session.location === 'Online' ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <MapPin className="h-3 w-3" />
                  )}
                  <span>{session.location}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <Play className="h-3 w-3 mr-1" />
                  Start Prep
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Notes
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  {session.location === 'Online' ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <Phone className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t">
        <Button variant="outline" className="w-full" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          View Full Calendar
        </Button>
      </div>
    </div>
  );
}
