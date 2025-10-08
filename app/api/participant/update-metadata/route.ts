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
    const result = await roomService.updateParticipant(roomName, participantIdentity, JSON.stringify(metadata))

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error updating participant metadata:", error)
    return NextResponse.json({ error: "Failed to update participant metadata" }, { status: 500 })
  }
}
