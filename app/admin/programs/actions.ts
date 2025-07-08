"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient, type Program, type Tag, deleteFile, extractPathFromUrl } from "@/lib/supabase"

// Get all programs with their tags
export async function getPrograms() {
  try {
    const supabase = createServerSupabaseClient()

    // Test the connection first
    const { data: testData, error: testError } = await supabase.from("programs").select("count").limit(1)

    if (testError) {
      console.error("Supabase connection error:", testError)
      return { error: `Database connection failed: ${testError.message}` }
    }

    // Get all programs
    const { data: programs, error: programsError } = await supabase.from("programs").select("*").order("order")

    if (programsError) {
      console.error("Programs fetch error:", programsError)
      return { error: `Failed to fetch programs: ${programsError.message}` }
    }

    // Get all program tags
    const { data: programTags, error: programTagsError } = await supabase.from("program_tags").select("*")

    if (programTagsError) {
      console.error("Program tags fetch error:", programTagsError)
      return { error: `Failed to fetch program tags: ${programTagsError.message}` }
    }

    // Get all tags
    const { data: tags, error: tagsError } = await supabase.from("tags").select("*")

    if (tagsError) {
      console.error("Tags fetch error:", tagsError)
      return { error: `Failed to fetch tags: ${tagsError.message}` }
    }

    // Map tags to programs
    const programsWithTags = programs.map((program) => {
      const programTagIds = programTags.filter((pt) => pt.program_id === program.id).map((pt) => pt.tag_id)
      const programTagsList = tags.filter((tag) => programTagIds.includes(tag.id))

      return {
        ...program,
        tags: programTagsList,
      }
    })

    return { programs: programsWithTags }
  } catch (error) {
    console.error("Unexpected error in getPrograms:", error)
    return { error: "An unexpected error occurred while fetching programs" }
  }
}

// Get a single program by ID
export async function getProgram(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    // Get program
    const { data: program, error: programError } = await supabase.from("programs").select("*").eq("id", id).single()

    if (programError) {
      console.error("Program fetch error:", programError)
      return { error: `Failed to fetch program: ${programError.message}` }
    }

    // Get program tags
    const { data: programTags, error: programTagsError } = await supabase
      .from("program_tags")
      .select("tag_id")
      .eq("program_id", id)

    if (programTagsError) {
      console.error("Program tags fetch error:", programTagsError)
      return { error: `Failed to fetch program tags: ${programTagsError.message}` }
    }

    const tagIds = programTags.map((pt) => pt.tag_id)

    // Get tags
    let programTagsList: Tag[] = []
    if (tagIds.length > 0) {
      const { data: tags, error: tagsError } = await supabase.from("tags").select("*").in("id", tagIds)

      if (tagsError) {
        console.error("Tags fetch error:", tagsError)
        return { error: `Failed to fetch tags: ${tagsError.message}` }
      }
      programTagsList = tags
    }

    return {
      program: {
        ...program,
        tags: programTagsList,
      },
    }
  } catch (error) {
    console.error("Unexpected error in getProgram:", error)
    return { error: "An unexpected error occurred while fetching the program" }
  }
}

// Create a new program
export async function createProgram(data: Partial<Program> & { tags: string[] }) {
  try {
    const supabase = createServerSupabaseClient()
    const { tags: tagNames, ...programData } = data

    // Insert the program
    const { data: newProgram, error: programError } = await supabase
      .from("programs")
      .insert(programData)
      .select()
      .single()

    if (programError) {
      console.error("Program creation error:", programError)
      return { error: `Failed to create program: ${programError.message}` }
    }

    // Handle tags if provided
    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        // Check if tag exists
        const { data: existingTag, error: tagError } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .maybeSingle()

        if (tagError) {
          console.error("Tag fetch error:", tagError)
          return { error: `Failed to fetch tag: ${tagError.message}` }
        }

        let tagId: number

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // Create new tag
          const { data: newTag, error: newTagError } = await supabase
            .from("tags")
            .insert({
              name: tagName,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            })
            .select()
            .single()

          if (newTagError) {
            console.error("Tag creation error:", newTagError)
            return { error: `Failed to create tag: ${newTagError.message}` }
          }
          tagId = newTag.id
        }

        // Create program-tag relation
        const { error: relationError } = await supabase.from("program_tags").insert({
          program_id: newProgram.id,
          tag_id: tagId,
        })

        if (relationError) {
          console.error("Program-tag relation error:", relationError)
          return { error: `Failed to create program-tag relation: ${relationError.message}` }
        }
      }
    }

    revalidatePath("/admin/programs")
    return { program: newProgram }
  } catch (error) {
    console.error("Unexpected error in createProgram:", error)
    return { error: "An unexpected error occurred while creating the program" }
  }
}

