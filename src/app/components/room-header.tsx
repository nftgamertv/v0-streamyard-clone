"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Users, Grid3x3, Sidebar, Maximize2, Bot } from "lucide-react"
import { useParticipants } from "@livekit/components-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface RoomHeaderProps {
  roomId: string
  layout?: "grid" | "sidebar" | "spotlight"
  onLayoutChange?: (layout: "grid" | "sidebar" | "spotlight") => void
}

export function RoomHeader({ roomId, layout = "grid", onLayoutChange }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false)
  const [invitingAgent, setInvitingAgent] = useState(false)
  const participants = useParticipants()

  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${roomId}?name=Guest` : ""

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy invite link:", err)
    }
  }

  const inviteAgent = async () => {
    setInvitingAgent(true)
    try {
      const response = await fetch("/api/agent/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: roomId }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("[v0] Agent invitation sent:", data.message)
        // In production, this would trigger your deployed agent service
        alert("Agent token generated! To connect the agent, run:\nnpm run agent -- --room " + roomId)
      } else {
        console.error("[v0] Failed to invite agent:", data.error)
        alert("Failed to invite agent: " + data.error)
      }
    } catch (error) {
      console.error("[v0] Error inviting agent:", error)
      alert("Failed to invite agent")
    } finally {
      setInvitingAgent(false)
    }
  }

  return (
    <div className="w-full bg-card/80 backdrop-blur-sm border-b border-border relative z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={inviteAgent}
            disabled={invitingAgent}
            className="gap-2 bg-transparent border-primary/50 hover:bg-primary/10 pointer-events-auto relative z-10"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">{invitingAgent ? "Inviting..." : "Add AI Agent"}</span>
          </Button>

          {onLayoutChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent pointer-events-auto relative z-10">
                  {layout === "grid" && (
                    <>
                      <Grid3x3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Grid</span>
                    </>
                  )}
                  {layout === "sidebar" && (
                    <>
                      <Sidebar className="h-4 w-4" />
                      <span className="hidden sm:inline">Sidebar</span>
                    </>
                  )}
                  {layout === "spotlight" && (
                    <>
                      <Maximize2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Spotlight</span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-[60]">
                <DropdownMenuItem onClick={() => onLayoutChange("grid")} className="cursor-pointer">
                  <Grid3x3 className="mr-2 h-4 w-4" />
                  Grid Layout
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLayoutChange("sidebar")} className="cursor-pointer">
                  <Sidebar className="mr-2 h-4 w-4" />
                  Sidebar Layout
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLayoutChange("spotlight")} className="cursor-pointer">
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Spotlight Layout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg max-w-md">
            <span className="text-sm text-muted-foreground">Invite:</span>
            <code className="text-sm font-mono truncate">{inviteUrl}</code>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyInviteLink}
            className="border-border hover:bg-accent bg-transparent pointer-events-auto relative z-10"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
