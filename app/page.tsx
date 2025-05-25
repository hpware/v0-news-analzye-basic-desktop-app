"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Monitor, ChevronRight } from "lucide-react"
import DraggableWindow from "@/components/draggable-window"
import LoginWindow from "@/components/windows/login-window"
import HotNewsWindow from "@/components/windows/hot-news-window"
import SourcesWindow from "@/components/windows/sources-window"
import AboutWindow from "@/components/windows/about-window"
import AIChatWindow from "@/components/windows/ai-chat-window"
import TTYWindow from "@/components/windows/tty-window"
import NewsWindow from "@/components/windows/news-window"
import SettingsWindow from "@/components/windows/settings-window"

interface NavBarItem {
  name: string
  windowId: string
  minimized: boolean
}

interface AppWindow {
  id: string
  name: string
  title: string
  component: React.ComponentType<any>
  width: string
  height: string
  black?: boolean
  minimized?: boolean
  maximized?: boolean
}

const menuItems = [
  { name: "Hot News", windowName: "hotnews" },
  { name: "News", windowName: "news" },
  { name: "Sources", windowName: "sources" },
  { name: "AI Chat", windowName: "aichat" },
  { name: "About", windowName: "about" },
  { name: "Terminal", windowName: "tty" },
  { name: "Settings", windowName: "settings" },
  { name: "Login", windowName: "login" },
  { name: "Exit", windowName: "leave" },
]

const windowConfigs = [
  {
    name: "hotnews",
    title: "Hot News",
    component: HotNewsWindow,
    width: "700px",
    height: "500px",
  },
  {
    name: "login",
    title: "Login",
    component: LoginWindow,
    width: "400px",
    height: "300px",
  },
  {
    name: "sources",
    title: "Sources",
    component: SourcesWindow,
    width: "700px",
    height: "500px",
  },
  {
    name: "about",
    title: "About",
    component: AboutWindow,
    width: "500px",
    height: "400px",
  },
  {
    name: "settings",
    title: "Settings",
    component: SettingsWindow,
    width: "600px",
    height: "450px",
  },
  {
    name: "news",
    title: "News",
    component: NewsWindow,
    width: "800px",
    height: "600px",
  },
  {
    name: "aichat",
    title: "AI Assistant",
    component: AIChatWindow,
    width: "800px",
    height: "650px",
  },
  {
    name: "tty",
    title: "Terminal",
    component: TTYWindow,
    width: "600px",
    height: "400px",
    black: true,
  },
]

