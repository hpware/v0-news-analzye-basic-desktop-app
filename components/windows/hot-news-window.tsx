"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export default function HotNewsWindow() {
  const [hotNews, setHotNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewingArticle, setViewingArticle] = useState<{ slug: string; urlHash?: string } | null>(null)

  const fetchHotNews = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching hot news...")
      const response = await fetch("/api/news?query=global")

      console.log("Hot news response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Hot news response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Hot news received data:", data)

      if (data.error) {
        throw new Error(data.error + (data.details ? ` - ${data.details}` : ""))
      }

      // Take the first 6 articles for hot news
      const articles = Array.isArray(data) ? data.slice(0, 6) : []
      console.log(`Setting ${articles.length} hot news articles`)
      setHotNews(articles)
    } catch (err) {
      console.error("Hot news fetch error:", err)
      setError(err instanceof Error ? err.message : "載入熱門新聞時發生未知錯誤")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotNews()
  }, [])

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
          <span className="text-sm text-gray-600">載入熱門新聞中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">載入熱門新聞時發生錯誤</h3>
          <p className="text-sm text-gray-600 mb-4 break-words">{error}</p>
          <div className="space-y-2">
            <Button onClick={fetchHotNews} variant="outline" size="sm" className="w-full">
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">🔥 熱門新聞</h2>
          <Button onClick={fetchHotNews} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {hotNews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暫無熱門新聞</p>
          </div>
        ) : (
          hotNews.map((news) => (
            <Card
              key={news.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setViewingArticle({ slug: news.url?.hash || news.id, urlHash: news.url?.hash })}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium line-clamp-2">{news.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                    {news.categoryName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{news.shortDescription}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">{formatTimeAgo(news.publishTimeUnix)}</p>
                  {news.publisher && (
                    <Badge variant="outline" className="text-xs">
                      {news.publisher}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
