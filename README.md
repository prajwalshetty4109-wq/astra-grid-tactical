# CampusFix — AI-Powered University & Smart-Facility Infrastructure Operations Platform

> **PromptWars x ASTRA Hackathon Submission**
> Theme: *"From Complaints to Action — AI for Campus Impact: Capture, Understand, Reveal, Act"*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-17_Passing-22c55e)](./src/__tests__/civicEngine.test.ts)

---

## What is CampusFix?

CampusFix is an enterprise-grade, AI-powered facility management platform that transforms scattered campus complaints from students and staff into **prioritized, explainable, and trackable maintenance actions** — from first report to resolved ticket — in under 60 seconds per submission.

Built with **Google Gemini 2.5 Flash** multimodal AI, **Haversine spatial clustering**, and **explainable priority scoring**, CampusFix demonstrates the full 4-stage lifecycle mandated by the hackathon problem statement.

---

## The 4 Lifecycle Stages

### Stage 1 — Capture
Mobile-ready student intake form (`375px` to desktop). Students submit:
- A plain-English description of the facility issue
- An optional photo (upload or 1-click campus hazard preset)
- A category (`IT_INFRA`, `PLUMBING`, `ELECTRICAL`, `HVAC`, `SANITATION`, `FURNITURE`)
- A location via 6 campus building presets or a direct map click

### Stage 2 — Understand
Hybrid AI + Spatial triage pipeline:
- **Gemini 2.5 Flash** (`gemini-2.5-flash` via `@google/genai`) categorizes the report, generates a 1-sentence summary, and explains the priority score in plain English
- **Haversine Distance** (<250m threshold) + **Dice + Containment Token Similarity** detects likely duplicates across 6 campus synonym groups
- **Explainable Priority Score (0–100)** broken into 4 transparent factors:
  - Safety & Hazard Risk (0–40)
  - Academic & Facility Cascade Impact (0–25)
  - Duplicate Volume / Student Corroboration (0–20)
  - High-Occupancy Zone Sensitivity (0–15)

### Stage 3 — Reveal
Interactive campus map with:
- SVG isometric 3D campus blueprint with 6 building blocks
- Hotspot cluster detection (Haversine-based, 100m radius, 3+ reports)
- Real-time KPI ribbon: Total Reports / Active Clusters / CRITICAL Issues / Resolved
- Cluster Action Brief generation via Gemini AI (60-second maintenance summaries)

### Stage 4 — Act
Full dispatch workflow:
- Assign reports to 6 maintenance crew types (PLUMBING_OPS, ELECTRICAL_ENG, IT_HELPDESK, HVAC_TECH, SANITATION_CREW, FACILITY_GENERAL)
- 1-click duplicate merge with automatic priority boost
- Student-facing resolution tracker with live status timeline
- Supabase PostgreSQL persistence with in-memory fallback

---

## Synthetic Dataset — 36 Pre-Seeded Campus Reports

| Cluster | Building | Reports | Key Issues |
|---|---|---|---|
| Alpha | Science Block Wing B | 10 (CF-101 to CF-110) | Sparking lab outlets, HVAC coolant leak, drain blockage co-cluster |
| Beta | Central Library | 8 (CF-201 to CF-208) | Wi-Fi dead zones, water stain ceiling, chiller noise |
| Gamma | Student Dorms Block C | 7 (CF-301 to CF-307) | Plumbing burst, sanitation overflow, toilet flush failures |
| Scattered | Engineering Wing, Cafeteria, Admin | 11 (CF-401 to CF-603) | Projector failures, electrical panel issues, furniture damage |

**Deliberate duplicate clusters** are embedded across all groups (e.g., CF-101, CF-107, CF-109 all describe the same sparking outlet in Lab B-204 in different words).

---

## Explainable Priority Formula

```
PriorityScore = SafetyRisk (0–40) + CascadeImpact (0–25) + DuplicateVolume (0–20) + VulnerableZone (0–15)
```