// Update a program
export async function updateProgram(id: number, data: Partial<Program> & { tags?: string[] }) {
  try {
    const supabase = createServerSupabaseClient()
    const { tags: tagNames, ...programData } = data

    // Update the program
    const { data: updatedProgram, error: programError } = await supabase
      .from("programs")
      .update(programData)
      .eq("id", id)
      .select()
      .single()

    if (programError) {
      console.error("Program update error:", programError)
      return { error: `Failed to update program: ${programError.message}` }
    }

    // Handle tags if provided
    if (tagNames) {
      // Delete existing program-tag relations
      const { error: deleteError } = await supabase.from("program_tags").delete().eq("program_id", id)

      if (deleteError) {
        console.error("Program-tag deletion error:", deleteError)
        return { error: `Failed to delete program tags: ${deleteError.message}` }
      }

      // Add new tags
      for (const tagName of tagNames) {
        // Check if tag exists
        const { data: existingTag, error: tagError } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .maybeSingle()

        if (tagError) {
          console.error("Tag fetch error:", tagError)
          return { error: `Failed to fetch tag: ${tagError.message}` }
        }

        let tagId: number

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // Create new tag
          const { data: newTag, error: newTagError } = await supabase
            .from("tags")
            .insert({
              name: tagName,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            })
            .select()
            .single()

          if (newTagError) {
            console.error("Tag creation error:", newTagError)
            return { error: `Failed to create tag: ${newTagError.message}` }
          }
          tagId = newTag.id
        }

        // Create program-tag relation
        const { error: relationError } = await supabase.from("program_tags").insert({
          program_id: id,
          tag_id: tagId,
        })

        if (relationError) {
          console.error("Program-tag relation error:", relationError)
          return { error: `Failed to create program-tag relation: ${relationError.message}` }
        }
      }
    }

    revalidatePath("/admin/programs")
    return { program: updatedProgram }
  } catch (error) {
    console.error("Unexpected error in updateProgram:", error)
    return { error: "An unexpected error occurred while updating the program" }
  }
}

// Delete a program
export async function deleteProgram(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the program to delete its files
    const { data: program, error: getError } = await supabase
      .from("programs")
      .select("video_url, thumbnail_url")
      .eq("id", id)
      .single()

    if (getError) {
      console.error("Program fetch error:", getError)
      return { error: `Failed to fetch program for deletion: ${getError.message}` }
    }

    // Delete files from storage if they exist
    if (program) {
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

    // Delete program (cascade will delete program-tag relations)
    const { error } = await supabase.from("programs").delete().eq("id", id)

    if (error) {
      console.error("Program deletion error:", error)
      return { error: `Failed to delete program: ${error.message}` }
    }

    revalidatePath("/admin/programs")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteProgram:", error)
    return { error: "An unexpected error occurred while deleting the program" }
  }
}

// Update program views
export async function incrementProgramViews(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    // Get current views
    const { data: program, error: getError } = await supabase.from("programs").select("views").eq("id", id).single()

    if (getError) {
      console.error("Program views fetch error:", getError)
      return { error: `Failed to fetch program views: ${getError.message}` }
    }

    // Increment views
    const { error: updateError } = await supabase
      .from("programs")
      .update({ views: (program.views || 0) + 1 })
      .eq("id", id)

    if (updateError) {
      console.error("Program views update error:", updateError)
      return { error: `Failed to update program views: ${updateError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error in incrementProgramViews:", error)
    return { error: "An unexpected error occurred while updating program views" }
  }
}

// Helper function for getting all programs (alias for compatibility)
export const getAllPrograms = getPrograms
