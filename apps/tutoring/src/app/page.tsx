import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTutorProfile } from "@/lib/database/tutors";
import { getStudentsByTutor } from "@/lib/database/students";
import { ensureUserProfile } from "@/lib/database/auth";
import { PortalClient } from "@/components/portal/portal-client";

export default async function HomePage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  try {
    await ensureUserProfile(user.id);

    // Get tutor profile and students
    const tutorProfile = await getTutorProfile(user.id);
    const students = await getStudentsByTutor(user.id);

    // Pass user metadata for Google profile info
    const userMetadata = user.user_metadata || {};

    return (
      <PortalClient 
        tutor={tutorProfile} 
        initialStudents={students} 
        userId={user.id}
        userMetadata={userMetadata}
      />
    );
  } catch (error) {
    console.error("Error loading portal data:", error);
    // If tutor profile doesn't exist or needs setup, redirect to setup
    redirect("/auth/setup");
  }
}
