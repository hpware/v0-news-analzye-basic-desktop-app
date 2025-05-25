"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

const sources = [
  {
    id: 1,
    name: "TechCrunch",
    url: "https://techcrunch.com",
    category: "Technology",
    status: "Active",
  },
  {
    id: 2,
    name: "BBC News",
    url: "https://bbc.com/news",
    category: "General",
    status: "Active",
  },
  {
    id: 3,
    name: "Reuters",
    url: "https://reuters.com",
    category: "Business",
    status: "Active",
  },
  {
    id: 4,
    name: "The Verge",
    url: "https://theverge.com",
    category: "Technology",
    status: "Inactive",
  },
]

export default function SourcesWindow() {
  return (
    <div className="w-full h-full overflow-auto">
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">📰 News Sources</h2>
        {sources.map((source) => (
          <Card key={source.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {source.name}
                  <ExternalLink className="w-3 h-3" />
                </CardTitle>
                <Badge variant={source.status === "Active" ? "default" : "secondary"} className="text-xs">
                  {source.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{source.url}</p>
              <Badge variant="outline" className="text-xs">
                {source.category}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
