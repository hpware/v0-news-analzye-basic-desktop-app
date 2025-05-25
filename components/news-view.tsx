"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Loader2,
  Clock,
  User,
  Sparkles,
  AlertCircle,
  Eye,
  Share2,
  Info,
  ImageIcon,
  WifiOff,
  Server,
  MessageSquare,
  Send,
  LoaderIcon as ChatLoader,
  Bot,
  UserIcon as ChatUser,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react"
import { useChat } from "ai/react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface NewsDetail {
  id: string
  title: string
  content: string
  shortDescription?: string
  publishTimeUnix: number
  publisher: string
  categoryName: string
  author?: string
  images?: string[]
  cached?: boolean
  url?: {
    hash: string
    url?: string
  }
}

interface AISummary {
  summary: string
  keyPoints?: string[]
  sentiment?: string
  readingTime?: number
  available?: boolean
  source?: string
  reason?: string
}

interface NewsViewProps {
  slug: string
  urlHash?: string
  onBack: () => void
}

export default function NewsView({ slug, urlHash, onBack }: NewsViewProps) {
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null)
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null)
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [summaryAttempted, setSummaryAttempted] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false) // AI is disabled by default
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiChatExpanded, setAiChatExpanded] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: aiLoading,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
  })

  const fetchNewsDetail = async () => {
    try {
      setLoadingNews(true)
      setNewsError(null)

      const response = await fetch(`/api/news/detail/${slug}`)

      if (!response.ok) {
        throw new Error("Failed to fetch news detail")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Check if the article contains blocked content
      const category = data.categoryName?.toLowerCase() || ""
      const title = data.title?.toLowerCase() || ""
      const description = data.shortDescription?.toLowerCase() || ""

      const blockedKeywords = [
        "adult",
        "成人",
        "色情",
        "賭博",
        "gambling",
        "violence",
        "暴力",
        "血腥",
        "恐怖",
        "horror",
        "politics",
        "政治",
        "political",
        "election",
        "選舉",
        "religion",
        "宗教",
        "religious",
        "faith",
        "信仰",
        "controversial",
        "爭議",
        "sensitive",
        "敏感",
      ]

      const isBlocked = blockedKeywords.some(
        (blocked) => category.includes(blocked) || title.includes(blocked) || description.includes(blocked),
      )

      if (isBlocked) {
        setNewsError("此內容暫不提供瀏覽")
        return
      }

      setNewsDetail(data)
    } catch (err) {
      setNewsError(err instanceof Error ? err.message : "Failed to fetch news")
    } finally {
      setLoadingNews(false)
    }
  }

  const fetchAISummary = async (hash: string) => {
    try {
      setLoadingSummary(true)
      setSummaryError(null)
      setSummaryAttempted(true)

      const response = await fetch(`/api/news/summarize/${hash}`)

      if (!response.ok) {
        throw new Error("Failed to fetch AI summary")
      }

      const data = await response.json()

      if (data.error || data.available === false) {
        setSummaryError(data.error || "AI summarization not available for this article")
        return
      }

      setAiSummary(data)
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Failed to generate AI summary")
    } finally {
      setLoadingSummary(false)
    }
  }

  useEffect(() => {
    fetchNewsDetail()
  }, [slug])

  // Only auto-fetch AI summary if AI is enabled
  useEffect(() => {
    if (urlHash && newsDetail && !summaryAttempted && aiEnabled) {
      fetchAISummary(urlHash)
    }
  }, [urlHash, newsDetail, summaryAttempted, aiEnabled])

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "時間未知"
    }
  }

  const estimateReadingTime = (content?: string) => {
    if (!content) return 1
    const wordsPerMinute = 200 // Average reading speed in Chinese
    const wordCount = content.length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return Math.max(1, minutes) // Ensure at least 1 minute
  }

  const handleShare = async () => {
    if (newsDetail && navigator.share) {
      try {
        await navigator.share({
          title: newsDetail.title,
          text: newsDetail.shortDescription,
          url: newsDetail.url?.url || window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    }
  }

  const handleEnableAI = () => {
    setAiEnabled(true)
    if (urlHash && !summaryAttempted) {
      fetchAISummary(urlHash)
    }
  }

  const analyzeWithAI = () => {
    if (!newsDetail) return

    const analysisPrompt = `請分析以下新聞文章：

標題：${newsDetail.title}
分類：${newsDetail.categoryName}
發布者：${newsDetail.publisher}
內容：${newsDetail.content?.substring(0, 1000)}${newsDetail.content && newsDetail.content.length > 1000 ? "..." : ""}

請提供：
1. 文章重點摘要
2. 關鍵信息分析
3. 可能的影響或意義
4. 相關背景說明

請用繁體中文回應。`

    handleInputChange({ target: { value: analysisPrompt } } as any)
    setShowAIChat(true)
    setAiChatExpanded(true)
  }

  const getSummaryErrorIcon = (reason?: string) => {
    switch (reason) {
      case "network_error":
        return <WifiOff className="w-8 h-8 text-amber-400 mx-auto mb-2" />
      case "service_unavailable":
        return <Server className="w-8 h-8 text-amber-400 mx-auto mb-2" />
      case "not_found":
        return <Info className="w-8 h-8 text-blue-400 mx-auto mb-2" />
      default:
        return <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
    }
  }

  const getSummaryErrorMessage = (reason?: string) => {
    switch (reason) {
      case "network_error":
        return "網路連線問題，無法取得 AI 摘要"
      case "service_unavailable":
        return "AI 摘要服務暫時維護中"
      case "not_found":
        return "此文章尚未支援 AI 摘要功能"
      case "html_response":
        return "AI 摘要服務暫時無法使用"
      default:
        return summaryError || "AI 摘要暫時無法使用"
    }
  }

  if (loadingNews) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <div className="text-center">
            <p className="text-lg font-medium">載入新聞內容中...</p>
            <p className="text-sm text-gray-500">請稍候</p>
          </div>
        </div>
      </div>
    )
  }

  if (newsError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">無法顯示內容</h3>
          <p className="text-gray-600 mb-4">{newsError}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <Button onClick={fetchNewsDetail}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重試
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!newsDetail) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">找不到新聞內容</p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回新聞列表
          </Button>
          <div className="flex gap-2">
            <Button onClick={analyzeWithAI} variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI 分析
            </Button>
            {navigator.share && (
              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            )}
            {newsDetail.url?.url && (
              <Button onClick={() => window.open(newsDetail.url?.url, "_blank")} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                原文連結
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Article Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">{newsDetail.categoryName}</Badge>
                  {newsDetail.cached && (
                    <Badge variant="outline" className="text-xs">
                      快取版本
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-2xl lg:text-3xl font-bold leading-tight">{newsDetail.title}</CardTitle>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{newsDetail.publisher}</span>
                  </div>
                  {newsDetail.author && (
                    <div className="flex items-center gap-1">
                      <span>作者：{newsDetail.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(newsDetail.publishTimeUnix)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>約 {estimateReadingTime(newsDetail.content)} 分鐘閱讀</span>
                  </div>
                </div>

                {newsDetail.shortDescription && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-gray-700 font-medium">{newsDetail.shortDescription}</p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Images */}
                {newsDetail.images && newsDetail.images.length > 0 && (
                  <div className="space-y-4">
                    {newsDetail.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={`新聞圖片 ${index + 1}`}
                          className="w-full h-auto rounded-lg shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {newsDetail.content ? (
                    <div className="space-y-4">
                      {newsDetail.content.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="text-gray-800 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">內容載入中或暫無內容...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Summary Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI 智能摘要
                  {!aiEnabled && (
                    <Badge variant="outline" className="text-xs ml-2">
                      已停用
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!aiEnabled ? (
                  <div className="text-center py-6">
                    <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">AI 摘要功能預設為停用狀態</p>
                    <p className="text-xs text-gray-500 mb-4">點擊下方按鈕啟用 AI 智能摘要功能</p>
                    {urlHash ? (
                      <Button onClick={handleEnableAI} variant="outline" size="sm">
                        <Sparkles className="w-4 h-4 mr-2" />
                        啟用 AI 摘要
                      </Button>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">此文章不支援 AI 摘要功能</p>
                      </div>
                    )}
                  </div>
                ) : loadingSummary ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    <p className="text-sm text-gray-600">AI 正在分析文章...</p>
                  </div>
                ) : summaryError ? (
                  <div className="text-center py-6">
                    {getSummaryErrorIcon(aiSummary?.reason)}
                    <p className="text-sm text-amber-600 mb-3">{getSummaryErrorMessage(aiSummary?.reason)}</p>
                    {urlHash && aiSummary?.reason !== "not_found" && (
                      <Button onClick={() => fetchAISummary(urlHash)} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重新嘗試
                      </Button>
                    )}
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                      <p className="text-xs text-amber-700">
                        {aiSummary?.reason === "not_found"
                          ? "此文章可能較新或格式特殊，暫不支援 AI 摘要。"
                          : "AI 摘要功能可能暫時無法使用，您仍可以閱讀完整文章內容。"}
                      </p>
                    </div>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-800 leading-relaxed">{aiSummary.summary}</p>
                    </div>

                    {aiSummary.keyPoints && aiSummary.keyPoints.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">重點摘要</h4>
                        <ul className="space-y-2">
                          {aiSummary.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiSummary.sentiment && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">情感分析</h4>
                        <Badge variant="outline">{aiSummary.sentiment}</Badge>
                      </div>
                    )}

                    {aiSummary.readingTime && (
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        AI 預估閱讀時間：{aiSummary.readingTime} 分鐘
                      </div>
                    )}

                    {aiSummary.source && (
                      <div className="text-xs text-gray-400 pt-1">
                        摘要來源：
                        {aiSummary.source === "text_response"
                          ? "文本分析"
                          : aiSummary.source === "json_response"
                            ? "AI 服務"
                            : aiSummary.source === "fallback_text"
                              ? "備用分析"
                              : "AI 服務"}
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <Button
                        onClick={() => {
                          setAiEnabled(false)
                          setAiSummary(null)
                          setSummaryError(null)
                          setSummaryAttempted(false)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-500"
                      >
                        停用 AI 摘要
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">AI 摘要已啟用但無法生成</p>
                    <p className="text-xs text-gray-400">可能是因為文章格式或來源限制</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Article Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">文章資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">發布者：</span>
                  <span className="text-sm">{newsDetail.publisher}</span>
                </div>
                {newsDetail.author && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">作者：</span>
                    <span className="text-sm">{newsDetail.author}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">分類：</span>
                  <span className="text-sm">{newsDetail.categoryName}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">發布時間：</span>
                  <span className="text-sm">{formatDate(newsDetail.publishTimeUnix)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">字數：</span>
                  <span className="text-sm">{(newsDetail.content?.length || 0).toLocaleString()} 字</span>
                </div>
                {newsDetail.images && newsDetail.images.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">圖片：</span>
                    <span className="text-sm flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {newsDetail.images.length} 張
                    </span>
                  </div>
                )}
                {newsDetail.cached && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">狀態：</span>
                    <span className="text-sm text-blue-600">快取版本</span>
                  </div>
                )}
                {urlHash && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">文章ID：</span>
                    <span className="text-xs text-gray-400 font-mono">{urlHash}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* AI Chat Integration */}
        {showAIChat && (
          <div
            className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border transition-all duration-300 z-50 ${
              aiChatExpanded ? "w-96 h-96" : "w-80 h-64"
            }`}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span className="font-medium text-sm">AI 新聞分析</span>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => setAiChatExpanded(!aiChatExpanded)}
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 text-white hover:bg-white/20"
                >
                  {aiChatExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </Button>
                <Button
                  onClick={() => setShowAIChat(false)}
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 text-white hover:bg-white/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className={`${aiChatExpanded ? "h-72" : "h-40"} p-3`}>
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-4">
                    <Bot className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">點擊「AI 分析」開始分析這篇新聞</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${
                        message.role === "user"
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <ChatUser className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg rounded-bl-sm p-2">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <ChatLoader className="w-3 h-3 animate-spin" />
                        <span>AI 分析中...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-3 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="詢問關於這篇新聞的問題..."
                  disabled={aiLoading}
                  className="flex-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e as any)
                    }
                  }}
                />
                <Button type="submit" disabled={aiLoading || !input.trim()} size="sm">
                  {aiLoading ? <ChatLoader className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
