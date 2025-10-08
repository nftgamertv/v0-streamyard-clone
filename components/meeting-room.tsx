"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LiveKitRoom, ParticipantTile, RoomAudioRenderer, ControlBar, useTracks } from "@livekit/components-react"
import { Track, type LocalParticipant, type RemoteParticipant } from "livekit-client"
import "@livekit/components-styles"
import { LIVEKIT_CONFIG } from "@/lib/livekit-config"
import { RoomHeader } from "./room-header"
import { BackroomPanel } from "./backroom-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface MeetingRoomProps {
  roomId: string
  participantName: string
  initialSettings: { video: boolean; audio: boolean }
}

type LayoutType = "grid" | "sidebar" | "spotlight"

function isOnStage(participant: LocalParticipant | RemoteParticipant): boolean {
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
  return metadata.onStage === true
}

function isHost(participant: LocalParticipant | RemoteParticipant): boolean {
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
  return metadata.isHost === true
}

function ConstrainedGridLayout() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  const stageTracks = tracks.filter((trackRef) => isOnStage(trackRef.participant))

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {stageTracks.map((trackRef) => (
            <div key={trackRef.participant.identity} className="aspect-video max-h-[400px]">
              <ParticipantTile trackRef={trackRef} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SidebarLayoutView() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  const stageTracks = tracks.filter((trackRef) => isOnStage(trackRef.participant))

  // Separate screen share tracks from camera tracks
  const screenShareTracks = stageTracks.filter((track) => track.source === Track.Source.ScreenShare)
  const cameraTracks = stageTracks.filter((track) => track.source === Track.Source.Camera)

  // If there's a screen share, show it as the main view with cameras in left sidebar
  if (screenShareTracks.length > 0) {
    return (
      <div className="flex h-full gap-4 p-4">
        {/* Left sidebar with participant cameras */}
        <div className="w-64 flex flex-col gap-3 overflow-y-auto">
          {cameraTracks.map((trackRef) => (
            <div key={trackRef.participant.identity} className="aspect-video flex-shrink-0">
              <ParticipantTile trackRef={trackRef} />
            </div>
          ))}
        </div>
        {/* Main view with screen share */}
        <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
          <div className="w-full h-full">
            <ParticipantTile trackRef={screenShareTracks[0]} />
          </div>
        </div>
      </div>
    )
  }

  // No screen share - show first camera as main view with others in left sidebar
  const mainTrack = cameraTracks[0]
  const sidebarTracks = cameraTracks.slice(1)

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Left sidebar with other participants */}
      {sidebarTracks.length > 0 && (
        <div className="w-64 flex flex-col gap-3 overflow-y-auto">
          {sidebarTracks.map((trackRef) => (
            <div key={trackRef.participant.identity} className="aspect-video flex-shrink-0">
              <ParticipantTile trackRef={trackRef} />
            </div>
          ))}
        </div>
      )}
      {/* Main view */}
      <div className="flex-1 flex items-center justify-center">
        {mainTrack && (
          <div className="w-full h-full max-w-5xl max-h-[800px]">
            <ParticipantTile trackRef={mainTrack} />
          </div>
        )}
      </div>
    </div>
  )
}

