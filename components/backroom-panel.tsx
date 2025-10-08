"use client"

import { useParticipants, useRoomContext } from "@livekit/components-react"
import type { LocalParticipant, RemoteParticipant } from "livekit-client"
import { ParticipantEvent, RoomEvent } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, UserMinus } from "lucide-react"
import { useState, useEffect } from "react"

function isOnStage(participant: LocalParticipant | RemoteParticipant): boolean {
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
  return metadata.onStage === true
}

export function BackroomPanel() {
  const participants = useParticipants()
  const room = useRoomContext()
  const [isExpanded, setIsExpanded] = useState(true)
  const [updatingParticipants, setUpdatingParticipants] = useState<Set<string>>(new Set())
  const [metadataUpdateCounter, setMetadataUpdateCounter] = useState(0)

  useEffect(() => {
    const handleMetadataChanged = () => {
      setMetadataUpdateCounter((prev) => prev + 1)
    }

    room.remoteParticipants.forEach((participant) => {
      participant.on(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
    })

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      participant.on(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
    }

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected)

    return () => {
      room.remoteParticipants.forEach((participant) => {
        participant.off(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged)
      })
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected)
    }
  }, [room])

  const backroomParticipants = participants.filter((p) => !isOnStage(p))
  const stageParticipants = participants.filter((p) => isOnStage(p))

  const moveToStage = async (participant: RemoteParticipant) => {
    try {
      setUpdatingParticipants((prev) => new Set(prev).add(participant.identity))

      const currentMetadata = participant.metadata ? JSON.parse(participant.metadata) : {}
      const newMetadata = { ...currentMetadata, onStage: true }

      const response = await fetch("/api/participant/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: participant.identity,
          metadata: newMetadata,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update participant metadata")
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      setMetadataUpdateCounter((prev) => prev + 1)
    } catch (error) {
      console.error("Error moving participant to stage:", error)
    } finally {
      setUpdatingParticipants((prev) => {
        const next = new Set(prev)
        next.delete(participant.identity)
        return next
      })
    }
  }

  const moveToBackroom = async (participant: RemoteParticipant) => {
    try {
      setUpdatingParticipants((prev) => new Set(prev).add(participant.identity))

      const currentMetadata = participant.metadata ? JSON.parse(participant.metadata) : {}
      const newMetadata = { ...currentMetadata, onStage: false }

      const response = await fetch("/api/participant/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: participant.identity,
          metadata: newMetadata,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update participant metadata")
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      setMetadataUpdateCounter((prev) => prev + 1)
    } catch (error) {
      console.error("Error moving participant to backroom:", error)
    } finally {
      setUpdatingParticipants((prev) => {
        const next = new Set(prev)
        next.delete(participant.identity)
        return next
      })
    }
  }

  return (
    <div className="w-80 border-l border-border/30 bg-background/95 backdrop-blur-sm flex flex-col fixed right-0 top-0 bottom-0 z-[100] pointer-events-auto">
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Backstage</h3>
          <span className="text-xs bg-secondary px-2 py-1 rounded-full">{backroomParticipants.length}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "−" : "+"}
        </Button>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {stageParticipants.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">On Stage</h4>
              <div className="space-y-2">
                {stageParticipants
                  .filter((p) => p.identity !== room.localParticipant.identity)
                  .map((participant) => (
                    <div
                      key={participant.identity}
                      className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-semibold">{participant.name?.[0]?.toUpperCase() || "?"}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{participant.name || "Guest"}</p>
                          <p className="text-xs text-muted-foreground">Live on stage</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveToBackroom(participant as RemoteParticipant)}
                        disabled={updatingParticipants.has(participant.identity)}
                        className="gap-2 pointer-events-auto relative z-[110] hover:z-[120]"
                      >
                        <UserMinus className="w-4 h-4" />
                        {updatingParticipants.has(participant.identity) ? "..." : "Remove"}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {backroomParticipants.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Waiting</h4>
              <div className="space-y-2">
                {backroomParticipants.map((participant) => (
                  <div
                    key={participant.identity}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-semibold">{participant.name?.[0]?.toUpperCase() || "?"}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{participant.name || "Guest"}</p>
                        <p className="text-xs text-muted-foreground">Waiting to join</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => moveToStage(participant as RemoteParticipant)}
                      disabled={updatingParticipants.has(participant.identity)}
                      className="gap-2 pointer-events-auto relative z-[110] hover:z-[120]"
                    >
                      <UserPlus className="w-4 h-4" />
                      {updatingParticipants.has(participant.identity) ? "..." : "Add"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {backroomParticipants.length === 0 && stageParticipants.length <= 1 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No participants waiting</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
