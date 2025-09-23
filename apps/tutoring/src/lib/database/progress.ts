import { createClient } from "@/lib/supabase/server"
import type { StudentProgress } from "./types"

export async function getProgressByStudent(studentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_id", studentId)
    .order("last_assessed", { ascending: false })

  if (error) throw error
  return data
}

export async function getProgressByTutor(tutorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("student_progress")
    .select(`
      *,
      students (name)
    `)
    .eq("tutor_id", tutorId)
    .order("last_assessed", { ascending: false })

  if (error) throw error
  return data
}

export async function createProgress(progressData: Omit<StudentProgress, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("student_progress").insert(progressData).select().single()

  if (error) throw error
  return data
}

export async function updateProgress(progressId: string, updates: Partial<StudentProgress>) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("student_progress").update(updates).eq("id", progressId).select().single()

  if (error) throw error
  return data
}

export async function getSubjectProgress(studentId: string, subject: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_id", studentId)
    .eq("subject", subject)
    .order("last_assessed", { ascending: false })

  if (error) throw error
  return data
}
