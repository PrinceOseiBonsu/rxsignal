# RxSignal frontend/backend integration

The frontend is connected to the FastAPI backend through `frontend/lib/api.ts`.
It uses persisted FDA label evidence and never silently substitutes fixture data.

## Read bridge

- `GET /api/alerts` returns persisted signals newest-first, monitored medication
  summaries, and the latest persisted timestamp.
- `GET /api/alerts/{id}` returns one signal by stable Tiger Data signal ID.
- `GET /api/history/{drug_name}` supplies snapshots and signals for the timeline.

Alert responses preserve backend `low`, `medium`, and `high` priority levels,
structured old/new values, deterministic priority reasons, timestamps, and
available snapshot source metadata. The read endpoints do not call Meta.

## Intelligence boundary

The detail page constructs `POST /api/intelligence` only from a persisted
signal's medication identity, changed fields, structured changes, deterministic
priority, priority reasons, and source metadata. The response contains:

- `what_changed`
- `why_it_may_matter`
- `suggested_review`
- `evidence_summary`

The AI explains verified evidence. ChangeDetector establishes the change and
PriorityEngine establishes review priority.

## Configuration

The frontend reads `API_BASE_URL` during server rendering and
`NEXT_PUBLIC_API_BASE_URL` in the browser. Both default to
`http://127.0.0.1:8000` for local development. Credentials remain backend-only.
