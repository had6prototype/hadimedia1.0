import { createServerSupabaseClient } from "@/lib/supabase"

// Define the storage bucket name
const STORAGE_BUCKET = "videos"

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(filePath: string) {
  try {
    const supabase = createServerSupabaseClient()

    if (!filePath) {
      return { error: "No file path provided" }
    }

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath])

    if (error) {
      console.error("Delete error:", error)
      return { error: `Error deleting file: ${error.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error("File delete error:", error)
    return { error: "Failed to delete file" }
  }
}

/**
 * Extract file path from a Supabase URL
 */
export function extractPathFromUrl(url: string): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/videos\/(.+)/)
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1]
    }
  } catch (e) {
    console.error("Error extracting path from URL:", e)
  }

  return null
}
