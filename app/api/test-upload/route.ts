import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  console.log("=== TEST UPLOAD API START ===")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    console.log("File received:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      uploadType: type,
    })

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split(".").pop() || "mp4"
    const fileName = `test_${type}_${timestamp}_${randomId}.${extension}`
    const filePath = `test-uploads/${fileName}`

    console.log("Upload path:", filePath)

    // Simple approach: direct file upload
    console.log("Starting Supabase upload...")

    const { data, error } = await supabase.storage.from("videos").upload(filePath, file, {
      contentType: file.type,
      cacheControl: "3600",
    })

    if (error) {
      console.error("Supabase upload error:", error)
      return NextResponse.json({
        success: false,
        error: `Upload failed: ${error.message}`,
      })
    }

    console.log("Upload successful:", data)

    // Get public URL
    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(filePath)

    console.log("Public URL:", urlData.publicUrl)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filePath: filePath,
      fileName: fileName,
    })
  } catch (error) {
    console.error("Test upload error:", error)
    return NextResponse.json({
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  } finally {
    console.log("=== TEST UPLOAD API END ===")
  }
}
