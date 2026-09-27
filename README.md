# QuickAI

QuickAI is a full-stack AI-powered SaaS application built with React, Node.js/Express, MongoDB/Prisma, Clerk authentication, and multiple AI service integrations (Gemini, ClipDrop, Cloudinary).

## Structure

- `/client`: Frontend application built with React, Tailwind CSS, & Vite.
- `/server`: Backend API built with Express, Clerk auth, and AI service controllers.

## Setup Instructions

### Backend (Server)
1. Navigate to `server`:
   ```bash
   cd server
   npm install
   ```
2. Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm run server
   ```

### Frontend (Client)
1. Navigate to `client`:
   ```bash
   cd client
   npm install
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
