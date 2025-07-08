import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("Image upload API: Starting...")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" })
    }

    console.log(`Image upload API: File received - ${file.name}, ${file.size} bytes`)

    // Validate file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "File must be an image" })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File too large (max 5MB)" })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split(".").pop() || "jpg"
    const fileName = `thumbnail_${timestamp}_${randomId}.${extension}`
    const filePath = `thumbnails/${fileName}`

    console.log(`Image upload API: Uploading to ${filePath}`)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    console.log(`Image upload API: Buffer created, size: ${buffer.length}`)

    // Upload to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage.from("videos").upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
    })

    if (uploadError) {
      console.error("Image upload API: Upload error:", uploadError)
      return NextResponse.json({
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      })
    }

    console.log("Image upload API: Upload successful:", uploadData)

    // Get public URL
    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    console.log(`Image upload API: Public URL: ${publicUrl}`)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filePath: filePath,
      fileName: fileName,
    })
  } catch (error) {
    console.error("Image upload API: Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}
