import { createClient } from "@/lib/supabase/server"
import type { Student } from "./types"

export async function getStudentsByTutor(tutorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("tutor_id", tutorId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getStudent(studentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("students").select("*").eq("id", studentId).single()

  if (error) throw error
  return data
}

export async function createStudent(
  tutorId: string,
  studentData: Omit<Student, "id" | "tutor_id" | "created_at" | "updated_at">,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("students")
    .insert({
      ...studentData,
      tutor_id: tutorId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStudent(studentId: string, updates: Partial<Student>) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("students").update(updates).eq("id", studentId).select().single()

  if (error) throw error
  return data
}

export async function deleteStudent(studentId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("students").update({ is_active: false }).eq("id", studentId)

  if (error) throw error
  return { success: true }
}
