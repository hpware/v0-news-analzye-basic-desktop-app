"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import NewsView from "@/components/news-view"

interface NewsItem {
  id: string
  title: string
  shortDescription: string
  categoryName: string
  publishTimeUnix: number
  publisher: string
  thumbnail?: {
    type: string
    hash: string
  }
  url?: {
    hash: string
  }
}

export default function NewsWindow() {
  const [newsArticles, setNewsArticles] = useState<NewsItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewingArticle, setViewingArticle] = useState<{ slug: string; urlHash?: string } | null>(null)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching news...")
      const response = await fetch("/api/news?query=global")

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Received data:", data)

      if (data.error) {
        throw new Error(data.error + (data.details ? ` - ${data.details}` : ""))
      }

      const articles = Array.isArray(data) ? data : []
      console.log(`Setting ${articles.length} articles`)
      setNewsArticles(articles)
    } catch (err) {
      console.error("News fetch error:", err)
      setError(err instanceof Error ? err.message : "載入新聞時發生未知錯誤")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const filteredNews = newsArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTimeAgo = (timestamp: number) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) return "剛剛"
      if (diffInHours < 24) return `${diffInHours}小時前`

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays === 1) return "1天前"
      if (diffInDays < 7) return `${diffInDays}天前`

      const diffInWeeks = Math.floor(diffInDays / 7)
      return `${diffInWeeks}週前`
    } catch {
      return "最近"
    }
  }

  if (viewingArticle) {
    return (
      <NewsView slug={viewingArticle.slug} urlHash={viewingArticle.urlHash} onBack={() => setViewingArticle(null)} />
    )
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm text-gray-600">載入新聞中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">載入新聞時發生錯誤</h3>
          <p className="text-sm text-gray-600 mb-4 break-words">{error}</p>
          <div className="space-y-2">
            <Button variant="outline" size="sm" onClick={fetchNews} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新載入
            </Button>
            <p className="text-xs text-gray-500">如果問題持續發生，請檢查網路連線或稍後再試</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4 sticky inset-x-0 top-0 mt-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜尋新聞..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={fetchNews}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <h2 className="text-xl font-bold">📰 BlindSpec 最新新聞</h2>

        {filteredNews.length === 0 && !searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500">暫無新聞文章</p>
          </div>
        )}

        {filteredNews.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500">找不到符合「{searchTerm}」的新聞</p>
          </div>
        )}

        {filteredNews.map((article) => (
          <Card
            key={article.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setViewingArticle({ slug: article.url?.hash || article.id, urlHash: article.url?.hash })}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium mb-2 line-clamp-2">{article.title}</CardTitle>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {article.categoryName}
                    </Badge>
                    {article.publisher && (
                      <Badge variant="outline" className="text-xs">
                        {article.publisher}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{article.shortDescription}</p>
              <p className="text-xs text-gray-400">{formatTimeAgo(article.publishTimeUnix)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
