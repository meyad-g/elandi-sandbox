import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createStudent, getStudentsByTutor } from "@/lib/database/students"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tutorId = searchParams.get("tutorId")

    if (!tutorId) {
      return NextResponse.json({ error: "Missing tutorId parameter" }, { status: 400 })
    }

    // Verify the authenticated user matches the tutorId
    if (user.id !== tutorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const students = await getStudentsByTutor(tutorId)
    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tutorId, studentData } = body

    if (!tutorId || !studentData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the authenticated user matches the tutorId
    if (user.id !== tutorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const student = await createStudent(tutorId, studentData)
    return NextResponse.json(student)
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
