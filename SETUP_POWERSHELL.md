# Aligned — PowerShell Setup Guide

## Prerequisites

Before running the app, ensure you have the following installed on your Windows machine:

1. **Node.js 22+** — Download from [https://nodejs.org](https://nodejs.org)
2. **pnpm** — Install via PowerShell after Node.js is installed:
   ```powershell
   npm install -g pnpm
   ```

## Quick Start (PowerShell)

1. **Extract the zip** to your desired location:
   ```powershell
   Expand-Archive -Path "aligned-recreation.zip" -DestinationPath "C:\Projects\aligned-recreation"
   cd C:\Projects\aligned-recreation
   ```

2. **Install dependencies:**
   ```powershell
   pnpm install
   ```

3. **Set up environment variables.** Create a `.env` file in the project root:
   ```powershell
   New-Item -Path ".env" -ItemType File
   ```
   Then open it in your editor and add the required variables (see **Environment Variables** below).

4. **Push the database schema** (if using a database):
   ```powershell
   pnpm db:push
   ```

5. **Start the development server:**
   ```powershell
   pnpm dev
   ```
   The app will be available at `http://localhost:3000` (or the next available port).

6. **Build for production:**
   ```powershell
   pnpm build
   pnpm start
   ```

## Environment Variables

Create a `.env` file in the project root with these variables:

```env
# Database (MySQL/TiDB connection string)
DATABASE_URL=mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}

# Authentication
JWT_SECRET=your-jwt-secret-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://your-oauth-server
VITE_OAUTH_PORTAL_URL=https://your-oauth-portal

# Owner info
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=your-name

# Built-in API (LLM, Storage, etc.)
BUILT_IN_FORGE_API_URL=https://your-forge-api-url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
VITE_FRONTEND_FORGE_API_URL=https://your-frontend-forge-url

# App branding
VITE_APP_TITLE=Aligned
VITE_APP_LOGO=/aligned-logo-v2.png
```

> **Note:** The app was built on the Manus platform which provides these services automatically. To run independently, you will need to provide your own MySQL database, OAuth provider, and S3-compatible storage. The core motion analysis features (pose detection, coaching) work entirely client-side and do not require these backend services.

## Project Structure

```
aligned-recreation/
├── client/                  # Frontend (React 19 + Tailwind 4)
│   ├── public/              # Static assets (images, logos)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Hologram3D.tsx         # 3D hologram visualization
│   │   │   ├── LiveCoachingOverlay.tsx # Phase-aware live coaching
│   │   │   ├── VoiceCommandOverlay.tsx # Voice-activated controls
│   │   │   ├── AudioSettingsModal.tsx  # Audio/voice settings
│   │   │   └── DashboardLayout.tsx    # Dashboard layout
│   │   ├── contexts/        # React contexts (Audio, Theme)
│   │   ├── data/            # Motion data & coaching cues
│   │   │   ├── coachingCues.ts        # Sports-science coaching cues
│   │   │   ├── phaseCoaching.ts       # Phase-aware coaching system
│   │   │   └── professionalReferences.ts # Pro motion references
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities (tRPC client, motion data)
│   │   ├── pages/           # Page components
│   │   │   ├── Home.tsx               # Landing page
│   │   │   ├── Analysis.tsx           # Motion capture & analysis
│   │   │   ├── Replay.tsx             # Session replay & export
│   │   │   ├── Categories.tsx         # Motion category browser
│   │   │   ├── SessionHistory.tsx     # Past session history
│   │   │   ├── Community.tsx          # Community features
│   │   │   └── Pricing.tsx            # Pricing page
│   │   └── utils/           # Utility functions
│   │       ├── rotationCalculations.ts # Biomechanical calculations
│   │       ├── repDetection.ts        # Rep counting logic
│   │       └── professionalMotionGenerator.ts # Pro motion generation
│   └── index.html
├── server/                  # Backend (Express + tRPC)
│   ├── _core/               # Framework plumbing (auth, OAuth, etc.)
│   ├── db.ts                # Database query helpers
│   ├── routers.ts           # tRPC API procedures
│   ├── storage.ts           # S3 file storage helpers
│   └── *.test.ts            # Vitest test files
├── drizzle/                 # Database schema & migrations
│   └── schema.ts            # Table definitions
├── shared/                  # Shared types & constants
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Key Features

- **Real-time pose detection** using MediaPipe Pose (runs entirely in-browser)
- **3D hologram visualization** of professional reference motions (Three.js)
- **Phase-aware live coaching** — analyzes each rep and tells you which phase needs work
- **Sports-science coaching cues** — actionable feedback like "Tuck your elbow tight" instead of "Fix elbow angle"
- **Voice-activated controls** — say "Start" to begin capture
- **Multi-sport support** — Football, Golf, Kettlebell, Basketball, Baseball, Squat, Deadlift
- **Session replay & export** — replay your motion with side-by-side comparison
- **Cloud storage** — save sessions and export videos (requires backend services)

## Running Tests

```powershell
pnpm test
```

## Troubleshooting

- **Port conflict:** If port 3000 is busy, the dev server will automatically find the next available port.
- **Node version:** Ensure you're running Node.js 22 or later (`node --version`).
- **pnpm version:** The project uses pnpm 10.4.1+ (`pnpm --version`).
- **Camera access:** The motion analysis requires camera permissions in your browser.
- **HTTPS for camera:** Some browsers require HTTPS for camera access. Use `localhost` which is exempt, or set up a local SSL certificate.
