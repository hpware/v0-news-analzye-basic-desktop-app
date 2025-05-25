import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: "Missing article slug" }, { status: 400 })
    }

    console.log(`Fetching news detail for slug: ${slug}`)

    const response = await fetch(`https://news.yuanhau.com/api/news/get/lt/${slug}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; NewsApp/1.0)",
      },
      cache: "no-store",
    })

    console.log(`News detail API response status: ${response.status}`)

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)

      if (response.status === 404) {
        return NextResponse.json({ error: "文章不存在或已被移除" }, { status: 404 })
      }

      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`Invalid content type: ${contentType}`)
      throw new Error("Invalid response format")
    }

    const data = await response.json()
    console.log("News detail data keys:", Object.keys(data))

    // Transform the API response to match our component interface
    const transformedData = {
      id: slug,
      title: data.title || "無標題",
      content: Array.isArray(data.paragraph) ? data.paragraph.join("\n\n") : data.content || "無內容",
      shortDescription:
        Array.isArray(data.paragraph) && data.paragraph.length > 0
          ? data.paragraph[0].substring(0, 200) + (data.paragraph[0].length > 200 ? "..." : "")
          : data.shortDescription || undefined,
      publishTimeUnix: data.publishTimeUnix || Date.now(),
      publisher: data.origin || data.publisher || "未知來源",
      categoryName: data.categoryName || "一般新聞",
      author: data.author,
      images: Array.isArray(data.images) ? data.images : [],
      cached: data.cached,
      url: {
        hash: slug,
        url: data.url,
      },
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching news detail:", error)
    return NextResponse.json(
      {
        error: "無法載入文章詳細內容",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
