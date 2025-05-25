"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Trash2, Copy, Check, Sparkles, Loader2, RefreshCw } from "lucide-react"

export default function AIChatWindow() {
  const [copied, setCopied] = useState<string | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, stop } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "您好！我是您的 AI 智能助手。我可以協助您分析新聞內容、回答問題、提供建議，或協助處理各種任務。有什麼我可以幫助您的嗎？",
      },
    ],
  })

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(messageId)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const clearChat = () => {
    window.location.reload()
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const quickPrompts = [
    "幫我分析最新的科技趨勢",
    "如何提高工作效率？",
    "請推薦一些學習新技能的方法",
    "如何保持資訊的客觀性？",
    "解釋一下人工智能的發展現況",
  ]

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI 智能助手</CardTitle>
                <p className="text-sm text-gray-500">全功能 AI 助手</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={clearChat} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-1" />
                清除對話
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-2xl rounded-br-md"
                    : "bg-white border rounded-2xl rounded-bl-md shadow-sm"
                } p-4`}
              >
                <div className="space-y-2">
                  <div className="prose prose-sm max-w-none">
                    {message.role === "assistant" ? (
                      <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {message.role === "user" && (
                        <div className="flex items-center gap-1 text-blue-100">
                          <User className="w-3 h-3" />
                          <span className="text-xs">您</span>
                        </div>
                      )}
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Bot className="w-3 h-3" />
                          <span className="text-xs">AI助手</span>
                        </div>
                      )}
                      <span className={`text-xs ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}>
                        {formatTime(message.createdAt || new Date())}
                      </span>
                    </div>

                    {message.role === "assistant" && (
                      <Button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        {copied === message.id ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border rounded-2xl rounded-bl-md shadow-sm p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI 正在思考中...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl rounded-bl-md p-4">
                <div className="text-red-600 text-sm mb-2">發生錯誤，無法取得回應</div>
                <Button onClick={() => reload()} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  重試
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="p-4 border-t bg-white/50">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-3">快速開始：</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  onClick={() => handleInputChange({ target: { value: prompt } } as any)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={isLoading ? "AI 正在回應中..." : "輸入您的問題..."}
              disabled={isLoading}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="px-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
            {isLoading && (
              <Button onClick={stop} variant="outline" className="px-4">
                停止
              </Button>
            )}
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">按 Enter 發送，Shift + Enter 換行</p>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                GPT-4 驅動
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
