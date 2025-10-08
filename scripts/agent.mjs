/**
 * Livekit AI Agent
 * 
 * This is a simple Livekit agent that joins a room and can interact with participants.
 * 
 * To run this agent:
 * 1. Install dependencies: npm install
 * 2. Set environment variables in .env.local:
 *    - LIVEKIT_API_KEY
 *    - LIVEKIT_API_SECRET
 *    - NEXT_PUBLIC_LIVEKIT_URL
 * 3. Run: npm run agent -- --room <room-name>
 * 
 * For production deployment, consider using:
 * - LiveKit Cloud Agent deployment
 * - Docker container with the agent script
 * - Serverless function triggered by room events
 */

import { Room, RoomEvent, RemoteParticipant } from 'livekit-client'
import { AccessToken } from 'livekit-server-sdk'

// Parse command line arguments
const args = process.argv.slice(2)
const roomNameIndex = args.indexOf('--room')
const roomName = roomNameIndex !== -1 ? args[roomNameIndex + 1] : null

if (!roomName) {
  console.error('Usage: npm run agent -- --room <room-name>')
  process.exit(1)
}

// Load environment variables
const apiKey = process.env.LIVEKIT_API_KEY
const apiSecret = process.env.LIVEKIT_API_SECRET
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

if (!apiKey || !apiSecret || !wsUrl) {
  console.error('Missing required environment variables:')
  console.error('- LIVEKIT_API_KEY')
  console.error('- LIVEKIT_API_SECRET')
  console.error('- NEXT_PUBLIC_LIVEKIT_URL')
  process.exit(1)
}

console.log(`[Agent] Starting AI Assistant for room: ${roomName}`)

// Create access token for the agent
const at = new AccessToken(apiKey, apiSecret, {
  identity: 'ai-assistant',
  name: 'AI Assistant',
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

// Create and connect to room
const room = new Room()

room.on(RoomEvent.Connected, () => {
  console.log('[Agent] Connected to room:', roomName)
  console.log('[Agent] Participants:', room.remoteParticipants.size)
  
  // Send welcome message
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify({
    type: 'agent-message',
    message: 'AI Assistant has joined the room',
    timestamp: Date.now(),
  }))
  room.localParticipant.publishData(data, { reliable: true })
})

room.on(RoomEvent.ParticipantConnected, (participant) => {
  console.log('[Agent] Participant joined:', participant.identity)
  
  // Send greeting to new participant
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify({
    type: 'agent-message',
    message: `Welcome ${participant.name || participant.identity}!`,
    timestamp: Date.now(),
  }))
  room.localParticipant.publishData(data, { reliable: true })
})

room.on(RoomEvent.ParticipantDisconnected, (participant) => {
  console.log('[Agent] Participant left:', participant.identity)
})

room.on(RoomEvent.DataReceived, (payload, participant) => {
  const decoder = new TextDecoder()
  const data = decoder.decode(payload)
  
  try {
    const message = JSON.parse(data)
    console.log('[Agent] Received data:', message)
    
    // Respond to messages
    if (message.type === 'chat' && participant) {
      const encoder = new TextEncoder()
      const response = encoder.encode(JSON.stringify({
        type: 'agent-message',
        message: `I received your message: "${message.text}"`,
        timestamp: Date.now(),
      }))
      room.localParticipant.publishData(response, { reliable: true })
    }
  } catch (error) {
    console.error('[Agent] Error parsing data:', error)
  }
})

room.on(RoomEvent.Disconnected, () => {
  console.log('[Agent] Disconnected from room')
  process.exit(0)
})

// Connect to room
try {
  await room.connect(wsUrl, token)
} catch (error) {
  console.error('[Agent] Failed to connect:', error)
  process.exit(1)
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Agent] Shutting down...')
  await room.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n[Agent] Shutting down...')
  await room.disconnect()
  process.exit(0)
})
