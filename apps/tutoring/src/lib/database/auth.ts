import { createClient } from "@/lib/supabase/server"

export async function ensureUserProfile(userId: string) {
  const supabase = await createClient()

  // Get user data from auth to access latest metadata
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not found")

  // Check if profile exists
  const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  // Extract Google user data from metadata
  const metadata = user.user_metadata || {}
  const firstName = metadata.given_name || metadata.first_name || metadata.full_name?.split(" ")[0] || ""
  const lastName = metadata.family_name || metadata.last_name || metadata.full_name?.split(" ").slice(1).join(" ") || ""
  const profilePicture = metadata.avatar_url || metadata.picture || null

  if (existingProfile) {
    // Update existing profile if we have better data from metadata
    if ((!existingProfile.first_name || !existingProfile.last_name) && (firstName || lastName)) {
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .update({
          first_name: firstName || existingProfile.first_name,
          last_name: lastName || existingProfile.last_name,
          avatar_url: profilePicture || existingProfile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single()
      
      return updatedProfile || existingProfile
    }
    return existingProfile
  }

  // Create profile from Google OAuth data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email: user.email!,
      first_name: firstName,
      last_name: lastName,
      avatar_url: profilePicture,
      role: "tutor",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (profileError) throw profileError

  // Create tutor record
  const { error: tutorError } = await supabase.from("tutors").insert({
    id: userId,
    bio: null,
    specializations: [],
    hourly_rate: null,
    availability: {},
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (tutorError) throw tutorError

  return profile
}
