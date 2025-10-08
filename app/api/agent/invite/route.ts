import { type NextRequest, NextResponse } from "next"
import { AccessToken } from "livekit-server-sdk"

export async function POST(request: NextRequest) {
  try {
    const { roomName } = await request.json()

    if (!roomName) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error("[v0] Missing Livekit credentials for agent invite")
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    // Create a token for the agent
    const at = new AccessToken(apiKey, apiSecret, {
      identity: "ai-assistant",
      name: "AI Assistant",
      metadata: JSON.stringify({
        isAgent: true,
        onStage: true,
      }),
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await at.toJwt()

    // In production, you would trigger your agent service here
    // For now, we'll return the token and connection info
    return NextResponse.json({
      success: true,
      token,
      wsUrl,
      roomName,
      message: "Agent token generated. Deploy the agent script to connect.",
    })
  } catch (error) {
    console.error("[v0] Error inviting agent:", error)
    return NextResponse.json({ error: "Failed to invite agent" }, { status: 500 })
  }
}
