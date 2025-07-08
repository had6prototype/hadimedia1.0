"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface SiteSetting {
  id: number
  setting_key: string
  setting_value: string | null
  setting_type: string
  display_name: string
  category: string
  display_order: number
  created_at: string
  updated_at: string
}

export async function getSettings() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("category", { ascending: true })
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching settings:", error)
      return { error: "خطا در دریافت تنظیمات", data: [] }
    }

    return { error: null, data: data || [] }
  } catch (error) {
    console.error("Error in getSettings:", error)
    return { error: "خطا در دریافت تنظیمات", data: [] }
  }
}

export async function getSettingsByCategory(category: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("category", category)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching settings by category:", error)
      return {}
    }

    // Convert array to simple key-value object
    const settingsObj: Record<string, string> = {}
    if (data && Array.isArray(data)) {
      data.forEach((setting) => {
        settingsObj[setting.setting_key] = setting.setting_value || ""
      })
    }

    return settingsObj
  } catch (error) {
    console.error("Error in getSettingsByCategory:", error)
    return {}
  }
}

export async function updateMultipleSettings(settings: Record<string, string>) {
  try {
    const supabase = createServerSupabaseClient()

    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      const { error } = await supabase
        .from("site_settings")
        .update({
          setting_value: value,
          updated_at: new Date().toISOString(),
        })
        .eq("setting_key", key)

      if (error) {
        console.error(`Error updating setting ${key}:`, error)
        throw error
      }
    })

    await Promise.all(updatePromises)

    revalidatePath("/admin/settings")
    revalidatePath("/")
    revalidatePath("/contact")
    return { error: null }
  } catch (error) {
    console.error("Error in updateMultipleSettings:", error)
    return { error: "خطا در به‌روزرسانی تنظیمات" }
  }
}

export async function getSetting(key: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("site_settings").select("*").eq("setting_key", key).single()

    if (error) {
      console.error("Error fetching setting:", error)
      return { error: "خطا در دریافت تنظیم", data: null }
    }

    return { error: null, data }
  } catch (error) {
    console.error("Error in getSetting:", error)
    return { error: "خطا در دریافت تنظیم", data: null }
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("site_settings")
      .update({
        setting_value: value,
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", key)
      .select()
      .single()

    if (error) {
      console.error("Error updating setting:", error)
      return { error: "خطا در به‌روزرسانی تنظیم", data: null }
    }

    revalidatePath("/admin/settings")
    revalidatePath("/")
    revalidatePath("/contact")
    return { error: null, data }
  } catch (error) {
    console.error("Error in updateSetting:", error)
    return { error: "خطا در به‌روزرسانی تنظیم", data: null }
  }
}
