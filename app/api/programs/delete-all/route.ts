import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient()

    // First, get all programs to find their file paths
    const { data: programs, error: fetchError } = await supabase.from("programs").select("id, video_url, thumbnail_url")

    if (fetchError) {
      return NextResponse.json({ message: "Failed to fetch programs" }, { status: 500 })
    }

    // Delete all program_tags relationships first
    const { error: tagsError } = await supabase.from("program_tags").delete().neq("program_id", 0)

    if (tagsError) {
      return NextResponse.json({ message: "Failed to delete program tags" }, { status: 500 })
    }

    // Delete all programs
    const { error: programsError } = await supabase.from("programs").delete().neq("id", 0)

    if (programsError) {
      return NextResponse.json({ message: "Failed to delete programs" }, { status: 500 })
    }

    // Delete files from storage if needed
    // This would require extracting file paths from URLs and deleting them
    // We'll skip this for now as it's complex to extract paths from URLs

    return NextResponse.json({ message: "All programs deleted successfully" })
  } catch (error) {
    console.error("Error deleting all programs:", error)
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
