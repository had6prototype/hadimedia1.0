import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const STORAGE_BUCKET = "videos"

// Generate a unique file name to prevent collisions
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split(".").pop()
  return `${timestamp}-${randomString}.${extension}`
}

// Get public URL for a file
function getPublicUrl(filePath: string) {
  const supabase = createServerSupabaseClient()
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Starting file upload process...")

    // Get the file from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("API: No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get file details
    const fileName = file.name
    const fileType = file.type
    const fileSize = file.size

    console.log(`API: Processing file: ${fileName}`)
    console.log(`API: File type: ${fileType}`)
    console.log(`API: File size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)

    const isVideo = fileType.startsWith("video/")

    // Generate a unique file name to prevent collisions
    const uniqueFileName = generateUniqueFileName(fileName)

    // Determine folder based on file type
    const folder = isVideo ? "videos" : "thumbnails"
    const filePath = `${folder}/${uniqueFileName}`

    console.log(`API: Generated file path: ${filePath}`)

    // Get file bytes
    console.log("API: Converting file to bytes...")
    const bytes = await file.arrayBuffer()
    console.log(`API: File converted to ${bytes.byteLength} bytes`)

    // Upload to Supabase Storage
    console.log("API: Starting Supabase upload...")
    const supabase = createServerSupabaseClient()

    // Try the upload with detailed error handling
    let uploadResult
    try {
      uploadResult = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, bytes, {
        contentType: fileType,
        cacheControl: "3600",
      })
      console.log("API: Supabase upload completed")
    } catch (supabaseError) {
      console.error("API: Supabase upload threw an error:", supabaseError)
      return NextResponse.json(
        {
          error: `Supabase upload failed: ${supabaseError instanceof Error ? supabaseError.message : String(supabaseError)}`,
        },
        { status: 500 },
      )
    }

    const { data, error: uploadError } = uploadResult

    if (uploadError) {
      console.error("API: Supabase upload error:", uploadError)
      console.error("API: Error details:", JSON.stringify(uploadError, null, 2))
      return NextResponse.json(
        {
          error: `Error uploading file: ${uploadError.message || "Unknown upload error"}`,
        },
        { status: 500 },
      )
    }

    console.log("API: Upload successful:", data)

    // Get the public URL
    console.log("API: Getting public URL...")
    const publicUrl = getPublicUrl(filePath)
    console.log(`API: Public URL: ${publicUrl}`)

    // For videos, we need to get the duration
    let duration = null
    if (isVideo) {
      // Note: We can't get the actual duration on the server
      // The client will need to calculate this
      duration = "00:00" // Placeholder
    }

    const response = {
      url: publicUrl,
      duration,
      fileName: uniqueFileName,
      filePath: filePath,
    }

    console.log("API: Returning success response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("API: Unexpected error during file upload:", error)
    console.error("API: Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: `Failed to upload file: ${error instanceof Error ? error.message : String(error)}`,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
