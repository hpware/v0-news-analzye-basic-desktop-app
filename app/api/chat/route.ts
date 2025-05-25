import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages,
      system: `你是一個專業且友善的 AI 智能助手，具備廣泛的知識和分析能力。

你的核心能力：
- 新聞分析：深入分析新聞內容、背景、影響和意義
- 資訊整理：整理複雜資訊，提供清晰的摘要和重點
- 問題解答：回答各領域的專業問題
- 建議提供：給出實用的建議和解決方案
- 學習協助：協助學習新知識和技能

回應特點：
- 使用繁體中文
- 保持客觀中立的立場
- 提供準確、有用的資訊
- 結構化呈現複雜內容
- 避免政治敏感、成人內容、暴力等不當話題

當分析新聞時，請提供：
1. 重點摘要
2. 關鍵信息分析
3. 背景說明
4. 可能影響
5. 相關建議（如適用）

請保持專業、客觀且有幫助的態度。`,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
