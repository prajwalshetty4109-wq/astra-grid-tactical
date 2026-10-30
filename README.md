# ASTRA-Grid Tactical

**AI-Powered Civic Crisis, Hotspot Detection & Explainable Triage Command Center**  
*Built for the PromptWars x ASTRA Hackathon | Theme: From Complaints to Action — AI for Civic Impact: Capture, Understand, Reveal, Act*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gen AI](https://img.shields.io/badge/Google%20Gen%20AI-Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless%20Ready-000000?style=flat-square&logo=vercel)](https://vercel.com/)
[![Tested](https://img.shields.io/badge/Jest%20Tests-17%20Passed%20100%25-brightgreen?style=flat-square)](https://jestjs.io/)

---

## 1. Executive Summary & Problem Statement Alignment

Municipal complaint desks across fast-growing metropolitan centers are overwhelmed by unstructured, fragmented citizen reports. Everyday issues rarely occur in isolation: a clogged stormwater culvert traps monsoon runoff, floods pedestrian walkways, causes asphalt crater collapse, and submerges roadside electrical junction boxes. When triage engines treat these as 10 isolated complaints, municipal departments dispatch conflicting units or let life-critical hazards linger behind routine tickets.

**ASTRA-Grid Tactical** solves this crisis end-to-end through four synchronized lifecycle stages:

1. **STAGE 1 — CAPTURE (<60-Second Mobile Intake):** Rapid citizen mobile intake with interactive coordinate map pin-drop, sector landmark presets, and multimodal hazard photo upload.
2. **STAGE 2 — UNDERSTAND (Explainable AI Triage & Duplicate Linker):** Hybrid spatial-semantic triage engine utilizing Haversine distance, token Dice similarity, and Google Gemini 2.5 Flash (`@google/genai`) to generate 1-sentence summaries, detect duplicate complaint clusters within 250m, and assign an explainable 0–100 priority score broken down across 4 transparent factors.
3. **STAGE 3 — REVEAL (Interactive Geospatial Hotspot Radar & AI Briefs):** Tactical vector city radar identifying multi-issue geographic corridors and generating 60-second Executive Action Briefs that diagnose coupled root causes, ordered fix sequences, and lead department assignments.
4. **STAGE 4 — ACT (Operations Dispatch & Citizen Transparency):** Operations queue for municipal dispatchers to assign departments, record field crew logs, merge duplicate tickets, and power a real-time public citizen tracker with live resolution timelines.

---

## 2. Core Architecture & Hybrid AI Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STAGE 1: CAPTURE                                │
│   Citizen Web / Mobile Intake • Geolocation Pin • Hazard Photo Upload   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        STAGE 2: UNDERSTAND                             │
│   ┌─────────────────────────────────┐   ┌──────────────────────────┐   │
│   │   Deterministic Spatial Math    │   │  Token Similarity Engine │   │
│   │   Haversine Formula (<250m)     │   │  Dice + Civic Synonyms   │   │
│   └────────────────┬────────────────┘   └────────────┬─────────────┘   │
│                    └──────────────┬──────────────────┘                 │
│                                   │ Spatial & Duplicate Context        │
│                                   ▼                                    │
│             ┌──────────────────────────────────────────┐               │
│             │  Google Gemini 2.5 Flash (@google/genai) │               │
│             │  • Multimodal Hazard Inspection          │               │
│             │  • Executive Incident Summary            │               │
│             │  • Explainable 4-Factor Prioritization   │               │
│             │  • Duplicate Reasoning & Consolidation   │               │
│             └─────────────────────┬────────────────────┘               │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         STAGE 3: REVEAL                                │
│   • HTML5 / SVG Tactical City Radar with Coordinate Grids              │
│   • Multi-Hazard Hotspot Corridor Detection                            │
│   • Gemini 60-Second Executive Action Brief Generator                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          STAGE 4: ACT                                  │
│   • Operations Dispatch Console with Department Assignment             │
│   • Status Lifecycle: SUBMITTED ➔ AI_TRIAGED ➔ ASSIGNED ➔ IN_PROGRESS  │
│   • Public Citizen Timeline Tracker with SLA Telemetry                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Explainable Priority Formula (0 to 100)

Every complaint is scored by a transparent, multi-factor mathematical formula that ensures explainability and removes arbitrary black-box rankings:

$$\text{PriorityScore} = \text{SafetyRisk} + \text{CascadeImpact} + \text{DuplicateVolume} + \text{VulnerableZone}$$

| Factor | Range | Description & Weighting Logic |
| :--- | :---: | :--- |
| **Safety & Life Risk** | `0–40` | Immediate threat of injury or electrocution. Sparking wires in water = 39–40; highway fast-lane craters = 35–38; delayed waste collection = 8–12. |
| **Infrastructure Cascade** | `0–25` | Likelihood of triggering secondary cascading failures (e.g., clogged culvert causing flooding that submerges transformers and erodes asphalt). |
| **Duplicate Volume** | `0–20` | Independent citizen corroborations within 250m ($0\text{ dups}=6\text{ pts}, 1-2=13\text{ pts}, 3-4=17\text{ pts}, 6+=20\text{ pts}$). |
| **Vulnerable Zone Sensitivity** | `0–15` | Proximity to hospital emergency ambulance ramps, primary school drop-off gates, metro transit stations, and arterial flyovers. |

---

## 4. Pre-Seeded Synthetic Dataset (36 Realistic Reports)

The platform ships with a deterministic 36-report dataset modeling real urban challenges across 6 municipal sectors:

- **Cluster Alpha (Sector 1: MG Road Metro Corridor — 10 linked reports within 180m):**
  - 3 duplicate reports of a blocked stormwater culvert backing up sewage.
  - 3 duplicate reports of knee-deep waterlogging flooding the bus bay.
  - 2 reports of underwater asphalt crater collapse.
  - 2 top-critical reports of a sparking electrical feeder pillar submerged in floodwater.
- **Cluster Beta (Sector 2: Jayanagar Hospital & School Zone — 8 linked reports within 200m):**
  - 4 duplicate reports of commercial waste dumpsters overflowing across the hospital ambulance ramp.
  - 2 reports of black gutter overflow at the primary school gate.
  - 2 reports of streetlight blackout at the hospital zebra crossing.
- **Cluster Gamma (Sector 3: Hebbal Arterial Flyover — 7 linked reports within 220m):**
  - 4 duplicate reports of a 15cm crater in the 70km/h fast lane causing vehicle rollovers.
  - 2 reports of a pressurized underground water main blowout flooding the pylon base.
  - 1 report of a damaged steel central median barrier.
- **11 Scattered Routine & Medium Reports across Sectors 4, 5, and 6:**
  - Residential garbage truck delays, wobbling footpath tiles, flickering streetlamps, and tap pressure complaints demonstrating how the AI isolates urgent life hazards from everyday routine maintenance.

---

## 5. 5-Minute Evaluator Quick Demo Walkthrough

The application features a built-in interactive walkthrough bar at the top with 4 quick-jump buttons matching the 4 lifecycle stages:

1. **Step 1 (Capture):** Click **"STEP 1: CAPTURE"** to open `/report`. Click **"Auto-Fill Urgent Scenario"** to load the flood + sparking live wire scenario and submit in 15 seconds.
2. **Step 2 (Understand):** Observe the instant **AI Triage Receipt** displaying the `ELECTRICAL_HAZARD` category, duplicate detection linking to `AST-101`, and the **98/100 Critical Priority Score** with its 4-factor breakdown.
3. **Step 3 (Reveal):** Navigate to the **Tactical Deck (`/`)**. Click **"Sector 1: MG Road Metro"** on the radar map and trigger **"Generate 60s Executive Action Brief"** to see Gemini synthesize all 10 corroborating complaints into an immediate multi-department dispatch order.
4. **Step 4 (Act):** Click **"Assign & Dispatch"** to allocate `ELECTRICAL_GRID + STORM_DRAINAGE`, update status to `IN_PROGRESS`, and visit `/track?id=AST-109` to view the live citizen transparency timeline.

---

## 6. Limitations, Integrity & Honesty Note (Sections 7 & 8)

### What is Real
- **Live Google Gemini 2.5 Flash API:** Native server-side integration via `@google/genai` executing real-time multimodal intake, duplicate reasoning, and 60-second action briefs.
- **Real Mathematical Algorithms:** Pure Haversine spherical distance trigonometry, Dice coefficient token overlap, and deterministic multi-factor priority math verified by 17 unit tests.
- **Resilient Storage Architecture:** Full Supabase PostgreSQL schema with automatic zero-config fallback to the 36-report in-memory store so the app operates continuously on Vercel even if database keys are uninitialized.

### What is Mocked / Synthetic
- **36 Synthetic Citizen Complaints:** Generated realistic field reports capturing authentic Bengaluru municipal challenges.
- **Simulated Repair Unit GPS:** Vehicle icons and crew locations are modeled for demonstration (in production, connected to AVL fleet telematics).

### Where the AI Can Be Wrong (Failure Modes & Mitigations)
1. **Parallel Street Proximity False Positives:** Two complaints 80m apart may lie on parallel roads divided by an impassable railway wall.  
   *Mitigation:* The engine requires street name token validation and provides a 1-click human override to unmerge duplicate tickets.
2. **Citizen Language Exaggeration:** Users often write "the whole road has collapsed" when describing a 10cm pothole.  
   *Mitigation:* Multimodal image validation via Gemini Vision inspects uploaded photos to ground subjective text descriptions in physical reality.
3. **Night-Time Photo Ambiguity:** Grainy low-light imagery can confuse harmless puddles with black oil leaks.  
   *Mitigation:* Gemini reports confidence bounds and tags uncertain images for mandatory human inspection prior to dispatch.

### What We Would Build Next (Production Roadmap)
- Official municipal GIS cadastre boundary shapefile ingestion.
- Citizen WhatsApp and SMS two-way conversational intake bots.
- Edge vision processing on municipal bus dashcams for continuous road health scanning.
- Contractor invoice verification through before-and-after image diffing.

---

## 7. Setup & Local Development

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/astra-grid-tactical.git
cd astra-grid-tactical

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Configuration (`.env.local`)

```env
# Optional: Supabase PostgreSQL (falls back to memory store if unconfigured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Required for Live AI: Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

### Run Unit Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
npm run start
```

---

## 8. Deployment to Vercel

ASTRA-Grid Tactical is engineered for instant, zero-friction deployment to Vercel:

1. Push this repository to GitHub or GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Set `GEMINI_API_KEY` in the Vercel Environment Variables.
4. Deploy! `vercel.json` and `next.config.mjs` are pre-configured for optimal serverless execution.
