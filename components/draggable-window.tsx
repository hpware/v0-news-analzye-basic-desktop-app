"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Minus, Square } from "lucide-react"

interface DraggableWindowProps {
  title: string
  width: string
  height: string
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  zIndex: number
  black?: boolean
  maximized?: boolean
  children: React.ReactNode
}

export default function DraggableWindow({
  title,
  width,
  height,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  zIndex,
  black = false,
  maximized = false,
  children,
}: DraggableWindowProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!maximized && (e.target === e.currentTarget || (e.target as HTMLElement).closest(".window-header"))) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
      onFocus()
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  return (
    <div
      ref={windowRef}
      className={`absolute border rounded-lg shadow-lg ${
        black ? "bg-black border-gray-600" : "bg-white border-gray-300"
      } ${maximized ? "rounded-none" : ""}`}
      style={{
        left: maximized ? 0 : position.x,
        top: maximized ? 40 : position.y,
        width,
        height,
        zIndex,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onClick={onFocus}
    >
      {/* Window header */}
      <div
        className={`window-header flex items-center justify-between p-2 rounded-t-lg cursor-grab ${
          black ? "bg-gray-800 border-b border-gray-600" : "bg-gray-100 border-b"
        }`}
        onMouseDown={handleMouseDown}
      >
        <span className={`font-medium text-sm ${black ? "text-white" : "text-gray-900"}`}>{title}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
            className={`w-6 h-6 p-0 ${
              black ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onMaximize()
            }}
            className={`w-6 h-6 p-0 ${
              black ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Square className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className={`w-6 h-6 p-0 ${
              black ? "text-gray-400 hover:text-red-400 hover:bg-gray-700" : "text-gray-600 hover:text-red-600"
            }`}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Window content */}
      <div
        className={`p-4 overflow-auto ${black ? "text-white" : "text-gray-900"} ${
          maximized ? "h-[calc(100vh-120px)]" : "h-[calc(100%-60px)]"
        }`}
      >
        {children}
      </div>
    </div>
  )
}
