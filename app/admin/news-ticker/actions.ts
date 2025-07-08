"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type NewsTickerItem = {
  id: number
  text: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getNewsTickerItems() {
  try {
    const { data, error } = await supabase.from("news_ticker").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching news ticker items:", error)
      return { error: "خطا در دریافت اخبار", data: [] }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در دریافت اخبار", data: [] }
  }
}

export async function createNewsTickerItem(itemData: {
  text: string
  display_order?: number
  is_active?: boolean
}) {
  try {
    const { data, error } = await supabase
      .from("news_ticker")
      .insert([
        {
          ...itemData,
          display_order: itemData.display_order || 0,
          is_active: itemData.is_active ?? true,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating news ticker item:", error)
      return { error: "خطا در ایجاد خبر" }
    }

    revalidatePath("/admin/news-ticker")
    revalidatePath("/")
    return { data }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در ایجاد خبر" }
  }
}

export async function updateNewsTickerItem(
  id: number,
  itemData: {
    text?: string
    display_order?: number
    is_active?: boolean
  },
) {
  try {
    const { data, error } = await supabase
      .from("news_ticker")
      .update({
        ...itemData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating news ticker item:", error)
      return { error: "خطا در به‌روزرسانی خبر" }
    }

    revalidatePath("/admin/news-ticker")
    revalidatePath("/")
    return { data }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در به‌روزرسانی خبر" }
  }
}

export async function deleteNewsTickerItem(id: number) {
  try {
    console.log("Attempting to delete news ticker item with ID:", id)

    const { error } = await supabase.from("news_ticker").delete().eq("id", id)

    if (error) {
      console.error("Supabase error deleting news ticker item:", error)
      return { error: `خطا در حذف خبر: ${error.message}` }
    }

    console.log("Successfully deleted news ticker item with ID:", id)
    revalidatePath("/admin/news-ticker")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "خطا در حذف خبر" }
  }
}

// Public function to get active items for frontend
export async function getActiveNewsTickerItems() {
  try {
    const { data, error } = await supabase
      .from("news_ticker")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching active news ticker items:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}
