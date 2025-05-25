"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutWindow() {
  return (
    <Card className="w-full h-full border-0 shadow-none">
      <CardHeader>
        <CardTitle>About Desktop</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Desktop Environment v1.0</h3>
          <p className="text-sm text-gray-600">A modern web-based desktop interface built with React and Next.js.</p>
        </div>

        <div>
          <h4 className="font-medium mb-1">Features:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Draggable windows</li>
            <li>• Window management</li>
            <li>• Multiple applications</li>
            <li>• Real-time clock</li>
            <li>• Responsive design</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-1">Version:</h4>
          <p className="text-sm text-gray-600">1.0.0</p>
        </div>

        <div>
          <h4 className="font-medium mb-1">Built with:</h4>
          <p className="text-sm text-gray-600">React, Next.js, TypeScript, Tailwind CSS</p>
        </div>
      </CardContent>
    </Card>
  )
}
