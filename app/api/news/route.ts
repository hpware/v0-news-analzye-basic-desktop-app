import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || "global"

    console.log(`Fetching news with query: ${query}`)

    const response = await fetch(`https://news.yuanhau.com/api/home/lt?query=${query}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; NewsApp/1.0)",
      },
      cache: "no-store",
    })

    console.log(`API Response status: ${response.status}`)

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`Invalid content type: ${contentType}`)
      throw new Error("Invalid response format")
    }

    const data = await response.json()
    console.log(`Received data structure:`, Object.keys(data))

    // Transform the response to extract the news articles
    const articles = data.uuidData || data.data || data.articles || []

    if (!Array.isArray(articles)) {
      console.error("Articles data is not an array:", typeof articles)
      return NextResponse.json([])
    }

    console.log(`Found ${articles.length} articles`)

    // Define blocked categories (instead of only allowing specific ones)
    const blockedCategories = [
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

    // Filter out blocked categories (allow most content except explicitly blocked)
    const filteredArticles = articles.filter((article: any) => {
      if (!article || typeof article !== "object") return false

      const category = article.categoryName?.toLowerCase() || ""
      const title = article.title?.toLowerCase() || ""
      const description = article.shortDescription?.toLowerCase() || ""

      // Check if any blocked keywords appear in category, title, or description
      const isBlocked = blockedCategories.some(
        (blocked) => category.includes(blocked) || title.includes(blocked) || description.includes(blocked),
      )

      return !isBlocked && article.title && article.id
    })

    console.log(`Original articles: ${articles.length}, Filtered articles: ${filteredArticles.length}`)

    return NextResponse.json(filteredArticles)
  } catch (error) {
    console.error("Error fetching news:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        error: "Failed to fetch news",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
