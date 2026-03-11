# RunTrack 🏃

> Modern running & walking tracker — Strava-inspired, beautifully dark, completely free.

## Features

- **GPS Tracking** — Real-time distance measurement via Haversine formula
- **Live Metrics** — Speed, pace, steps, calories updated in real-time  
- **Personalized** — Calorie calculation tailored to your weight/height
- **Activity History** — All runs/walks saved to Firebase Firestore
- **Stats & Charts** — 14-day trends with Recharts
- **Auth** — Google + Email/Password via Firebase Auth
- **Dark UI** — Glassmorphism, Framer Motion animations, Bebas Neue typography

## Tech Stack

- React 18 + TypeScript + Vite
- TailwindCSS (dark theme)
- Framer Motion (page transitions, micro-interactions)
- Zustand (state management)
- Firebase Auth + Firestore
- Recharts (analytics charts)
- Lucide React (icons)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

```bash
npm run build
# Push to GitHub, connect to Vercel
```

## Tracking Logic

- **Distance**: Haversine formula between GPS coordinates
- **Steps**: `distance / (height × 0.415)`
- **Calories**: `MET × weight(kg) × duration(hours)`
  - Running MET = 9.8 (≥7 km/h)
  - Walking MET = 3.8 (<7 km/h)
- **Speed**: GPS native speed or computed from position delta
