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
- `/dashboard`: three fictional medication alerts and a Recharts setup preview.
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
The Phase 1 chart counts remain a separate fixture, not an alert-derived trend.
