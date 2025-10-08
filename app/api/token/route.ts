import { AccessToken } from "livekit-server-sdk"
import { type NextRequest, NextResponse } from "next/server"

const roomHosts = new Map<string, string>()

export async function GET(req: NextRequest) {
  try {
    const roomName = req.nextUrl.searchParams.get("roomName")
    const participantName = req.nextUrl.searchParams.get("participantName")
    const checkHost = req.nextUrl.searchParams.get("checkHost")
    const isHostParam = req.nextUrl.searchParams.get("isHost")
    const onStageParam = req.nextUrl.searchParams.get("onStage")

    if (checkHost === "true") {
      if (!roomName) {
        return NextResponse.json({ error: "Missing roomName parameter" }, { status: 400 })
      }

      const existingHost = roomHosts.get(roomName)
      const isHost = !existingHost

      if (isHost && participantName) {
        roomHosts.set(roomName, participantName)
      }

      return NextResponse.json({ isHost })
    }

    if (!roomName) {
      return NextResponse.json({ error: "Missing roomName parameter" }, { status: 400 })
    }

    if (!participantName) {
      return NextResponse.json({ error: "Missing participantName parameter" }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) {
      const missing = []
      if (!apiKey) missing.push("LIVEKIT_API_KEY")
      if (!apiSecret) missing.push("LIVEKIT_API_SECRET")
      if (!wsUrl) missing.push("NEXT_PUBLIC_LIVEKIT_URL")

      console.error("[v0] Missing environment variables:", missing.join(", "))
      return NextResponse.json(
        {
          error: "Server misconfigured. Missing Livekit credentials.",
          missing,
        },
        { status: 500 },
      )
    }

    const isHost = isHostParam === "true"
    const onStage = onStageParam === "true"
    const metadata = JSON.stringify({ isHost, onStage })

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
      metadata,
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    })

    const token = await at.toJwt()
    console.log("[v0] Token generated successfully for room:", roomName, "isHost:", isHost, "onStage:", onStage)

    return NextResponse.json({ token })
  } catch (error) {
    console.error("[v0] Error generating token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
