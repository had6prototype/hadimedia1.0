import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, User, ArrowRight } from "lucide-react"
import { getArticle, incrementArticleViews } from "@/app/admin/articles/actions"
import Link from "next/link"

interface ArticlePageProps {
  params: {
    id: string
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const articleId = Number.parseInt(params.id)

  if (isNaN(articleId)) {
    notFound()
  }

  const result = await getArticle(articleId)

  if (result.error || !result.data) {
    notFound()
  }

  const article = result.data

  // Increment views (fire and forget)
  incrementArticleViews(articleId).catch(console.error)

  // Parse tags
  const tags = article.tags
    ? article.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به مقالات
          </Link>
        </div>

        {/* Article Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {article.thumbnail && (
            <div className="relative h-64 md:h-96 overflow-hidden">
              <img
                src={article.thumbnail || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {article.is_featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">ویژه</Badge>
                </div>
              )}
            </div>
          )}

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{article.excerpt}</p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.created_at).toLocaleDateString("fa-IR")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{article.views.toLocaleString("fa-IR")} بازدید</span>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Article Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowRight className="h-4 w-4" />
            مشاهده مقالات بیشتر
          </Link>
        </div>
      </div>
    </div>
  )
}
