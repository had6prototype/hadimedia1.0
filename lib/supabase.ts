import { createClient } from "@supabase/supabase-js"

// Types for our database tables
export type Program = {
  id: number
  title: string
  description: string | null
  video_url: string | null
  thumbnail_url: string | null
  duration: string | null
  views: number
  order: number
  status: "published" | "draft" | "archived"
  created_at: string
  updated_at: string
}

export type Tag = {
  id: number
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export type ProgramTag = {
  id: number
  program_id: number
  tag_id: number
}

export type Article = {
  id: number
  title: string
  content: string
  excerpt: string | null
  thumbnail_url: string | null
  author: string
  status: "published" | "draft" | "archived"
  is_featured: boolean
  tags: string | null
  views: number
  created_at: string
  updated_at: string
}

// Supabase configuration - Using the provided credentials
const supabaseUrl = "https://wbatzbtyajmynfhemsjx.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiYXR6YnR5YWpteW5maGVtc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODEwOTksImV4cCI6MjA2NDk1NzA5OX0.FwkVEZzJZUYZLC_Yli4C6sKXasIQ-PQ1eLGABwuF08Y"

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client-side Supabase client (singleton pattern)
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (!clientSupabaseClient) {
    clientSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  }
  return clientSupabaseClient
}

// Export the main client for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// Storage bucket name
export const STORAGE_BUCKET = "videos"

// Helper function to generate a unique file name
export const generateUniqueFileName = (originalName: string) => {
  const timestamp = new Date().getTime()
  const randomString = Math.random().toString(36).substring(2, 10)
  const extension = originalName.split(".").pop()
  return `${timestamp}-${randomString}.${extension}`
}

// Helper function to get public URL for a file
export const getPublicUrl = (filePath: string) => {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

// Helper function to extract file path from URL
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

// Delete a file from Supabase Storage
export async function deleteFile(filePath: string) {
  try {
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
