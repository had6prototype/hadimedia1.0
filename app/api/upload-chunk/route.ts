import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Store chunks temporarily (in production, use Redis or similar)
const chunkStore = new Map<string, { chunks: Uint8Array[]; totalChunks: number; fileName: string }>()

export async function POST(request: NextRequest) {
  console.log("=== CHUNK UPLOAD API START ===")

  try {
    const formData = await request.formData()
    const chunk = formData.get("chunk") as File
    const chunkIndex = Number.parseInt(formData.get("chunkIndex") as string)
    const totalChunks = Number.parseInt(formData.get("totalChunks") as string)
    const fileName = formData.get("fileName") as string

    console.log("Chunk received:", {
      chunkIndex,
      totalChunks,
      fileName,
      chunkSize: chunk?.size,
    })

    if (!chunk) {
      return NextResponse.json({ success: false, error: "No chunk provided" })
    }

    const uploadId = `${fileName}_${Date.now()}`

    // Convert chunk to buffer
    const arrayBuffer = await chunk.arrayBuffer()
    const chunkBuffer = new Uint8Array(arrayBuffer)

    // Store chunk
    if (!chunkStore.has(uploadId)) {
      chunkStore.set(uploadId, {
        chunks: new Array(totalChunks),
        totalChunks,
        fileName,
      })
    }

    const upload = chunkStore.get(uploadId)!
    upload.chunks[chunkIndex] = chunkBuffer

    console.log(`Stored chunk ${chunkIndex + 1}/${totalChunks}`)

    // Check if all chunks are received
    const receivedChunks = upload.chunks.filter((c) => c !== undefined).length

    if (receivedChunks === totalChunks) {
      console.log("All chunks received, assembling file...")

      // Combine all chunks
      const totalSize = upload.chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const completeFile = new Uint8Array(totalSize)

      let offset = 0
      for (const chunk of upload.chunks) {
        completeFile.set(chunk, offset)
        offset += chunk.length
      }

      // Upload complete file
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const extension = fileName.split(".").pop() || "mp4"
      const finalFileName = `chunked_${timestamp}_${randomId}.${extension}`
      const filePath = `test-uploads/${finalFileName}`

      console.log("Uploading assembled file:", filePath)

      const { data, error } = await supabase.storage.from("videos").upload(filePath, completeFile, {
        contentType: "video/mp4",
        cacheControl: "3600",
      })

      // Clean up
      chunkStore.delete(uploadId)

      if (error) {
        console.error("Final upload error:", error)
        return NextResponse.json({
          success: false,
          error: `Final upload failed: ${error.message}`,
        })
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(filePath)

      console.log("Chunked upload complete:", urlData.publicUrl)

      return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
        filePath: filePath,
        fileName: finalFileName,
        message: `File assembled from ${totalChunks} chunks`,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
    })
  } catch (error) {
    console.error("Chunk upload error:", error)
    return NextResponse.json({
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  } finally {
    console.log("=== CHUNK UPLOAD API END ===")
  }
}
