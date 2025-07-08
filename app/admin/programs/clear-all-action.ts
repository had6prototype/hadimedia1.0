"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient, deleteFile, extractPathFromUrl } from "@/lib/supabase"

export async function deleteAllPrograms() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all programs to delete their files
    const { data: programs, error: getError } = await supabase.from("programs").select("video_url, thumbnail_url")

    if (getError) throw getError

    // Delete all files from storage
    if (programs && programs.length > 0) {
      for (const program of programs) {
        // Delete video file
        const videoPath = extractPathFromUrl(program.video_url)
        if (videoPath) {
          await deleteFile(videoPath)
        }

        // Delete thumbnail file
        const thumbnailPath = extractPathFromUrl(program.thumbnail_url)
        if (thumbnailPath) {
          await deleteFile(thumbnailPath)
        }
      }
    }

    // Delete all program-tag relations first
    const { error: deleteRelationsError } = await supabase.from("program_tags").delete().neq("program_id", 0)

    if (deleteRelationsError) throw deleteRelationsError

    // Delete all programs
    const { error: deleteProgramsError } = await supabase.from("programs").delete().neq("id", 0)

    if (deleteProgramsError) throw deleteProgramsError

    revalidatePath("/admin/programs")
    return { success: true, message: "تمام برنامه‌ها با موفقیت حذف شدند" }
  } catch (error) {
    console.error("Failed to delete all programs:", error)
    return { error: "خطا در حذف برنامه‌ها" }
  }
}
