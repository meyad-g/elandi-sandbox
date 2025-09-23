import { createClient } from "@/lib/supabase/server"
import type { TutoringSession } from "./types"

export async function getSessionsByTutor(tutorId: string, limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tutoring_sessions")
    .select(`
      *,
      students (name)
    `)
    .eq("tutor_id", tutorId)
    .order("session_date", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getSessionsByStudent(studentId: string, limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tutoring_sessions")
    .select("*")
    .eq("student_id", studentId)
    .order("session_date", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function createSession(sessionData: Omit<TutoringSession, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("tutoring_sessions").insert(sessionData).select().single()

  if (error) throw error
  return data
}

export async function updateSession(sessionId: string, updates: Partial<TutoringSession>) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("tutoring_sessions").update(updates).eq("id", sessionId).select().single()

  if (error) throw error
  return data
}
