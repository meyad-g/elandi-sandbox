import { createClient } from "@/lib/supabase/server"
import type { Tutor, Profile } from "./types"

export async function getTutorProfile(tutorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      tutors (*)
    `)
    .eq("id", tutorId)
    .eq("role", "tutor")
    .single()

  if (error) throw error
  return data
}

export async function updateTutorProfile(tutorId: string, updates: Partial<Profile & Tutor>) {
  const supabase = await createClient()

  // Separate profile and tutor updates
  const profileUpdates: Partial<Profile> = {}
  const tutorUpdates: Partial<Tutor> = {}

  // Profile fields
  if (updates.first_name !== undefined) profileUpdates.first_name = updates.first_name
  if (updates.last_name !== undefined) profileUpdates.last_name = updates.last_name
  if (updates.email !== undefined) profileUpdates.email = updates.email

  // Tutor fields
  if (updates.bio !== undefined) tutorUpdates.bio = updates.bio
  if (updates.specializations !== undefined) tutorUpdates.specializations = updates.specializations
  if (updates.hourly_rate !== undefined) tutorUpdates.hourly_rate = updates.hourly_rate
  if (updates.availability !== undefined) tutorUpdates.availability = updates.availability
  if (updates.is_active !== undefined) tutorUpdates.is_active = updates.is_active

  // Update profile if there are profile changes
  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await supabase.from("profiles").update(profileUpdates).eq("id", tutorId)

    if (profileError) throw profileError
  }

  // Update tutor if there are tutor changes
  if (Object.keys(tutorUpdates).length > 0) {
    const { error: tutorError } = await supabase.from("tutors").update(tutorUpdates).eq("id", tutorId)

    if (tutorError) throw tutorError
  }

  return { success: true }
}
