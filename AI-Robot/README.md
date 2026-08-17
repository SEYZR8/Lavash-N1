# AURA — AI Robot Assistant

AURA is a modular AI assistant interface with a 3D humanoid robot, voice input/output, conversation memory, and a secure server-side AI gateway.

## Features
- 3D humanoid robot built with Three.js primitives
- Browser voice recognition and speech synthesis
- Animated eyes, head, chest and speaking state
- Chat UI with conversation history
- Server-side AI gateway; API keys never live in the browser
- Optional OpenAI-compatible endpoint configuration
- Responsive desktop/mobile interface
- Health endpoint for deployment checks

## Run
1. `npm install`
2. Copy `.env.example` to `.env` and configure an AI endpoint/key if desired.
3. `npm start`
4. Open `http://localhost:3000`

Without an AI key, AURA still runs in demo mode and answers with a local fallback. For production, configure an OpenAI-compatible API endpoint on the server.

## Architecture
`public/` is the client, `server.js` is the secure API gateway, and future modules can add vision, tools, long-term memory, authentication, and real robot hardware control without exposing provider secrets.
