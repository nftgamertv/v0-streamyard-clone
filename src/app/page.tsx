"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Video, Users, Shield } from "lucide-react"
import { generateRoomId } from "@/lib/livekit-config"

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [roomId, setRoomId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const handleCreateRoom = () => {
    if (!name.trim()) {
      alert("Please enter your name")
      return
    }
    setIsCreating(true)
    const newRoomId = generateRoomId()
    router.push(`/room/${newRoomId}?name=${encodeURIComponent(name.trim())}`)
  }

  const handleJoinRoom = () => {
    if (!name.trim()) {
      alert("Please enter your name")
      return
    }
    if (!roomId.trim()) {
      alert("Please enter a room ID")
      return
    }
    setIsJoining(true)
    router.push(`/room/${roomId.trim()}?name=${encodeURIComponent(name.trim())}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-balance">Professional Video Meetings</h1>
          <p className="text-muted-foreground text-lg text-balance">
            Connect with your team in high-quality video conferences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Create New Room
              </CardTitle>
              <CardDescription>Start a new meeting and invite others to join</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Your Name</Label>
                <Input
                  id="create-name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                  className="bg-background border-border"
                  autoComplete="off"
                />
              </div>
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isCreating ? "Creating Room..." : "Create Room"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Join Existing Room
              </CardTitle>
              <CardDescription>Enter a room ID to join an ongoing meeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="join-name">Your Name</Label>
                <Input
                  id="join-name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-id">Room ID</Label>
                <Input
                  id="room-id"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  className="bg-background border-border"
                  autoComplete="off"
                />
              </div>
              <Button
                onClick={handleJoinRoom}
                disabled={isJoining}
                variant="outline"
                className="w-full border-border hover:bg-accent bg-transparent"
              >
                {isJoining ? "Joining Room..." : "Join Room"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">HD Video & Audio</h3>
              <p className="text-sm text-muted-foreground">Crystal clear video and audio quality powered by WebRTC</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Screen Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share your screen with participants for better collaboration
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">End-to-end encrypted connections for your privacy</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
