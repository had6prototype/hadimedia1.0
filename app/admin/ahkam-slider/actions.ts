"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type AhkamSlide = {
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

export async function getAhkamSlides() {
  try {
    const { data, error } = await supabase.from("ahkam_slider").select("*").order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching ahkam slides:", error)
      return { error: "خطا در دریافت اسلایدها" }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در دریافت اسلایدها" }
  }
}

export async function createAhkamSlide(slideData: {
  title: string
  description?: string
  image_url?: string
  link_url?: string
  display_order?: number
  is_active?: boolean
}) {
  try {
    const { data, error } = await supabase
      .from("ahkam_slider")
      .insert([
        {
          ...slideData,
          display_order: slideData.display_order || 0,
          is_active: slideData.is_active ?? true,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating ahkam slide:", error)
      return { error: "خطا در ایجاد اسلاید" }
    }

    revalidatePath("/admin/ahkam-slider")
    revalidatePath("/")
    return { data }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در ایجاد اسلاید" }
  }
}

export async function updateAhkamSlide(
  id: number,
  slideData: {
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
      .from("ahkam_slider")
      .update({
        ...slideData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating ahkam slide:", error)
      return { error: "خطا در به‌روزرسانی اسلاید" }
    }

    revalidatePath("/admin/ahkam-slider")
    revalidatePath("/")
    return { data }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در به‌روزرسانی اسلاید" }
  }
}

export async function deleteAhkamSlide(id: number) {
  try {
    const { error } = await supabase.from("ahkam_slider").delete().eq("id", id)

    if (error) {
      console.error("Error deleting ahkam slide:", error)
      return { error: "خطا در حذف اسلاید" }
    }

    revalidatePath("/admin/ahkam-slider")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در حذف اسلاید" }
  }
}

export async function updateSlideOrder(slides: { id: number; display_order: number }[]) {
  try {
    for (const slide of slides) {
      const { error } = await supabase
        .from("ahkam_slider")
        .update({
          display_order: slide.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", slide.id)

      if (error) {
        console.error("Error updating slide order:", error)
        return { error: "خطا در به‌روزرسانی ترتیب اسلایدها" }
      }
    }

    revalidatePath("/admin/ahkam-slider")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { error: "خطا در به‌روزرسانی ترتیب اسلایدها" }
  }
}

// Public function to get active slides for frontend
export async function getActiveAhkamSlides() {
  try {
    const { data, error } = await supabase
      .from("ahkam_slider")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching active ahkam slides:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}
