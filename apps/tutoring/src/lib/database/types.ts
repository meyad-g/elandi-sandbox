export interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  role: "tutor" | "student" | "admin"
  created_at: string
  updated_at: string
}

export interface Tutor {
  id: string
  bio?: string
  specializations?: string[]
  hourly_rate?: number
  availability?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  tutor_id: string
  name: string
  email?: string
  grade_level?: string
  subjects?: string[]
  learning_goals?: string[]
  current_gaps?: string[]
  recent_progress?: string[]
  next_focus?: string[]
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TutoringSession {
  id: string
  student_id: string
  tutor_id: string
  session_date: string
  duration_minutes: number
  topics_covered?: string[]
  student_performance?: Record<string, any>
  homework_assigned?: string[]
  next_session_focus?: string[]
  notes?: string
  status: "scheduled" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface StudentProgress {
  id: string
  student_id: string
  tutor_id: string
  subject: string
  topic: string
  skill_level: number
  mastery_percentage: number
  last_assessed: string
  notes?: string
  created_at: string
  updated_at: string
}
