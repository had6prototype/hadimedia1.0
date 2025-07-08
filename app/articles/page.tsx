import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, User } from "lucide-react"
import { getPublishedArticles } from "@/app/admin/articles/actions"
import Link from "next/link"

export default async function ArticlesPage() {
  const result = await getPublishedArticles()

  if (result.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">خطا در بارگذاری مقالات</h1>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    )
  }

  const articles = result.data || []
  const featuredArticles = articles.filter((article) => article.is_featured)
  const regularArticles = articles.filter((article) => !article.is_featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">مقالات</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">مجموعه‌ای از مقالات آموزنده و مفید در زمینه‌های مختلف</p>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                مقالات ویژه
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} featured />
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        {regularArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">همه مقالات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">هنوز مقاله‌ای منتشر نشده</h3>
              <p className="text-gray-600">به زودی مقالات جدید منتشر خواهد شد</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ArticleCardProps {
  article: {
    id: number
    title: string
    excerpt: string
    thumbnail: string | null
    author: string
    views: number
    tags: string | null
    created_at: string
  }
  featured?: boolean
}

function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const tags = article.tags
    ? article.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  return (
    <Link href={`/articles/${article.id}`}>
      <div
        className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
          featured ? "ring-2 ring-yellow-400 ring-opacity-50" : ""
        }`}
      >
        {article.thumbnail && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={article.thumbnail || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            {featured && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">ویژه</Badge>
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{article.excerpt}</p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{article.views.toLocaleString("fa-IR")}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(article.created_at).toLocaleDateString("fa-IR")}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
