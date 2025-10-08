# Livekit Meeting Room

A production-ready video conferencing application built with Next.js and Livekit.

## Features

- HD video and audio conferencing
- Screen sharing capabilities
- Real-time participant management
- Secure token-based authentication
- Responsive design for all devices
- Dark theme optimized for professional use

## Setup

1. **Get Livekit Credentials**
   - Sign up at [https://cloud.livekit.io](https://cloud.livekit.io)
   - Create a new project
   - Copy your API Key, API Secret, and WebSocket URL

2. **Configure Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Livekit credentials:
     \`\`\`
     LIVEKIT_API_KEY=your_api_key_here
     LIVEKIT_API_SECRET=your_api_secret_here
     NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
     \`\`\`

3. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

4. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open Application**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Create a room or join an existing one

## Deployment

This app is ready to deploy to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables in Vercel project settings
4. Deploy

## Environment Variables

Required environment variables:

- `LIVEKIT_API_KEY` - Your Livekit API key (server-side only)
- `LIVEKIT_API_SECRET` - Your Livekit API secret (server-side only)
- `NEXT_PUBLIC_LIVEKIT_URL` - Your Livekit WebSocket URL (public)

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Livekit** - Real-time video infrastructure
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components

## Usage

### Creating a Room
1. Enter your name
2. Click "Create Room"
3. Share the Room ID with participants

### Joining a Room
1. Enter your name
2. Enter the Room ID
3. Click "Join Room"

### In-Meeting Controls
- Toggle camera on/off
- Toggle microphone on/off
- Share your screen
- View participant list
- Leave meeting

## Security

- All connections are encrypted
- Token-based authentication
- Server-side credential management
- No credentials exposed to client

## Support

For issues or questions:
- Livekit Documentation: [https://docs.livekit.io](https://docs.livekit.io)
- Livekit Community: [https://livekit.io/community](https://livekit.io/community)
