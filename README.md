# HackinTym'26 2.0 ⚡

> **Official 30-Hour Intra-College Hackathon Dashboard, Vintage Flip Timer, and Live Competition Leaderboard Engine.**

---

## 🌟 Overview

**HackinTym'26 2.0** is an interactive, real-time competition management platform built for college hackathons. It delivers an auditorium-ready experience with zero page reloads, a vintage mechanical split-card countdown timer, atomic multi-review scoring, and team profile customization.

---

## ✨ Key Features

### ⏱️ Vintage Split-Card Flip Timer
- **Single Divided Card Style**: Each unit (Hours, Minutes, Seconds) is rendered once as a single bold number, cleanly divided by a horizontal mechanical slit with side notch rivets.
- **Top-to-Bottom 3D Flip Motion**: Fluid animation folding down whenever the time ticks (`animate-flip-down`).
- **Miniature Dashboard Timer**: Sits unobtrusively in a compact bar at the top of the main screen (`/`), keeping the leaderboard front and center.
- **Vast Extended Stadium-Scale Projector Screen (`/timer`)**:
  - Fullscreen display tailored for auditorium projectors and hall monitors.
  - Giant `210px × 250px` flip digit cards with stage lighting.
  - Interactive 30-hour sprint progression timeline bar.
  - Built-in audio toggles and native browser fullscreen button.

### 🏆 Live Competition Leaderboard
- **Instant Real-Time Sync**: Scores and rank deltas update live across all connected screens.
- **Review Activation Logic**: Newly registered teams remain unranked (`—`) until Review 1 scores are entered. Once evaluated, ranks (1, 2, 3...) activate automatically.
- **Top 7 Podium Rankings**:
  - 🥇 **#1 Champion** (Gold gradient & badge)
  - 🥈 **#2 Runner-Up** (Silver styling)
  - 🥉 **#3 2nd Runner-Up** (Bronze styling)
  - 🌟 **#4–#7 Top 7 Podium** (Cyan accents)
- **Uncongested Columns**:
  - `Rank` • `Team Name & Category` • `Review 1` • `Review 2` • `Review 3` • `Points` • `Total Score`

### 👑 Team Details Card & Team Leader Designation
- Clicking any team row opens a dedicated team modal:
  - **👑 Team Leader**: The first member entered by organizers is given prominent recognition as the Team Leader.
  - **Roster**: Clearly separates the Team Leader and other members.
  - **Team Punchline / Tagline**: Displays the team's custom motto (*“Innovate. Elevate. Dominate.”*) in a quote banner.
  - **Score Breakdown**: Complete review breakdown (R1, R2, R3, bonus points, and gap to #1).

### 📷 Team Photo & Punchline Portal (`/portal` & `team-portal/`)
- **25-Team Card Grid**: Participating teams tap their team card from the grid to select it.
- **Profile Photo Upload**: Teams can upload a team logo, avatar, or group picture.
- **Punchline Customization**: Teams enter their custom motto/tagline.
- **Independent Vercel Deployment**: Includes a standalone `team-portal/` folder with its own `vercel.json` and static bundle so it can be hosted on a separate URL.

### ⚙️ Master Admin Control Panel (`/admin`)
- **3-Review Scoring Panel**: Tabbed grading interface for Review 1, Review 2, and Review 3 with bulk publishing to prevent premature leaks.
- **Timer Controls**: Start, pause, resume, reset, and adjust hackathon sprint duration.
- **Team Roster Management**: Add, edit, or delete teams and assign categories.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Library**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Typography**: Outfit, Plus Jakarta Sans, JetBrains Mono
- **Cloud Image Storage**: Cloudinary (with client-side canvas compression fallback)
- **Database**: Cloud Firestore with dual-channel local storage sync

---

## 📁 Project Structure

```text
HackInTime/
├── app/
│   ├── page.tsx                    # Main Leaderboard with Mini Flip Timer
│   ├── layout.tsx                  # Root layout & global fonts
│   ├── globals.css                 # Custom vintage flip clock & podium animations
│   ├── timer/
│   │   └── page.tsx                # Vast Extended Stadium Projector Timer Screen
│   ├── portal/
│   │   └── page.tsx                # Integrated Team Photo & Tagline Portal
│   ├── admin/
│   │   ├── page.tsx                # Master Admin Dashboard
│   │   └── login/page.tsx          # Secure Admin Authentication
│   └── not-found.tsx               # Custom 404 page
├── components/
│   ├── admin/                      # ReviewScoringPanel, TeamManagement, TimerControls, etc.
│   ├── dashboard/                  # CountdownTimer, MiniCountdownTimer, Leaderboard, TeamRow, etc.
│   └── layout/                     # Header, navigation, and audio controls
├── lib/
│   ├── cloudinary.ts               # Cloudinary upload utility with canvas compression fallback
│   ├── utils.ts                    # Time formatting, audio sound effects manager
│   └── firebase/                   # Firestore subscriptions, config, auth, and mock data
├── team-portal/                    # Standalone Hostable Team Portal
│   ├── index.html                  # Standalone SPA for photo & tagline uploads
│   ├── vercel.json                 # Vercel deployment configuration for portal
│   └── README.md                   # Independent deployment guide
├── .env.example                    # Template environment variables
├── .env.local                      # Local environment configuration
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** or **yarn** / **pnpm**

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Shweta-Venkatesan/Hack.git
cd HackInTime
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your credentials:

```env
# Database Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Default Admin Credentials
NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL=admin@hackintime.edu
NEXT_PUBLIC_DEFAULT_ADMIN_PASS=your_admin_password

# Cloudinary (Optional - For Photo Uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=hackintime
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Main Leaderboard**: `http://localhost:3000/`
- **Projector Timer**: `http://localhost:3000/timer`
- **Team Portal**: `http://localhost:3000/portal`
- **Admin Control**: `http://localhost:3000/admin`

---

## ☁️ Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy your **Cloud Name** from the dashboard.
3. Go to **Settings (⚙️) -> Upload -> Upload presets** and click **Add upload preset**.
4. Set **Signing Mode** to **Unsigned** and name it `hackintime`.
5. Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` to your environment variables.

---

## 🌐 Vercel Deployment

### Deployment A: Main Application
1. Import your repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `./`.
3. Add the environment variables from `.env.example` in **Project Settings -> Environment Variables**.
4. Click **Deploy**.

### Deployment B: Standalone Team Portal
1. In Vercel, click **Add New Project** and select the same repository.
2. Edit **Root Directory** to `team-portal`.
3. Framework preset will automatically detect as **Other** (Static HTML).
4. Click **Deploy** to give your teams an isolated upload URL.

---

## 📜 License

Created for **HackinTym'26 2.0**. All rights reserved.
