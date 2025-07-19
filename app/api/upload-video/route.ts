import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("Video upload API: Starting...")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" })
    }

    console.log(`Video upload API: File received - ${file.name}, ${file.size} bytes`)

    // Validate file
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ success: false, error: "File must be a video" })
    }

    // Use original filename with timestamp prefix to avoid conflicts
    const timestamp = Date.now()
    const originalName = file.name
    const fileName = `${timestamp}_${originalName}`

    console.log(`Video upload API: Uploading as ${fileName}`)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    console.log(`Video upload API: Buffer created, size: ${buffer.length}`)

    // Upload to Supabase - use the filename directly without extra path
    const { data: uploadData, error: uploadError } = await supabase.storage.from("videos").upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false, // Don't overwrite existing files
    })

    if (uploadError) {
      console.error("Video upload API: Upload error:", uploadError)
      return NextResponse.json({
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      })
    }

    console.log("Video upload API: Upload successful:", uploadData)

    // Get public URL using the exact path returned from upload
    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(uploadData.path)

    const publicUrl = urlData.publicUrl

    console.log(`Video upload API: Public URL: ${publicUrl}`)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filePath: uploadData.path,
      fileName: fileName,
    })
  } catch (error) {
    console.error("Video upload API: Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}