| Factor | Max | Trigger Conditions |
|---|---|---|
| Safety & Hazard Risk | 40 | Sparking wires, water + electric, live voltage exposure |
| Academic Cascade Impact | 25 | Server room flooding, AV failure during exams, lab shutdown |
| Duplicate Volume | 20 | 1–2 dupes = 13 pts, 3–4 = 17 pts, 6+ = 20 pts |
| High-Occupancy Zone | 15 | Wet labs, library commons, main dorms, dining halls |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (Pages Router) |
| AI | Google Gemini 2.5 Flash via `@google/genai` v2.32.0 |
| Database | Supabase PostgreSQL + graceful in-memory fallback |
| Validation | Zod (strict schema on all API inputs) |
| Styling | Tailwind CSS v3 (monochrome: #000000 / #FFFFFF / #737373) |
| Fonts | Inter (body) + JetBrains Mono (IDs, scores, timestamps) |
| Testing | Jest 29 + ts-jest (17 unit tests) |
| Deployment | Vercel (zero-config Next.js) |

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/prajwalshetty4109-wq/astra-grid-tactical.git
cd astra-grid-tactical
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your-google-gemini-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Note:** Supabase is optional — CampusFix auto-falls back to an in-memory store with all 36 pre-seeded reports.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Run Tests

```bash
npm test
```

Expected output: **17 passed, 17 total**

### 5. Production Build

```bash
npm run build
npm start
```

---

## 5-Minute Judge Demo Walkthrough

**Recommended demo ticket: `CF-104`** — Sparking 220V outlet submerged in Lab B-204 floodwater (CRITICAL priority)

1. **[Dashboard — Stage 3 Reveal]** Open `http://localhost:3000` → Observe KPI ribbon (36 reports, 3 clusters, 4 CRITICAL) → Click on **HOTSPOT-1** (Science Block) cluster panel
2. **[Gemini AI Brief — Stage 4 Act]** Click **"Generate AI Maintenance Brief"** on HOTSPOT-1 → Watch 60-second Gemini brief appear with ranked actions for ELECTRICAL_ENG + HVAC_TECH
3. **[Triage Queue — Stage 2 Understand]** Scroll to Triage Queue → Click **"CF-104"** → Observe 4-factor priority breakdown (Score: 97 CRITICAL) and Gemini AI summary
4. **[Duplicate Detection — Stage 2 Understand]** Open `CF-107` → Observe "Likely Duplicate" badge linking to `CF-104` (same lab, same outlet, 85% similarity) → Click **"Merge Duplicate"**
5. **[Submit Report — Stage 1 Capture]** Navigate to `/report` → Submit a new report using the **"Sparking Lab Outlet"** photo preset for Science Block → Observe AI triage result and new ticket ID
6. **[Resolution Tracker — Stage 4 Act]** Navigate to `/track` → Enter `CF-104` → Observe live status timeline from `SUBMITTED` → `AI_TRIAGED` → `DISPATCHED`

---

## Supabase Schema

```sql
-- Run this in Supabase SQL editor to initialize persistence
-- (CampusFix auto-seeds with 36 reports on first API call if table is empty)
CREATE TABLE IF NOT EXISTS civic_reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  priority_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  priority_label TEXT NOT NULL DEFAULT 'UNKNOWN',
  priority_factors JSONB NOT NULL DEFAULT '{}',
  ai_summary TEXT,
  ai_reasoning TEXT,
  assigned_department TEXT,
  dispatch_notes TEXT,
  duplicate_of_id TEXT,
  duplicate_count INTEGER NOT NULL DEFAULT 1,
  duplicate_similarity NUMERIC(5,4) NOT NULL DEFAULT 0,
  image_base64 TEXT,
  reporter_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_civic_reports_status ON civic_reports(status);
CREATE INDEX IF NOT EXISTS idx_civic_reports_priority ON civic_reports(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_civic_reports_created ON civic_reports(created_at DESC);
```

---

## Security & Performance

- **Security headers** set in `next.config.mjs` and `vercel.json`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`
- **Zod strict schema validation** on all API route inputs — no SQL injection vectors
- **Zero hardcoded secrets** — all keys in environment variables only
- **`useMemo` / `useCallback`** on all high-frequency map render functions
- **`aria-label` + `aria-live="polite"`** on all interactive controls for WCAG 2.1 AA compliance

---

## Project Structure

```
src/
├── __tests__/
│   └── civicEngine.test.ts        # 17 unit tests
├── components/
│   ├── CitizenCaptureForm.tsx     # Stage 1: Student intake
│   ├── ClusterActionBriefPanel.tsx # Stage 4: Gemini brief
│   ├── ExplainableTriageQueue.tsx  # Stage 2: Priority queue
│   ├── GeospatialHotspotMap.tsx    # Stage 3: Campus SVG map
│   ├── TacticalNavbar.tsx          # Navigation + demo bar
│   └── WorkflowDispatchModal.tsx   # Stage 4: Crew dispatch
├── lib/
│   ├── civicEngine.ts             # Haversine + similarity + priority engine
│   ├── gemini.ts                  # GoogleGenAI client factory
│   ├── reportStore.ts             # Supabase + in-memory dual-tier store
│   ├── supabase.ts                # Supabase client
│   ├── syntheticReports.ts        # 36 pre-seeded campus reports
│   └── validators.ts              # Zod schemas
├── pages/
│   ├── api/
│   │   ├── ai/action-brief.ts     # Gemini 60s maintenance brief
│   │   ├── health.ts              # Health check
│   │   └── reports/
│   │       ├── reset.ts           # Seed reset
│   │       ├── state.ts           # Fetch all reports
│   │       ├── submit.ts          # Submit + AI triage pipeline
│   │       └── workflow.ts        # Status + dispatch updates
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx                  # Stage 3 + 4: Command dashboard
│   ├── integrity.tsx              # AI methodology transparency
│   ├── report.tsx                 # Stage 1: Capture portal
│   └── track.tsx                  # Stage 4: Resolution tracker
└── styles/
    └── globals.css                # Black/white 3D CSS utilities
```

---

## License

MIT — Built for the PromptWars x ASTRA Hackathon 2024.
