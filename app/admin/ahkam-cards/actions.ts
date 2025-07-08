"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type AhkamCard = {
  id: number
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getAhkamCards() {
  try {
    const { data, error } = await supabase.from("ahkam_cards").select("*").order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching ahkam cards:", error)
      return { error: "خطا در دریافت کارت‌های احکام" }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در دریافت کارت‌های احکام" }
  }
}

export async function createAhkamCard(cardData: {
  title: string
  description?: string
  image_url?: string
  link_url?: string
  display_order?: number
  is_active?: boolean
}) {
  try {
    const { data, error } = await supabase
      .from("ahkam_cards")
      .insert([
        {
          ...cardData,
          display_order: cardData.display_order || 0,
          is_active: cardData.is_active ?? true,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating ahkam card:", error)
      return { error: "خطا در ایجاد کارت احکام" }
    }

    revalidatePath("/admin/ahkam-cards")
    revalidatePath("/")
    return { data }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در ایجاد کارت احکام" }
  }
}

export async function updateAhkamCard(
  id: number,
  cardData: {
    title?: string
    description?: string
    image_url?: string
    link_url?: string
    display_order?: number
    is_active?: boolean
  },
) {
  try {
    const { data, error } = await supabase
      .from("ahkam_cards")
      .update({
        ...cardData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating ahkam card:", error)
      return { error: "خطا در به‌روزرسانی کارت احکام" }
    }

    revalidatePath("/admin/ahkam-cards")
    revalidatePath("/")
    return { data }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در به‌روزرسانی کارت احکام" }
  }
}

export async function deleteAhkamCard(id: number) {
  try {
    const { error } = await supabase.from("ahkam_cards").delete().eq("id", id)

    if (error) {
      console.error("Error deleting ahkam card:", error)
      return { error: "خطا در حذف کارت احکام" }
    }

    revalidatePath("/admin/ahkam-cards")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در حذف کارت احکام" }
  }
}

// Public function to get active cards for frontend
export async function getActiveAhkamCards() {
  try {
    const { data, error } = await supabase
      .from("ahkam_cards")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching active ahkam cards:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}
