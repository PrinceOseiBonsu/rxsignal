# rxsignal
An intelligent medication radar that helps healthcare professionals identify and understand important medication safety changes

## Repository structure

- `frontend/`: Next.js App Router, TypeScript, Tailwind CSS, Recharts, and Lucide React.
- `backend/`: Python backend.

Keep frontend and backend in this shared repository. Frontend foundation work is on
`frontend/setup`; open a pull request into `main` for review with Prince.

## Run the frontend

Install Node.js 20.9 or newer and npm. From the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C.
No environment variables or backend service are required for the Phase 1 preview.

## Checks

Run these inside `frontend/`:

```bash
npm run build
npm run typecheck
npm run lint
```

After a successful build, `npm start` runs the production app locally.

## Phase 1 preview

- `/`: project landing page.
- `/onboarding`: onboarding placeholder.
- `/dashboard`: interactive medication dashboard with three fictional alerts.
- `/medication/demo-medication-a`: shared mock alert details.
- Unknown medication IDs display the not-found page.

Shared fixtures belong in `frontend/data/mockData.ts`, with medication types in
`frontend/types/medication.ts`. The unused component files are intentionally
minimal placeholders for later phases. The demo contains no real medical data.

Next.js setup reference: https://nextjs.org/docs/app/getting-started/installation

## Phase 2 mock data

`frontend/data/mockData.ts` exports `alerts`, the shared source for dashboard and
medication detail pages. Each of the three fictional alerts has a unique ID,
drug and generic names, severity, a hand-assigned priority score (0–100), an ISO
date, headline, previous/new information, a handwritten AI-summary placeholder,
an intelligence brief with affected population, mock FDA attribution, and an
oldest-first timeline. `frontend/types/medication.ts` defines the required shape.

Severity values are `critical`, `high`, and `moderate`. Dates are stored as
`YYYY-MM-DD` for sorting; pages can format them for display later. All records
have `isMock: true`. No names, safety events, or FDA attributions are verified
medical facts; there are deliberately no fabricated FDA document links.
The dashboard chart derives daily counts from the same alerts.

## Phase 3 dashboard

The dashboard uses the existing teal RxSignal theme with a responsive header,
sidebar, physician profile, critical-update notification panel, and four summary
cards. Search and severity filters narrow the radar; alert links open medication
details. Sidebar links jump to the radar, watchlist, and recent update timeline.

Counts and chart points are calculated from the shared mock alerts. The reporting
week is the seven-day period ending on the newest mock alert (September 15, 2026),
not the current calendar week. The source indicator explicitly says Demo mode.

Backend review: `origin/backend-prince` at `1706ba5` exposes health, FDA drug
lookup, label comparison, and priority scoring APIs. It does not yet expose a
combined dashboard alert feed, watchlist, or physician profile. Phase 3 does not
require merging or running that branch. Live integration will need an agreed
alert response shape and source freshness information before showing Connected.

Validation: production build, lint, and TypeScript passed. Browser checks covered
search/filter reset, empty results, notifications, detail navigation, and layouts
at 1440, 1280, 768, and 390 pixels wide.

## Phase 4 medication radar

Each alert is one keyboard-accessible link to its medication detail page. Cards
show severity, drug and optional generic name, a short change headline, priority
score, update date, and a clearly marked mock FDA source. The headline serves as
the one-line summary; longer explanations stay on the detail page. Cards have
subtle hover feedback, a visible focus outline, and reduced-motion support.

## Phase 5 activity chart

Medication Signal Activity shows daily counts derived from the shared alerts,
including zero-signal days. Toggle 7 or 30 days; the window ends on the latest
mock alert. Totals and peak counts follow the selected window. Hover/tap tooltips,
keyboard chart navigation, and a data table provide ways to inspect values.

Future specialty push notifications and professional communities are recorded in
[ROADMAP.md](ROADMAP.md) for later implementation.
