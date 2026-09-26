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
- `/dashboard`: fictional medication link and Recharts setup preview.
- `/medication/demo-medication`: dynamic medication detail placeholder.
- Unknown medication IDs display the not-found page.

Shared fixtures belong in `frontend/data/mockData.ts`, with medication types in
`frontend/types/medication.ts`. The unused component files are intentionally
minimal placeholders for later phases. The demo contains no real medical data.

Next.js setup reference: https://nextjs.org/docs/app/getting-started/installation
