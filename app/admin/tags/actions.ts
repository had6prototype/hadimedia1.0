"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient, type Tag } from "@/lib/supabase"

// Get all tags with usage count
export async function getTags() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all tags
    const { data: tags, error: tagsError } = await supabase.from("tags").select("*").order("name")

    if (tagsError) throw tagsError

    // Get usage count for each tag
    const { data: programTags, error: programTagsError } = await supabase.from("program_tags").select("tag_id")

    if (programTagsError) throw programTagsError

    // Count occurrences of each tag
    const tagCounts: Record<number, number> = {}
    programTags.forEach((pt) => {
      tagCounts[pt.tag_id] = (tagCounts[pt.tag_id] || 0) + 1
    })

    // Add usage count to tags
    const tagsWithCount = tags.map((tag) => ({
      ...tag,
      usageCount: tagCounts[tag.id] || 0,
    }))

    return { tags: tagsWithCount }
  } catch (error) {
    console.error("Failed to get tags:", error)
    return { error: "Failed to get tags" }
  }
}

// Create a new tag
export async function createTag(data: Partial<Tag>) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: newTag, error } = await supabase.from("tags").insert(data).select().single()

    if (error) throw error

    revalidatePath("/admin/tags")
    return { tag: newTag }
  } catch (error) {
    console.error("Failed to create tag:", error)
    return { error: "Failed to create tag" }
  }
}

// Update a tag
export async function updateTag(id: number, data: Partial<Tag>) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: updatedTag, error } = await supabase.from("tags").update(data).eq("id", id).select().single()

    if (error) throw error

    revalidatePath("/admin/tags")
    return { tag: updatedTag }
  } catch (error) {
    console.error("Failed to update tag:", error)
    return { error: "Failed to update tag" }
  }
}

// Delete a tag
export async function deleteTag(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if tag is in use
    const { count, error: countError } = await supabase
      .from("program_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", id)

    if (countError) throw countError

    if (count && count > 0) {
      return { error: "Cannot delete tag that is in use" }
    }

    // Delete tag
    const { error } = await supabase.from("tags").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete tag:", error)
    return { error: "Failed to delete tag" }
  }
}

// Get tag usage count
export async function getTagUsageCount(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    const { count, error } = await supabase
      .from("program_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", id)

    if (error) throw error

    return { count: count || 0 }
  } catch (error) {
    console.error("Failed to get tag usage count:", error)
    return { error: "Failed to get tag usage count" }
  }
}
