'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Clock, User, BookOpen, MapPin, Video } from 'lucide-react';
import { GlassCard } from './glass-card';

interface Session {
  id: string;
  time: string;
  studentId: string;
  student: string;
  subject: string;
  board: string;
  location: string;
  status: 'active' | 'upcoming' | 'completed';
  duration: string;
  sessionType: string;
}

interface SessionSelectorProps {
  sessions: Session[];
  selectedSession: Session;
  onSessionSelect: (session: Session) => void;
}

export function SessionSelector({ sessions, selectedSession, onSessionSelect }: SessionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-3 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white hover:bg-slate-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            selectedSession.status === 'active' ? 'bg-green-400' :
            selectedSession.status === 'upcoming' ? 'bg-yellow-400' : 'bg-gray-400'
          }`} />
          <span className="text-sm font-light">{selectedSession.time}</span>
        </div>
        <div className="text-sm text-white/80">
          {selectedSession.student} • {selectedSession.subject}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              className="absolute right-0 top-full mt-2 w-80 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <GlassCard className="p-4" hover={false}>
                <div className="space-y-3">
                  <div className="text-sm font-light text-white/90 mb-3">Today's Sessions</div>
                  {sessions.map((session, index) => (
                    <button
                      key={session.id}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSession.id === session.id 
                          ? 'bg-slate-700 border border-slate-600' 
                          : 'hover:bg-slate-800/50 border border-transparent'
                      }`}
                      onClick={() => {
                        onSessionSelect(session);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            session.status === 'active' ? 'bg-green-400' :
                            session.status === 'upcoming' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`} />
                          <Clock className="h-3 w-3 text-white/70" />
                          <span className="text-sm font-light text-white/90">{session.time}</span>
                        </div>
                        <span className="text-xs text-white/60">{session.duration}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-3 w-3 text-white/70" />
                        <span className="text-sm text-white/90">{session.student}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="h-3 w-3 text-white/70" />
                        <span className="text-xs text-white/80">{session.subject}</span>
                        <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full text-white/80">
                          {session.board}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <div className="flex items-center space-x-1">
                          {session.location === 'Online' ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <MapPin className="h-3 w-3" />
                          )}
                          <span>{session.location}</span>
                        </div>
                        <span className="text-white/80">{session.sessionType}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
