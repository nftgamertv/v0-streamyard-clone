"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Video, VideoOff, Mic, MicOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PreJoinScreenProps {
  onJoin: (settings: { video: boolean; audio: boolean; name: string }) => void
  initialName: string
}

export function PreJoinScreen({ onJoin, initialName }: PreJoinScreenProps) {
  const [participantName, setParticipantName] = useState(initialName === "Guest" ? "" : initialName)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("default")
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("default")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const initializeDevices = async () => {
      // Check if we're in the browser and mediaDevices API is available
      if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
        console.error("[v0] Media devices API not available")
        return
      }

      try {
        // Request permissions to access camera and microphone
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        // Now enumerate devices - they will have proper labels
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoInputs = devices.filter((device) => device.kind === "videoinput" && device.deviceId)
        const audioInputs = devices.filter((device) => device.kind === "audioinput" && device.deviceId)

        setVideoDevices(videoInputs)
        setAudioDevices(audioInputs)

        if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId)
        if (audioInputs.length > 0) setSelectedAudioDevice(audioInputs[0].deviceId)

        // Stop the permission stream, we'll create a new one with the selected device
        permissionStream.getTracks().forEach((track) => track.stop())
      } catch (error) {
        console.error("[v0] Error initializing devices:", error)
        // If permission denied, still try to enumerate (will show generic names)
        try {
          if (navigator?.mediaDevices?.enumerateDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const videoInputs = devices.filter((device) => device.kind === "videoinput")
            const audioInputs = devices.filter((device) => device.kind === "audioinput")
            setVideoDevices(videoInputs)
            setAudioDevices(audioInputs)
          }
        } catch (enumError) {
          console.error("[v0] Error enumerating devices:", enumError)
        }
      }
    }

    initializeDevices()
  }, [])

  useEffect(() => {
    // Get video stream for preview
    const getStream = async () => {
      // Check if we're in the browser and mediaDevices API is available
      if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
        return
      }

      if (!videoEnabled || !selectedVideoDevice || selectedVideoDevice === "default") {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
          setStream(null)
        }
        return
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedVideoDevice },
          audio: false,
        })

        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.error("[v0] Error getting video stream:", error)
      }
    }

    getStream()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoEnabled, selectedVideoDevice])

  const handleJoin = () => {
    const finalName = participantName.trim() || "Guest"
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    onJoin({ video: videoEnabled, audio: audioEnabled, name: finalName })
  }

  return (
    <div className="h-screen w-full gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Video Preview */}
        <div className="relative aspect-video bg-secondary/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/30 shadow-2xl mb-8">
          {videoEnabled && stream ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-secondary/50 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-border/30">
                  <VideoOff className="w-16 h-16 text-muted-foreground" />
                </div>
                <p className="text-lg text-muted-foreground font-medium">Camera is off</p>
              </div>
            </div>
          )}

          {/* Name overlay */}
          <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
            <p className="text-sm font-medium text-white">{participantName || "Guest"}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-8 border border-border/30 shadow-2xl relative z-10">
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Name</label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="bg-secondary/50 border-border/50 h-12 text-base"
              autoComplete="off"
              maxLength={50}
            />
          </div>

          {/* Device Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Video className="w-4 h-4" />
                Camera
              </label>
              <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                <SelectTrigger className="bg-secondary/50 border-border/50">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {videoDevices.map((device) => (
                    <SelectItem
                      key={device.deviceId}
                      value={device.deviceId || `device-${videoDevices.indexOf(device)}`}
                    >
                      {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Microphone
              </label>
              <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                <SelectTrigger className="bg-secondary/50 border-border/50">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {audioDevices.map((device) => (
                    <SelectItem
                      key={device.deviceId}
                      value={device.deviceId || `device-${audioDevices.indexOf(device)}`}
                    >
                      {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-3">
              <Button
                variant={videoEnabled ? "default" : "outline"}
                size="lg"
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`w-14 h-14 rounded-full transition-all duration-200 pointer-events-auto relative z-10 ${
                  videoEnabled
                    ? "bg-secondary hover:bg-secondary/80 text-foreground"
                    : "bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                }`}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                variant={audioEnabled ? "default" : "outline"}
                size="lg"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`w-14 h-14 rounded-full transition-all duration-200 pointer-events-auto relative z-10 ${
                  audioEnabled
                    ? "bg-secondary hover:bg-secondary/80 text-foreground"
                    : "bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                }`}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
            </div>

            <Button
              onClick={handleJoin}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 h-14 text-base font-semibold rounded-full shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 pointer-events-auto relative z-10"
            >
              Join Meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
