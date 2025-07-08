"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface Article {
  id: number
  title: string
  content: string
  excerpt: string
  thumbnail: string | null
  status: "draft" | "published" | "archived"
  is_featured: boolean
  tags: string | null
  author: string
  views: number
  created_at: string
  updated_at: string
}

export async function getArticles() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching articles:", error)
      return { error: "خطا در دریافت مقالات", data: [] }
    }

    return { error: null, data: data || [] }
  } catch (error) {
    console.error("Error in getArticles:", error)
    return { error: "خطا در دریافت مقالات", data: [] }
  }
}

export async function getPublishedArticles() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching published articles:", error)
      return { error: "خطا در دریافت مقالات منتشر شده", data: [] }
    }

    return { error: null, data: data || [] }
  } catch (error) {
    console.error("Error in getPublishedArticles:", error)
    return { error: "خطا در دریافت مقالات منتشر شده", data: [] }
  }
}

export async function getArticle(id: number) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("articles").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching article:", error)
      return { error: "خطا در دریافت مقاله", data: null }
    }

    return { error: null, data }
  } catch (error) {
    console.error("Error in getArticle:", error)
    return { error: "خطا در دریافت مقاله", data: null }
  }
}

export async function createArticle(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const thumbnail = formData.get("thumbnail") as string
    const status = formData.get("status") as "draft" | "published" | "archived"
    const is_featured = formData.get("is_featured") === "true"
    const tags = formData.get("tags") as string
    const author = formData.get("author") as string

    if (!title || !content || !excerpt || !author) {
      return { error: "تمام فیلدهای الزامی باید پر شوند", data: null }
    }

    const { data, error } = await supabase
      .from("articles")
      .insert({
        title,
        content,
        excerpt,
        thumbnail: thumbnail || null,
        status: status || "draft",
        is_featured,
        tags: tags || null,
        author,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating article:", error)
      return { error: "خطا در ایجاد مقاله", data: null }
    }

    revalidatePath("/admin/articles")
    revalidatePath("/articles")
    return { error: null, data }
  } catch (error) {
    console.error("Error in createArticle:", error)
    return { error: "خطا در ایجاد مقاله", data: null }
  }
}

export async function updateArticle(id: number, formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const thumbnail = formData.get("thumbnail") as string
    const status = formData.get("status") as "draft" | "published" | "archived"
    const is_featured = formData.get("is_featured") === "true"
    const tags = formData.get("tags") as string
    const author = formData.get("author") as string

    if (!title || !content || !excerpt || !author) {
      return { error: "تمام فیلدهای الزامی باید پر شوند", data: null }
    }

    const { data, error } = await supabase
      .from("articles")
      .update({
        title,
        content,
        excerpt,
        thumbnail: thumbnail || null,
        status: status || "draft",
        is_featured,
        tags: tags || null,
        author,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating article:", error)
      return { error: "خطا در به‌روزرسانی مقاله", data: null }
    }

    revalidatePath("/admin/articles")
    revalidatePath("/articles")
    revalidatePath(`/articles/${id}`)
    return { error: null, data }
  } catch (error) {
    console.error("Error in updateArticle:", error)
    return { error: "خطا در به‌روزرسانی مقاله", data: null }
  }
}

export async function deleteArticle(id: number) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("articles").delete().eq("id", id)

    if (error) {
      console.error("Error deleting article:", error)
      return { error: "خطا در حذف مقاله" }
    }

    revalidatePath("/admin/articles")
    revalidatePath("/articles")
    return { error: null }
  } catch (error) {
    console.error("Error in deleteArticle:", error)
    return { error: "خطا در حذف مقاله" }
  }
}

export async function incrementArticleViews(id: number) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.rpc("increment_article_views", { article_id: id })

    if (error) {
      console.error("Error incrementing article views:", error)
      return { error: "خطا در افزایش تعداد بازدید" }
    }

    return { error: null }
  } catch (error) {
    console.error("Error in incrementArticleViews:", error)
    return { error: "خطا در افزایش تعداد بازدید" }
  }
}

export async function toggleArticleFeatured(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    // First get the current featured status
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("is_featured")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching article:", fetchError)
      return { error: "خطا در دریافت مقاله" }
    }

    // Toggle the featured status
    const { data, error } = await supabase
      .from("articles")
      .update({
        is_featured: !article.is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error toggling article featured:", error)
      return { error: "خطا در تغییر وضعیت ویژه مقاله" }
    }

    revalidatePath("/admin/articles")
    revalidatePath("/articles")
    return { error: null, data }
  } catch (error) {
    console.error("Error in toggleArticleFeatured:", error)
    return { error: "خطا در تغییر وضعیت ویژه مقاله" }
  }
}
