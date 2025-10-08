export const LIVEKIT_CONFIG = {
  wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || "",
  tokenEndpoint: "/api/token",
}

export function validateLivekitConfig(): boolean {
  if (typeof window === "undefined") {
    return !!(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.NEXT_PUBLIC_LIVEKIT_URL)
  }
  return !!process.env.NEXT_PUBLIC_LIVEKIT_URL
}

export function generateRoomId(): string {
  return `room-${Math.random().toString(36).substring(2, 9)}`
}
