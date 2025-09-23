"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "./glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Edit, Trash2, User, Mail, BookOpen, GraduationCap, Target, AlertCircle, Save, Users, TrendingUp, Focus, FileText } from "lucide-react"
// API calls for student operations
import type { Student } from "@/lib/database/types"

interface StudentManagementProps {
  students: Student[]
  tutorId: string
  onStudentSelect: (student: Student) => void
  onStudentsUpdate: (students: Student[]) => void
  onClose: () => void
}

export function StudentManagement({
  students,
  tutorId,
  onStudentSelect,
  onStudentsUpdate,
  onClose,
}: StudentManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    grade_level: "",
    subjects: [] as string[],
    learning_goals: [] as string[],
    current_gaps: [] as string[],
    next_focus: [] as string[],
    recent_progress: [] as string[],
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      grade_level: "",
      subjects: [],
      learning_goals: [],
      current_gaps: [],
      next_focus: [],
      recent_progress: [],
      notes: "",
    })
    setShowAddForm(false)
    setEditingStudent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingStudent) {
        // Update existing student
        const response = await fetch(`/api/students/${editingStudent.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
        
        if (!response.ok) {
          throw new Error("Failed to update student")
        }
        
        const updated = await response.json()
        const updatedStudents = students.map((s) => (s.id === editingStudent.id ? updated : s))
        onStudentsUpdate(updatedStudents)
      } else {
        // Create new student
        const response = await fetch("/api/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tutorId,
            studentData: formData,
          }),
        })
        
        if (!response.ok) {
          throw new Error("Failed to create student")
        }
        
        const newStudent = await response.json()
        onStudentsUpdate([...students, newStudent])
      }
      resetForm()
    } catch (error) {
      console.error("Error saving student:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      email: student.email || "",
      grade_level: student.grade_level || "",
      subjects: student.subjects || [],
      learning_goals: student.learning_goals || [],
      current_gaps: student.current_gaps || [],
      next_focus: student.next_focus || [],
      recent_progress: student.recent_progress || [],
      notes: student.notes || "",
    })
    setShowAddForm(true)
  }

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete student")
      }
      
      const updatedStudents = students.filter((s) => s.id !== studentId)
      onStudentsUpdate(updatedStudents)
    } catch (error) {
      console.error("Error deleting student:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addArrayItem = (field: "subjects" | "learning_goals" | "current_gaps" | "next_focus" | "recent_progress", value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }))
    }
  }

  const removeArrayItem = (field: "subjects" | "learning_goals" | "current_gaps" | "next_focus" | "recent_progress", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-6">
      {/* Modern Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-light text-white tracking-tight">Student Management</h1>
              <p className="text-white/60 text-sm">Manage your tutoring students</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
              <span className="text-xs text-white/80">{students.length} Students</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => {
              setEditingStudent(null)
              setShowAddForm(true)
            }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Add/Edit Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <GlassCard className="p-6 lg:p-8 border-2 border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-white tracking-tight">
            {editingStudent ? "Edit Student" : "Add New Student"}
          </h2>
                  <p className="text-white/60 text-sm">
                    {editingStudent ? "Update student information" : "Create a new student profile"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingStudent(null)
                  resetForm()
                }}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <Label htmlFor="name" className="text-white text-sm font-medium">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400"
                    placeholder="Student's full name"
                />
              </div>
              <div>
                  <Label htmlFor="email" className="text-white text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400"
                    placeholder="student@example.com"
                />
              </div>
            </div>

            <div>
                <Label htmlFor="grade_level" className="text-white text-sm font-medium">
                Grade Level
              </Label>
              <Input
                id="grade_level"
                value={formData.grade_level}
                onChange={(e) => setFormData((prev) => ({ ...prev, grade_level: e.target.value }))}
                placeholder="e.g., Year 12, Grade 10"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400"
              />
            </div>

            <div>
                <Label className="text-white text-sm font-medium">Subjects</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-500/20 text-blue-300 border-blue-400/30"
                      >
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("subjects", index)}
                          className="ml-2 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                    placeholder="Add a subject and press Enter"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                        const value = (e.target as HTMLInputElement).value.trim()
                        if (value) {
                          addArrayItem("subjects", value)
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }
                    }}
                  />
                </div>
            </div>

              {/* Learning Goals */}
            <div>
                <Label className="text-white text-sm font-medium">Learning Goals</Label>
                <p className="text-white/60 text-xs mb-2">What does this student want to achieve?</p>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                {formData.learning_goals.map((goal, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-green-500/20 text-green-300 border-green-400/30"
                      >
                    {goal}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("learning_goals", index)}
                          className="ml-2 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add a learning goal and press Enter"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const value = (e.target as HTMLInputElement).value.trim()
                        if (value) {
                          addArrayItem("learning_goals", value)
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Current Gaps */}
              <div>
                <Label className="text-white text-sm font-medium">Current Learning Gaps</Label>
                <p className="text-white/60 text-xs mb-2">Areas where the student needs improvement</p>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.current_gaps.map((gap, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-red-500/20 text-red-300 border-red-400/30"
                      >
                        {gap}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("current_gaps", index)}
                          className="ml-2 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add a learning gap and press Enter"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const value = (e.target as HTMLInputElement).value.trim()
                        if (value) {
                          addArrayItem("current_gaps", value)
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Next Focus Areas */}
              <div>
                <Label className="text-white text-sm font-medium">Next Focus Areas</Label>
                <p className="text-white/60 text-xs mb-2">What should we work on next?</p>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.next_focus.map((focus, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-amber-500/20 text-amber-300 border-amber-400/30"
                      >
                        {focus}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("next_focus", index)}
                          className="ml-2 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add a focus area and press Enter"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const value = (e.target as HTMLInputElement).value.trim()
                        if (value) {
                          addArrayItem("next_focus", value)
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Recent Progress */}
              <div>
                <Label className="text-white text-sm font-medium">Recent Progress</Label>
                <p className="text-white/60 text-xs mb-2">What has the student achieved recently?</p>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.recent_progress.map((progress, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 border-purple-400/30"
                      >
                        {progress}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("recent_progress", index)}
                          className="ml-2 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                    placeholder="Add a recent achievement and press Enter"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                        const value = (e.target as HTMLInputElement).value.trim()
                        if (value) {
                          addArrayItem("recent_progress", value)
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }
                    }}
                  />
                </div>
            </div>

              {/* Notes */}
            <div>
                <Label htmlFor="notes" className="text-white text-sm font-medium">
                  Additional Notes
              </Label>
                <p className="text-white/60 text-xs mb-2">Any other important information about this student</p>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Learning style, preferences, special considerations, parent notes, etc."
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400 min-h-[100px]"
                  rows={4}
              />
            </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingStudent(null)
                    resetForm()
                  }}
                  className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30"
                >
                Cancel
              </Button>
              <Button
                type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingStudent ? "Update Student" : "Add Student"}
                    </>
                  )}
              </Button>
            </div>
          </form>
        </GlassCard>
        </motion.div>
      )}

      {/* Enhanced Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <GlassCard 
            key={student.id}
            className="p-6 hover:bg-white/5 transition-all duration-300 group border border-white/20 hover:border-purple-400/40 cursor-pointer"
            onClick={() => onStudentSelect(student)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-semibold shadow-lg">
                  {student.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg">{student.name}</h3>
                  {student.grade_level && (
                    <div className="flex items-center space-x-1 mt-1">
                      <GraduationCap className="h-3 w-3 text-blue-400" />
                      <p className="text-sm text-blue-300">{student.grade_level}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(student)
                  }}
                  className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(student.id)
                  }}
                  className="text-red-400/60 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {student.email && (
              <div className="flex items-center space-x-2 mb-3">
                <Mail className="h-4 w-4 text-white/60" />
                <span className="text-sm text-white/80">{student.email}</span>
              </div>
            )}

            {/* Subjects */}
            {student.subjects && student.subjects.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-2">
                  <BookOpen className="h-3 w-3 text-blue-400" />
                  <p className="text-blue-400 text-xs font-medium">SUBJECTS</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.subjects.slice(0, 4).map((subject, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30"
                    >
                      {subject}
                    </Badge>
                  ))}
                  {student.subjects.length > 4 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30"
                    >
                      +{student.subjects.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Learning Goals */}
            {student.learning_goals && student.learning_goals.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-2">
                  <Target className="h-3 w-3 text-green-400" />
                  <p className="text-green-400 text-xs font-medium">LEARNING GOALS</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.learning_goals.slice(0, 2).map((goal, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-green-500/20 text-green-300 border-green-400/30"
                    >
                      {goal}
                    </Badge>
                  ))}
                  {student.learning_goals.length > 2 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-green-500/20 text-green-300 border-green-400/30"
                    >
                      +{student.learning_goals.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Current Gaps */}
            {student.current_gaps && student.current_gaps.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-2">
                  <AlertCircle className="h-3 w-3 text-red-400" />
                  <p className="text-red-400 text-xs font-medium">FOCUS AREAS</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.current_gaps.slice(0, 2).map((gap, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-red-500/20 text-red-300 border-red-400/30"
                    >
                      {gap}
                    </Badge>
                  ))}
                  {student.current_gaps.length > 2 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-red-500/20 text-red-300 border-red-400/30"
                    >
                      +{student.current_gaps.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Recent Progress */}
            {student.recent_progress && student.recent_progress.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-2">
                  <TrendingUp className="h-3 w-3 text-purple-400" />
                  <p className="text-purple-400 text-xs font-medium">RECENT PROGRESS</p>
                </div>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                  {student.recent_progress.slice(0, 2).join(" • ")}
                </p>
              </div>
            )}

            {/* Notes Preview */}
            {student.notes && (
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-2">
                  <FileText className="h-3 w-3 text-white/50" />
                  <p className="text-white/50 text-xs font-medium">NOTES</p>
                </div>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                  {student.notes}
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-400 text-xs font-medium">Active</span>
              </div>
              <span className="text-xs text-white/40">
                Added {new Date(student.created_at).toLocaleDateString()}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
