"use client"

import type React from "react"

import { ReactTogether } from "react-together"
import { usePathname } from "next/navigation"

export function ReactTogetherProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Extract room ID from pathname if we're in a room
  const roomMatch = pathname.match(/\/room\/([^/]+)/)
  const sessionId = roomMatch ? roomMatch[1] : "lobby"

  const appId = process.env.NEXT_PUBLIC_MULTISYNQ_APP_ID
  const apiKey = process.env.NEXT_PUBLIC_MULTISYNQ_API_KEY

  console.log("[v0] ReactTogether Config:", {
    appId: appId ? `${appId.substring(0, 10)}...` : "MISSING",
    apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING",
    sessionId,
  })

  if (!appId || !apiKey) {
    console.error("[v0] ReactTogether: Missing required environment variables!", {
      hasAppId: !!appId,
      hasApiKey: !!apiKey,
    })
    return <>{children}</>
  }

  return (
    <ReactTogether
      sessionParams={{
        apiKey: apiKey,
        appId: appId,
        name: sessionId,
        password: sessionId,
      }}
    >
      {children}
    </ReactTogether>
  )
}
