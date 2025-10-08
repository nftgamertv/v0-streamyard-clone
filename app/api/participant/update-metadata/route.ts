import { RoomServiceClient } from "livekit-server-sdk"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantIdentity, metadata } = await req.json()

    if (!roomName || !participantIdentity || !metadata) {
      return NextResponse.json(
        { error: "Missing required parameters: roomName, participantIdentity, or metadata" },
        { status: 400 },
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: "Server misconfigured. Missing Livekit credentials." }, { status: 500 })
    }

    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret)

    // Update participant metadata
    await roomService.updateParticipant(roomName, participantIdentity, JSON.stringify(metadata))

    console.log("[v0] Updated participant metadata:", { roomName, participantIdentity, metadata })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating participant metadata:", error)
    return NextResponse.json({ error: "Failed to update participant metadata" }, { status: 500 })
  }
}
