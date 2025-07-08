"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function TestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string>("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileSizeMB = file.size / 1024 / 1024

      if (fileSizeMB > 50) {
        setUploadStatus(`❌ File too large: ${fileSizeMB.toFixed(2)} MB (max 50 MB)`)
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setUploadStatus(`✅ Selected: ${file.name} (${fileSizeMB.toFixed(2)} MB)`)
      setUploadedUrl("")
      setUploadProgress(0)
    }
  }

  // Approach 1: Using our dedicated video API
  const testApproach1 = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus("Testing Approach 1: Dedicated Video API...")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90))
      }, 500)

      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      const result = await response.json()

      if (result.success) {
        setUploadProgress(100)
        setUploadStatus(`✅ Approach 1 Success! File uploaded to: ${result.filePath}`)
        setUploadedUrl(result.url)
      } else {
        setUploadStatus(`❌ Approach 1 Failed: ${result.error}`)
      }
    } catch (error) {
      setUploadStatus(`❌ Approach 1 Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Approach 2: Direct Supabase upload (client-side) - Fixed dynamic import
  const testApproach2 = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus("Testing Approach 2: Direct Client-side Upload...")
    setUploadProgress(0)

    try {
      setUploadProgress(25)
      setUploadStatus("Loading Supabase client...")

      // Dynamic import with proper error handling
      const { supabase } = await import("@/lib/supabase").catch((err) => {
        console.error("Failed to import Supabase:", err)
        throw new Error("Failed to load Supabase client")
      })

      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const extension = selectedFile.name.split(".").pop() || "mp4"
      const fileName = `test_direct_${timestamp}_${randomId}.${extension}`

      setUploadProgress(50)
      setUploadStatus("Uploading directly to Supabase...")

      // Upload file directly
      const { data, error } = await supabase.storage.from("videos").upload(fileName, selectedFile, {
        contentType: selectedFile.type,
        cacheControl: "3600",
      })

      setUploadProgress(75)

      if (error) {
        setUploadStatus(`❌ Approach 2 Failed: ${error.message}`)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName)

      setUploadProgress(100)
      setUploadStatus(`✅ Approach 2 Success! File uploaded to: ${fileName}`)
      setUploadedUrl(urlData.publicUrl)
    } catch (error) {
      setUploadStatus(`❌ Approach 2 Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Approach 3: Using a generic upload API
  const testApproach3 = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus("Testing Approach 3: Generic Upload API...")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "video")

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 4, 85))
      }, 600)

      const response = await fetch("/api/test-upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setUploadProgress(100)
        setUploadStatus(`✅ Approach 3 Success! File uploaded to: ${result.filePath}`)
        setUploadedUrl(result.url)
      } else {
        setUploadStatus(`❌ Approach 3 Failed: ${result.error}`)
      }
    } catch (error) {
      setUploadStatus(`❌ Approach 3 Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Approach 4: Chunked upload
  const testApproach4 = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus("Testing Approach 4: Chunked Upload...")
    setUploadProgress(0)

    try {
      const chunkSize = 2 * 1024 * 1024 // 2MB chunks for better handling
      const totalChunks = Math.ceil(selectedFile.size / chunkSize)

      setUploadStatus(`Uploading in ${totalChunks} chunks (2MB each)...`)

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, selectedFile.size)
        const chunk = selectedFile.slice(start, end)

        const formData = new FormData()
        formData.append("chunk", chunk)
        formData.append("chunkIndex", i.toString())
        formData.append("totalChunks", totalChunks.toString())
        formData.append("fileName", selectedFile.name)

        const response = await fetch("/api/upload-chunk", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Chunk ${i + 1} failed: ${response.statusText}`)
        }

        const result = await response.json()

        const progress = ((i + 1) / totalChunks) * 100
        setUploadProgress(progress)
        setUploadStatus(`Uploading chunk ${i + 1}/${totalChunks}... (${(chunk.size / 1024 / 1024).toFixed(1)}MB)`)

        // If this was the last chunk and we got a URL back
        if (result.url) {
          setUploadedUrl(result.url)
          setUploadStatus(`✅ Approach 4 Success! File uploaded in ${totalChunks} chunks`)
        }
      }
    } catch (error) {
      setUploadStatus(`❌ Approach 4 Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Approach 5: Simple test upload (mimics Supabase dashboard)
  const testApproach5 = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus("Testing Approach 5: Simple Upload (Dashboard Style)...")
    setUploadProgress(0)

    try {
      setUploadProgress(20)
      setUploadStatus("Preparing file for upload...")

      // Create a simple filename like Supabase dashboard
      const timestamp = Date.now()
      const fileName = `${timestamp}_${selectedFile.name}`

      setUploadProgress(40)
      setUploadStatus("Connecting to storage...")

      // Dynamic import with better error handling
      let supabase
      try {
        const supabaseModule = await import("@/lib/supabase")
        supabase = supabaseModule.supabase
      } catch (importError) {
        throw new Error("Failed to load Supabase client")
      }

      setUploadProgress(60)
      setUploadStatus("Uploading file...")

      // Simple upload like dashboard
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, selectedFile, {
          contentType: selectedFile.type,
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      setUploadProgress(80)
      setUploadStatus("Getting public URL...")

      // Get public URL
      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(uploadData.path)

      setUploadProgress(100)
      setUploadStatus(`✅ Approach 5 Success! File: ${uploadData.path}`)
      setUploadedUrl(urlData.publicUrl)
    } catch (error) {
      setUploadStatus(`❌ Approach 5 Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Video Upload Test Page</h1>
      <p className="text-gray-600 mb-6">Test different video upload approaches with files up to 50MB</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Video File (Max 50MB)</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
              <p>
                <strong>File:</strong> {selectedFile.name}
              </p>
              <p>
                <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p>
                <strong>Type:</strong> {selectedFile.type}
              </p>
              <p className="text-green-600 font-semibold">✅ File size is within 50MB limit</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approach 1: Video API</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Server-side processing via /api/upload-video</p>
            <Button onClick={testApproach1} disabled={!selectedFile || isUploading} className="w-full">
              Test API Upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approach 2: Direct Client</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Direct upload to Supabase from browser</p>
            <Button onClick={testApproach2} disabled={!selectedFile || isUploading} className="w-full">
              Test Direct Upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approach 3: Generic API</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Generic upload endpoint</p>
            <Button onClick={testApproach3} disabled={!selectedFile || isUploading} className="w-full">
              Test Generic API
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approach 4: Chunked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Upload in 2MB chunks</p>
            <Button onClick={testApproach4} disabled={!selectedFile || isUploading} className="w-full">
              Test Chunked Upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approach 5: Dashboard Style</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Mimics Supabase dashboard upload</p>
            <Button onClick={testApproach5} disabled={!selectedFile || isUploading} className="w-full">
              Test Dashboard Style
            </Button>
          </CardContent>
        </Card>
      </div>

      {(uploadProgress > 0 || uploadStatus) && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Status</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadProgress > 0 && (
              <div className="mb-4">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">{uploadProgress.toFixed(1)}% complete</p>
              </div>
            )}
            <p className="text-sm font-mono bg-gray-100 p-3 rounded whitespace-pre-wrap">{uploadStatus}</p>
            {uploadedUrl && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Uploaded File URL:</p>
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all block mb-2"
                >
                  {uploadedUrl}
                </a>
                <div className="mt-2">
                  <video src={uploadedUrl} controls className="max-w-md rounded border">
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Debugging Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Current URL:</strong> {typeof window !== "undefined" ? window.location.href : "Loading..."}
            </p>
            <p>
              <strong>User Agent:</strong>{" "}
              {typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 100) + "..." : "Loading..."}
            </p>
            <p>
              <strong>File API Support:</strong> {typeof File !== "undefined" ? "✅ Supported" : "❌ Not supported"}
            </p>
            <p>
              <strong>Fetch API Support:</strong> {typeof fetch !== "undefined" ? "✅ Supported" : "❌ Not supported"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testing Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Start with Approach 5 (Dashboard Style) - it's the most reliable</li>
            <li>• Try a small video file first (under 10MB)</li>
            <li>• Check browser console (F12) for detailed error messages</li>
            <li>• If all approaches fail, check your Supabase configuration</li>
            <li>• Make sure your Supabase URL and key are correctly set</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
