"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useStateTogether } from "react-together"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  sender: string
  text: string
  timestamp: number
}

interface ChatPanelProps {
  participantName: string
  isHost?: boolean
}

export function ChatPanel({ participantName, isHost = false }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useStateTogether<ChatMessage[]>("chatMessages", [])
  const [inputValue, setInputValue] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevMessagesLength = useRef(messages.length)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Track unread messages
  useEffect(() => {
    if (!isOpen && messages.length > prevMessagesLength.current) {
      setUnreadCount((prev) => prev + (messages.length - prevMessagesLength.current))
    }
    prevMessagesLength.current = messages.length
  }, [messages.length, isOpen])

  // Clear unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  useEffect(() => {
    console.log("[v0] Chat messages updated:", messages.length, messages)
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      sender: participantName,
      text: inputValue.trim(),
      timestamp: Date.now(),
    }

    console.log("[v0] Sending message:", newMessage)
    setMessages([...messages, newMessage])
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <div className={cn("fixed bottom-24 z-[110]", isHost ? "right-[22rem]" : "right-6")}>
        <Button onClick={() => setIsOpen(!isOpen)} size="lg" className="h-14 w-14 rounded-full shadow-lg relative">
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-24 z-[110] w-96 h-[500px] bg-card border border-border rounded-lg shadow-2xl flex flex-col transition-all duration-300",
          isHost ? "right-[22rem]" : "right-6",
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Chat</h3>
            <span className="text-xs text-muted-foreground">({messages.length})</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender === participantName
                return (
                  <div
                    key={message.id}
                    className={cn("flex flex-col gap-1", isOwnMessage ? "items-end" : "items-start")}
                  >
                    <div className="text-xs text-muted-foreground px-1">{message.sender}</div>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 break-words",
                        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {message.text}
                    </div>
                    <div className="text-xs text-muted-foreground/60 px-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon" disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
