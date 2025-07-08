"use server"

import { createServerSupabaseClient, STORAGE_BUCKET } from "@/lib/supabase"

// Generate a unique file name to prevent collisions
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split(".").pop()
  return `${timestamp}-${randomString}.${extension}`
}

// Get public URL for a file
function getPublicUrl(filePath: string): string {
  const supabase = createServerSupabaseClient()
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

// Upload a file to Supabase Storage
export async function uploadFile(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()
    const file = formData.get("file") as File

    if (!file) {
      return { error: "No file provided" }
    }

    // Get file details
    const fileName = file.name
    const fileType = file.type
    const fileSize = file.size

    console.log(`Starting upload: ${fileName}, type: ${fileType}, size: ${fileSize} bytes`)

    // Check file size limits
    const isVideo = fileType.startsWith("video/")
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024 // 50MB for video, 5MB for images

    if (fileSize > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return { error: `File size too large. Maximum allowed: ${maxSizeMB}MB` }
    }

    // Generate a unique file name to prevent collisions
    const uniqueFileName = generateUniqueFileName(fileName)

    // Determine folder based on file type
    const folder = isVideo ? "videos" : "thumbnails"
    const filePath = `${folder}/${uniqueFileName}`

    console.log(`Uploading to path: ${filePath}`)

    // For video files, we'll try a different approach
    if (isVideo) {
      try {
        // Convert File to ArrayBuffer
        console.log("Converting video file to buffer...")
        const arrayBuffer = await file.arrayBuffer()
        console.log(`Buffer created, size: ${arrayBuffer.byteLength} bytes`)

        // Upload to Supabase Storage with specific options for video
        const { data, error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, arrayBuffer, {
          contentType: fileType,
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          console.error("Video upload error:", uploadError)
          return { error: `Error uploading video: ${uploadError.message}` }
        }

        console.log("Video upload successful:", data)

        // Get the public URL
        const publicUrl = getPublicUrl(filePath)

        return {
          url: publicUrl,
          duration: "00:00", // Placeholder
          fileName: uniqueFileName,
          filePath: filePath,
        }
      } catch (videoError) {
        console.error("Video processing error:", videoError)
        return {
          error: `Failed to process video file: ${videoError instanceof Error ? videoError.message : String(videoError)}`,
        }
      }
    } else {
      // For images, use the existing method
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { data, error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, buffer, {
          contentType: fileType,
          cacheControl: "3600",
        })

        if (uploadError) {
          console.error("Image upload error:", uploadError)
          return { error: `Error uploading image: ${uploadError.message}` }
        }

        console.log("Image upload successful:", data)

        // Get the public URL
        const publicUrl = getPublicUrl(filePath)

        return {
          url: publicUrl,
          duration: null,
          fileName: uniqueFileName,
          filePath: filePath,
        }
      } catch (imageError) {
        console.error("Image processing error:", imageError)
        return {
          error: `Failed to process image file: ${imageError instanceof Error ? imageError.message : String(imageError)}`,
        }
      }
    }
  } catch (error) {
    console.error("File upload error:", error)
    return { error: `Failed to upload file: ${error instanceof Error ? error.message : String(error)}` }
  }
}
