import { RoomServiceClient } from "livekit-server-sdk"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantIdentity, metadata } = await req.json()

    console.log("[v0] ===== API UPDATE METADATA START =====")
    console.log("[v0] Room name:", roomName)
    console.log("[v0] Participant identity:", participantIdentity)
    console.log("[v0] Metadata to set:", metadata)

    if (!roomName || !participantIdentity || !metadata) {
      console.error("[v0] Missing required parameters")
      return NextResponse.json(
        { error: "Missing required parameters: roomName, participantIdentity, or metadata" },
        { status: 400 },
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error("[v0] Missing LiveKit credentials")
      return NextResponse.json({ error: "Server misconfigured. Missing Livekit credentials." }, { status: 500 })
    }

    console.log("[v0] Creating RoomServiceClient with URL:", wsUrl)
    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret)

    console.log("[v0] Calling roomService.updateParticipant...")
    const result = await roomService.updateParticipant(roomName, participantIdentity, JSON.stringify(metadata))
    console.log("[v0] updateParticipant result:", result)
    console.log("[v0] ===== API UPDATE METADATA END =====")

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("[v0] Error updating participant metadata:", error)
    return NextResponse.json({ error: "Failed to update participant metadata" }, { status: 500 })
  }
}
