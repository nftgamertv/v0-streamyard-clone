# Livekit AI Agent Setup

This project includes a Livekit AI agent that can join meeting rooms and interact with participants.

## Overview

The agent is a Node.js script that connects to Livekit rooms as a participant. It can:
- Join any room by name
- Receive and respond to messages from participants
- Send data messages to the room
- React to participant join/leave events

## Running the Agent Locally

### Prerequisites

1. Ensure all environment variables are set in `.env.local`:
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `NEXT_PUBLIC_LIVEKIT_URL`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

### Start the Agent

Run the agent with a specific room name:

\`\`\`bash
npm run agent -- --room <room-name>
\`\`\`

Example:
\`\`\`bash
npm run agent -- --room room-abc123
\`\`\`

The agent will:
1. Connect to the specified room
2. Appear as "AI Assistant" in the participant list
3. Send a welcome message when joining
4. Greet new participants as they join
5. Respond to data messages from participants

### Using the UI Button

1. Join a meeting room as the host
2. Click the "Add AI Agent" button in the header
3. Follow the instructions in the alert to run the agent script

## Production Deployment

For production, you have several options:

### Option 1: LiveKit Cloud Agent Deployment

Deploy your agent to LiveKit Cloud for automatic scaling and management:

1. Install the LiveKit CLI:
   \`\`\`bash
   brew install livekit-cli  # macOS
   \`\`\`

2. Authenticate with LiveKit Cloud:
   \`\`\`bash
   lk cloud auth
   \`\`\`

3. Deploy the agent:
   \`\`\`bash
   lk cloud deploy agent scripts/agent.mjs
   \`\`\`

### Option 2: Docker Container

Create a Dockerfile for your agent:

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY scripts/agent.mjs ./
CMD ["node", "agent.mjs", "--room", "${ROOM_NAME}"]
\`\`\`

Build and run:
\`\`\`bash
docker build -t livekit-agent .
docker run -e LIVEKIT_API_KEY=... -e LIVEKIT_API_SECRET=... -e NEXT_PUBLIC_LIVEKIT_URL=... -e ROOM_NAME=room-abc123 livekit-agent
\`\`\`

### Option 3: Serverless Function

Trigger the agent via a serverless function when rooms are created:

1. Create a webhook endpoint that receives room events
2. When a room is created, spawn the agent process
3. Use a service like AWS Lambda, Google Cloud Functions, or Vercel Functions

## Extending the Agent

The agent script (`scripts/agent.mjs`) can be extended with:

- **Voice AI**: Add STT/LLM/TTS pipeline for voice interactions
- **Video Processing**: Process video streams with AI models
- **Screen Sharing**: Share content programmatically
- **Custom Logic**: Add business logic, moderation, recording, etc.

For advanced AI capabilities, consider using the official Livekit Agents SDK:
- Python: https://docs.livekit.io/agents/
- Node.js: https://github.com/livekit/agents-js

## Troubleshooting

### Agent won't connect

- Verify environment variables are set correctly
- Check that the room name matches exactly
- Ensure your Livekit server URL is accessible

### Agent appears but doesn't respond

- Check the agent console logs for errors
- Verify data message format matches expected structure
- Ensure the agent has proper permissions (canPublish, canPublishData)

### Agent disconnects immediately

- Check for errors in the console output
- Verify your Livekit API credentials are valid
- Ensure the room exists before the agent tries to join