function SpotlightLayoutView() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  const stageTracks = tracks.filter((trackRef) => isOnStage(trackRef.participant))

  // Separate screen share tracks from camera tracks
  const screenShareTracks = stageTracks.filter((track) => track.source === Track.Source.ScreenShare)
  const cameraTracks = stageTracks.filter((track) => track.source === Track.Source.Camera)

  // Prioritize screen share as main view if available
  const mainTrack = screenShareTracks.length > 0 ? screenShareTracks[0] : cameraTracks[0]
  const carouselTracks = screenShareTracks.length > 0 ? cameraTracks : cameraTracks.slice(1)

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
        {mainTrack && (
          <div className="w-full h-full">
            <ParticipantTile trackRef={mainTrack} />
          </div>
        )}
      </div>
      {carouselTracks.length > 0 && (
        <div className="h-32 flex gap-4 overflow-x-auto pb-2">
          {carouselTracks.map((trackRef) => (
            <div key={trackRef.participant.identity} className="w-48 flex-shrink-0">
              <ParticipantTile trackRef={trackRef} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VideoConferenceLayout({
  layout,
  onLayoutChange,
}: { layout: LayoutType; onLayoutChange: (layout: LayoutType) => void }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  const hasScreenShare = tracks.some((track) => track.source === Track.Source.ScreenShare)

  // Automatically switch to sidebar layout when screen share is detected
  useEffect(() => {
    if (hasScreenShare && layout === "grid") {
      console.log("[v0] Screen share detected, switching to sidebar layout")
      onLayoutChange("sidebar")
    }
  }, [hasScreenShare, layout, onLayoutChange])

  switch (layout) {
    case "grid":
      return <ConstrainedGridLayout />
    case "sidebar":
      return <SidebarLayoutView />
    case "spotlight":
      return <SpotlightLayoutView />
    default:
      return <ConstrainedGridLayout />
  }
}

export function MeetingRoom({ roomId, participantName, initialSettings }: MeetingRoomProps) {
  const router = useRouter()
  const [token, setToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [layout, setLayout] = useState<LayoutType>("grid")
  const [isUserHost, setIsUserHost] = useState(false)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true)
        setError("")

        const checkHostResponse = await fetch(
          `${LIVEKIT_CONFIG.tokenEndpoint}?roomName=${encodeURIComponent(
            roomId,
          )}&participantName=${encodeURIComponent(participantName)}&checkHost=true`,
        )
        const hostData = await checkHostResponse.json()
        const isHost = hostData.isHost || false
        setIsUserHost(isHost)

        const response = await fetch(
          `${LIVEKIT_CONFIG.tokenEndpoint}?roomName=${encodeURIComponent(
            roomId,
          )}&participantName=${encodeURIComponent(participantName)}&isHost=${isHost}&onStage=${isHost}`,
        )

        if (!response.ok) {
          const errorData = await response.json()
          if (errorData.missing) {
            setMissingVars(errorData.missing)
          }
          throw new Error(errorData.error || "Failed to get access token")
        }

        const data = await response.json()
        setToken(data.token)
      } catch (err) {
        console.error("[v0] Error fetching token:", err)
        setError(err instanceof Error ? err.message : "Failed to connect to room")
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId && participantName) {
      fetchToken()
    }
  }, [roomId, participantName])

  const handleDisconnect = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Failed</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">{error}</p>
              {missingVars.length > 0 && (
                <div className="mt-4 p-3 bg-background/50 rounded-md">
                  <p className="font-semibold mb-2">Missing environment variables:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {missingVars.map((varName) => (
                      <li key={varName} className="font-mono text-sm">
                        {varName}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm">Please add these environment variables in your project settings:</p>
                  <div className="mt-2 p-2 bg-background rounded text-xs font-mono">
                    <div>LIVEKIT_API_KEY=your_api_key</div>
                    <div>LIVEKIT_API_SECRET=your_api_secret</div>
                    <div>NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud</div>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/")} className="w-full">
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <LiveKitRoom
        token={token}
        serverUrl={LIVEKIT_CONFIG.wsUrl}
        connect={true}
        video={initialSettings.video}
        audio={initialSettings.audio}
        onDisconnected={handleDisconnect}
        className="flex-1 flex flex-col"
      >
        <RoomHeader roomId={roomId} layout={layout} onLayoutChange={setLayout} />
        <div className="flex-1 overflow-hidden flex relative">
          <div className="flex-1 relative z-0 pointer-events-auto">
            <VideoConferenceLayout layout={layout} onLayoutChange={setLayout} />
          </div>
          {isUserHost && <BackroomPanel />}
        </div>
        <div className="border-t border-border/30 bg-background/95 backdrop-blur-sm relative z-40 pointer-events-auto">
          <ControlBar variation="verbose" />
        </div>
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
