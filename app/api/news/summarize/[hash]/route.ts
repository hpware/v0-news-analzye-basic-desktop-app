import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
  try {
    const { hash } = params

    console.log(`Attempting to fetch AI summary for hash: ${hash}`)

    const response = await fetch(`https://news.yuanhau.com/api/ai/summarize/${hash}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    console.log(`Response status: ${response.status}`)
    console.log(`Response content-type: ${response.headers.get("content-type")}`)

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)

      // Handle specific HTTP status codes
      if (response.status === 404) {
        return NextResponse.json({
          error: "此文章暫無 AI 摘要",
          available: false,
          reason: "not_found",
        })
      }

      if (response.status === 503 || response.status === 502) {
        return NextResponse.json({
          error: "AI 摘要服務暫時無法使用",
          available: false,
          reason: "service_unavailable",
        })
      }

      return NextResponse.json({
        error: `AI 摘要服務錯誤 (${response.status})`,
        available: false,
        reason: "http_error",
      })
    }

    // Get the response as text first to check what we're dealing with
    const responseText = await response.text()
    console.log(`Response text length: ${responseText.length}`)
    console.log(`Response text preview: ${responseText.substring(0, 200)}`)

    if (!responseText || responseText.trim().length === 0) {
      console.error("Empty response from AI service")
      return NextResponse.json({
        error: "AI 摘要服務返回空內容",
        available: false,
        reason: "empty_response",
      })
    }

    // Check if response looks like HTML (error page)
    if (responseText.trim().startsWith("<") || responseText.includes("<!DOCTYPE") || responseText.includes("<html")) {
      console.error("Received HTML response instead of JSON")
      return NextResponse.json({
        error: "AI 摘要服務暫時無法使用",
        available: false,
        reason: "html_response",
      })
    }

    // Check if response looks like plain text (not JSON)
    if (!responseText.trim().startsWith("{") && !responseText.trim().startsWith("[")) {
      console.log("Received plain text response, treating as summary")

      // If it's a reasonable length for a summary, use it
      if (responseText.length > 10 && responseText.length < 5000) {
        return NextResponse.json({
          summary: responseText.trim(),
          available: true,
          source: "text_response",
          keyPoints: [],
        })
      } else {
        return NextResponse.json({
          error: "AI 摘要格式不正確",
          available: false,
          reason: "invalid_text_length",
        })
      }
    }

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError)
      console.error("Response text:", responseText.substring(0, 500))

      // Last resort: if the text looks like it could be a summary, use it
      if (responseText.length > 20 && responseText.length < 2000 && !responseText.includes("<")) {
        return NextResponse.json({
          summary: responseText.trim(),
          available: true,
          source: "fallback_text",
          keyPoints: [],
        })
      }

      return NextResponse.json({
        error: "AI 摘要格式解析失敗",
        available: false,
        reason: "json_parse_error",
      })
    }

    // Validate and normalize the parsed JSON data
    if (typeof data === "object" && data !== null) {
      // Handle different possible response structures
      const normalizedData = {
        summary: data.summary || data.content || data.text || "無法生成摘要",
        keyPoints: Array.isArray(data.keyPoints)
          ? data.keyPoints
          : Array.isArray(data.key_points)
            ? data.key_points
            : Array.isArray(data.points)
              ? data.points
              : [],
        sentiment: data.sentiment || data.emotion || undefined,
        readingTime: data.readingTime || data.reading_time || data.estimatedTime || undefined,
        available: true,
        source: "json_response",
      }

      return NextResponse.json(normalizedData)
    } else if (typeof data === "string") {
      // If the JSON contains just a string, treat it as the summary
      return NextResponse.json({
        summary: data,
        available: true,
        source: "json_string",
        keyPoints: [],
      })
    } else {
      return NextResponse.json({
        error: "AI 摘要數據格式不正確",
        available: false,
        reason: "invalid_data_structure",
      })
    }
  } catch (error) {
    console.error("Error in AI summarize route:", error)

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json({
        error: "無法連接到 AI 摘要服務",
        available: false,
        reason: "network_error",
      })
    }

    return NextResponse.json({
      error: "AI 摘要服務發生未知錯誤",
      available: false,
      reason: "unknown_error",
    })
  }
}
