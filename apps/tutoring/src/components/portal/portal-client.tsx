"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ShaderBackground from "@/components/shader-background"
import { StudentDashboard } from "@/components/portal/student-dashboard"
import { SmartPrepStream } from "@/components/portal/smart-prep-stream"
import { StudentManagement } from "@/components/portal/student-management"
import { User, Plus, LogOut, X, ChevronDown, GraduationCap, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Student } from "@/lib/database/types"

interface PortalClientProps {
  tutor: any
  initialStudents: Student[]
  userId: string
  userMetadata?: any
}

export function PortalClient({ tutor, initialStudents, userId, userMetadata }: PortalClientProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    initialStudents.length > 0 ? initialStudents[0] : null,
  )
  const [activePrep, setActivePrep] = useState<string | null>(null)
  const [showStudentManagement, setShowStudentManagement] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isStudentSelectorOpen, setIsStudentSelectorOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleSignOut = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) {
      return
    }
    
    setIsSigningOut(true)
    try {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
    }
  }

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setShowStudentManagement(false)
    // Reset any active prep when switching students
    if (activePrep) {
      setActivePrep(null)
    }
  }

  const handleStartPrep = (prepType: string) => {
    setActivePrep(prepType)
  }

  const handleClosePrep = () => {
    setActivePrep(null)
  }

  const handleStudentUpdate = (updatedStudents: Student[]) => {
    setStudents(updatedStudents)
    // If current selected student was updated, refresh it
    if (selectedStudent) {
      const updated = updatedStudents.find((s) => s.id === selectedStudent.id)
      if (updated) {
        setSelectedStudent(updated)
      }
    }
    // If this is the first student added, select them automatically
    if (students.length === 0 && updatedStudents.length === 1) {
      setSelectedStudent(updatedStudents[0])
      setShowStudentManagement(false) // Go back to dashboard
    }
  }

  return (
    <ShaderBackground>
      <div className="min-h-screen relative overflow-hidden">
        {/* Top Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-3 lg:p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/20 rounded-lg flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {(userMetadata?.given_name || tutor.first_name)?.[0]}
                  {(userMetadata?.family_name || tutor.last_name)?.[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">
                    {userMetadata?.name || userMetadata?.full_name || `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() || 'User'}
                  </span>
                  <span className="text-white/60 text-xs">
                    Tutor
                </span>
                </div>
              </div>

              {/* Student Selector Dropdown - Only show if multiple students */}
              {students.length > 1 ? (
                <div className="relative">
                  <button
                    className="flex items-center space-x-3 px-4 py-2 bg-slate-800/80 border border-slate-600/50 rounded-lg text-white hover:bg-slate-700/80 transition-colors backdrop-blur-sm"
                    onClick={() => setIsStudentSelectorOpen(!isStudentSelectorOpen)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {selectedStudent?.name.split(" ").map(n => n[0]).join("") || "?"}
                      </div>
                      <span className="text-sm font-light">{selectedStudent?.name || "Select Student"}</span>
                    </div>
                    {selectedStudent?.grade_level && (
                      <div className="text-sm text-white/80">
                        {selectedStudent.grade_level} • {selectedStudent.subjects?.[0] || "General"}
                      </div>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isStudentSelectorOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isStudentSelectorOpen && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          className="fixed inset-0 z-40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsStudentSelectorOpen(false)}
                        />
                        
                        {/* Dropdown */}
                        <motion.div
                          className="absolute right-0 top-full mt-2 w-80 z-50"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <div className="p-4 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl">
                            <div className="space-y-3">
                              <div className="text-sm font-light text-white/90 mb-3">Your Students</div>
                              {students.map((student) => (
                                <button
                                  key={student.id}
                                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                                    selectedStudent?.id === student.id 
                                      ? 'bg-slate-700 border border-slate-600' 
                                      : 'hover:bg-slate-800/50 border border-transparent'
                                  }`}
                                  onClick={() => {
                                    handleStudentSelect(student);
                                    setIsStudentSelectorOpen(false);
                                  }}
                                >
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                      {student.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="flex-1">
                                      <span className="text-sm font-medium text-white/90">{student.name}</span>
                                      {student.grade_level && (
                                        <div className="flex items-center space-x-1 mt-1">
                                          <GraduationCap className="h-3 w-3 text-white/70" />
                                          <span className="text-xs text-white/70">{student.grade_level}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {student.subjects && student.subjects.length > 0 && (
                                    <div className="flex items-center space-x-2 mb-2">
                                      <BookOpen className="h-3 w-3 text-white/70" />
                                      <span className="text-xs text-white/80">{student.subjects.slice(0, 2).join(", ")}</span>
                                      {student.subjects.length > 2 && (
                                        <span className="text-xs text-white/60">+{student.subjects.length - 2} more</span>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between text-xs text-white/60">
                                    <span>Added {new Date(student.created_at).toLocaleDateString()}</span>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                                      <span className="text-green-400">Active</span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Student count for single student */
                <div className="px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-xs text-white/80">
                {students.length} student{students.length !== 1 ? "s" : ""}
              </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {!showStudentManagement ? (
              <Button
                variant="ghost"
                size="sm"
                  onClick={() => setShowStudentManagement(true)}
                className="text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Manage Students</span>
              </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStudentManagement(false)}
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  <X className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                disabled={isSigningOut}
                className="text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-200"
              >
                <LogOut className={`h-4 w-4 ${isSigningOut ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </span>
              </Button>
            </div>
          </div>
        </nav>


        {/* Main Content */}
        <div className="pt-20 lg:pt-24 pb-8 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {showStudentManagement ? (
                <StudentManagement
                  key="student-management"
                  students={students}
                  tutorId={userId}
                  onStudentSelect={handleStudentSelect}
                  onStudentsUpdate={handleStudentUpdate}
                  onClose={() => setShowStudentManagement(false)}
                />
              ) : activePrep && selectedStudent ? (
                <SmartPrepStream
                  key="prep-stream"
                  prepType={activePrep}
                  student={selectedStudent}
                  session={{
                    id: "prep-session",
                    time: new Date().toLocaleTimeString(),
                    subject: selectedStudent.subjects?.[0] || "General",
                    board: selectedStudent.grade_level || "General",
                    duration: "60 minutes",
                    status: "active",
                    sessionType: "preparation"
                  }}
                  onClose={handleClosePrep}
                />
              ) : selectedStudent ? (
                <StudentDashboard
                  key="dashboard"
                  student={selectedStudent}
                  session={{
                    id: "default-session",
                    date: new Date().toISOString(),
                    time: new Date().toLocaleTimeString(),
                    status: "active",
                    duration: "1 hour",
                    sessionType: "tutoring",
                    board: selectedStudent.grade_level || "General",
                    subject: selectedStudent.subjects?.[0] || "General"
                  }}
                  onStartPrep={handleStartPrep}
                  isLoaded={isLoaded}
                />
              ) : (
                <motion.div
                  key="no-students"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center min-h-[70vh]"
                >
                  <div className="text-center max-w-md mx-auto px-6">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
                    >
                      <User className="h-12 w-12 text-white" />
                    </motion.div>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-8"
                    >
                      <h2 className="text-4xl font-light text-white mb-4 tracking-tight">Welcome to RoTutors</h2>
                      <p className="text-xl text-white/70 leading-relaxed">
                        Let's get started by adding your first student. You'll be able to create personalized lesson plans, track progress, and manage all your tutoring sessions from here.
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                  <Button
                    onClick={() => setShowStudentManagement(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105"
                  >
                        <Plus className="h-5 w-5 mr-3" />
                        Add Your First Student
                  </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