export default function Desktop() {
  const [bootingAnimation, setBootingAnimation] = useState(true)
  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeWindows, setActiveWindows] = useState<AppWindow[]>([])
  const [navBarItems, setNavBarItems] = useState<NavBarItem[]>([])
  const [currentDate, setCurrentDate] = useState("")
  const [windowCounter, setWindowCounter] = useState(0)
  const [titleAppName, setTitleAppName] = useState("Desktop")

  // Boot animation effect
  useEffect(() => {
    const progressTimer1 = setTimeout(() => setProgress(10), Math.random() * 50)
    const progressTimer2 = setTimeout(() => setProgress(30), Math.random() * 100)
    const progressTimer3 = setTimeout(() => setProgress(70), Math.random() * 150)
    const progressTimer4 = setTimeout(() => setProgress(100), 1800)
    const bootTimer = setTimeout(() => setBootingAnimation(false), 2000)

    return () => {
      clearTimeout(progressTimer1)
      clearTimeout(progressTimer2)
      clearTimeout(progressTimer3)
      clearTimeout(progressTimer4)
      clearTimeout(bootTimer)
    }
  }, [])

  // Date and time update
  useEffect(() => {
    const updateDate = () => {
      const now = new Date()
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      )
    }

    updateDate()
    const interval = setInterval(updateDate, 1000)
    return () => clearInterval(interval)
  }, [])

  const openWindow = (windowName: string) => {
    if (windowName === "leave") {
      if (confirm("Are you sure you want to exit?")) {
        window.close()
      }
      return
    }

    // Prevent duplicate login/about windows
    if ((windowName === "login" || windowName === "about") && activeWindows.some((w) => w.name === windowName)) {
      return
    }

    const config = windowConfigs.find((w) => w.name === windowName)
    if (!config) return

    const windowId = `${windowName}-${windowCounter}`
    const newWindow: AppWindow = {
      id: windowId,
      name: windowName,
      title: config.title,
      component: config.component,
      width: config.width,
      height: config.height,
      black: config.black,
      minimized: false,
      maximized: false,
    }

    setActiveWindows((prev) => [...prev, newWindow])
    setNavBarItems((prev) => [
      ...prev,
      {
        name: config.title,
        windowId,
        minimized: false,
      },
    ])
    setWindowCounter((prev) => prev + 1)
    setTitleAppName(config.title)
    setMenuOpen(false)
  }

  const closeWindow = (windowId: string) => {
    setActiveWindows((prev) => prev.filter((w) => w.id !== windowId))
    setNavBarItems((prev) => prev.filter((item) => item.windowId !== windowId))

    // Update title to show remaining windows or default
    const remainingWindows = activeWindows.filter((w) => w.id !== windowId)
    if (remainingWindows.length > 0) {
      setTitleAppName(remainingWindows[remainingWindows.length - 1].title)
    } else {
      setTitleAppName("Desktop")
    }
  }

  const minimizeWindow = (windowId: string) => {
    setActiveWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, minimized: true } : w)))
    setNavBarItems((prev) => prev.map((item) => (item.windowId === windowId ? { ...item, minimized: true } : item)))
  }

  const maximizeWindow = (windowId: string) => {
    setActiveWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, maximized: !w.maximized } : w)))
  }

  const restoreWindow = (windowId: string) => {
    setActiveWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, minimized: false } : w)))
    setNavBarItems((prev) => prev.map((item) => (item.windowId === windowId ? { ...item, minimized: false } : item)))

    // Focus the window after restoring
    const window = activeWindows.find((w) => w.id === windowId)
    if (window) {
      setTitleAppName(window.title)
    }
  }

  const focusWindow = (windowId: string) => {
    const window = activeWindows.find((w) => w.id === windowId)
    if (window) {
      setTitleAppName(window.title)
      // Move window to end of array (top z-index)
      setActiveWindows((prev) => {
        const filtered = prev.filter((w) => w.id !== windowId)
        return [...filtered, window]
      })
    }
  }

  if (bootingAnimation) {
    return (
      <div className="flex flex-col justify-center items-center absolute w-full h-screen inset-0 bg-gray-900 text-white">
        <Progress value={progress} className="w-3/5 mb-4" />
        <span className="text-xl font-bold">Loading Desktop...</span>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden">
      {/* Taskbar */}
      <div className="absolute inset-x-0 top-0 flex flex-row px-2 py-1 bg-gray-800/70 backdrop-blur-sm text-white justify-between items-center z-[1500]">
        {/* Left side - Menu and window tabs */}
        <div className="flex flex-row items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 p-0 text-white hover:text-blue-400"
          >
            <Monitor className="w-5 h-5" />
          </Button>

          <span className="text-gray-400">|</span>

          {/* Window tabs */}
          <div className="flex flex-row gap-1 overflow-x-auto max-w-md">
            {navBarItems.map((item) => (
              <Button
                key={item.windowId}
                variant="ghost"
                size="sm"
                onClick={() => (item.minimized ? restoreWindow(item.windowId) : focusWindow(item.windowId))}
                className={`text-gray-300 hover:bg-gray-700 px-3 py-1 text-xs whitespace-nowrap ${
                  item.minimized ? "opacity-60 italic" : ""
                }`}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Right side - Language and time */}
        <div className="flex flex-row items-center gap-4">
          <Button variant="ghost" size="sm" className="text-white hover:text-blue-200">
            TW
          </Button>
          <div className="text-sm font-mono">{currentDate}</div>
        </div>
      </div>

      {/* Menu dropdown */}
      {menuOpen && (
        <div className="absolute top-12 left-2 bg-gray-800 shadow-lg rounded-lg p-2 z-[2000] min-w-[150px]">
          {menuItems.map((item) => (
            <Button
              key={item.windowName}
              variant="ghost"
              onClick={() => openWindow(item.windowName)}
              className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <span>{item.name}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ))}
        </div>
      )}

      {/* Desktop area */}
      <div className="w-full h-full pt-10">
        {/* Windows */}
        {activeWindows
          .filter((window) => !window.minimized)
          .map((window, index) => (
            <DraggableWindow
              key={window.id}
              title={window.title}
              width={window.maximized ? "100vw" : window.width}
              height={window.maximized ? "calc(100vh - 40px)" : window.height}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onMaximize={() => maximizeWindow(window.id)}
              onFocus={() => focusWindow(window.id)}
              zIndex={1000 + index}
              black={window.black}
              maximized={window.maximized}
            >
              <window.component />
            </DraggableWindow>
          ))}
      </div>
    </div>
  )
}
