"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

export default function TTYWindow() {
  const [history, setHistory] = useState<string[]>(["Desktop Terminal v1.0", "Type 'help' for available commands", ""])
  const [currentInput, setCurrentInput] = useState("")
  const [currentPath] = useState("~/Desktop")
  const terminalRef = useRef<HTMLDivElement>(null)

  const commands = {
    help: () => [
      "Available commands:",
      "  help     - Show this help message",
      "  clear    - Clear the terminal",
      "  date     - Show current date and time",
      "  echo     - Echo text back",
      "  ls       - List directory contents",
      "  pwd      - Show current directory",
      "",
    ],
    clear: () => {
      setHistory([])
      return []
    },
    date: () => [new Date().toString(), ""],
    ls: () => ["Applications/", "Documents/", "Downloads/", "Desktop/", ""],
    pwd: () => [currentPath, ""],
    echo: (args: string[]) => [args.join(" "), ""],
  }

  const executeCommand = (input: string) => {
    const [cmd, ...args] = input.trim().split(" ")
    const command = commands[cmd as keyof typeof commands]

    if (command) {
      const output = command(args)
      setHistory((prev) => [...prev, `${currentPath}$ ${input}`, ...output])
    } else if (cmd) {
      setHistory((prev) => [...prev, `${currentPath}$ ${input}`, `Command not found: ${cmd}`, ""])
    } else {
      setHistory((prev) => [...prev, `${currentPath}$ ${input}`])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentInput)
      setCurrentInput("")
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  return (
    <div className="w-full h-full bg-black text-green-400 font-mono text-sm p-4 overflow-hidden">
      <div
        ref={terminalRef}
        className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
      >
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        <div className="flex">
          <span className="text-yellow-400">{currentPath}$ </span>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-transparent border-none outline-none text-green-400 flex-1 ml-1"
            autoFocus
          />
          <span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  )
}
