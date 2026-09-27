# RxSignal frontend API handoff — proposed v1

Prince: this is approximately the object the frontend expects from your API.
The canonical TypeScript definitions are in `frontend/types/medication.ts`.
`docs/medication-alerts.example.json` is a full example generated from our fixtures.
This is a proposal for agreement, not an endpoint that already exists.

## Proposed read endpoints

- `GET /api/alerts` → `MedicationAlertsResponse` (`alerts`, `updatedAt`).
- `GET /api/alerts/{id}` → one `MedicationAlert`; 404 for unknown IDs.
- Empty feed: 200 with `alerts: []`, not an error.
- Failed source/model service: a non-2xx response with `{ "detail": "..." }`.
  Do not replace a failed live request with mock data silently.
- `id` is a stable **alert/signal ID**, unique across the feed, not a drug name.
  Multiple alerts may refer to the same medication. The existing
  `/medication/[id]` page currently opens one alert using that ID.
- Return JSON with camelCase keys, or put an explicit adapter between FastAPI
  snake_case responses and these frontend types. Do not change backend services
  just to match display labels; an aggregation layer is sufficient.

## Required alert fields

| Field | Meaning |
| --- | --- |
| id | Stable, URL-safe alert ID |
| isMock | true for fictional fixtures; false only for actual source-backed alerts |
| drugName | Display brand/drug name |
| genericName | Optional generic display name; omit if unknown |
| severity | critical, high, or moderate; mapping requires agreement |
| priorityScore | Integer 0–100, calculated by backend |
| date | Detection date, YYYY-MM-DD in UTC |
| headline | Concise factual change headline |
| previousInformation / newInformation | Concise source-grounded before/after text |
| highlightedChange | Optional exact substring of newInformation; omit if unknown |
| intelligenceBrief | whatChanged, whyItMatters, whoMayBeAffected strings |
| source | Structured original source metadata described below |
| timeline | Array of date, status, label, description objects |

`aiSummary` is an optional legacy mock field, not required by the displayed brief.
All required strings should be nonempty. Empty timeline arrays are supported.
Timeline dates use YYYY-MM-DD; statuses are normal, update, warning. Events should
be oldest-first. Do not infer that a normal label guarantees clinical safety.

## Original source metadata

`source` contains `name`, `sourceType`, `publishedDate`, `url`, `isMock`.
`publishedDate` is YYYY-MM-DD or null; `url` is a record-specific HTTPS FDA URL or
null. The evidence panel disables its link for mock, missing, or non-FDA URLs.
URL host checks do not verify that a document supports an alert.

Do not substitute detection time, snapshot capture time, or label effective_time
for a publication date. Do not supply the generic openFDA endpoint as evidence
for a particular alert. source.isMock must match the parent alert's isMock.
`updatedAt` in the feed envelope is an ISO UTC timestamp or null, describing feed
refresh time, not publication time or the latest alert's detection date.

## Latest backend reviewed

Reviewed `origin/backend-prince` at `bb57dfa` (read-only; no merge performed).
Existing routes include health, drug lookup, compare, prioritize, monitor, history,
and intelligence. There is not yet an aggregate alert-list/detail route.

| Existing backend | Frontend contract / action needed |
| --- | --- |
| SignalRecord.id | Convert to stable string ID; preserve across refreshes |
| brand_name / generic_name arrays | Choose a display string; do not stringify an array accidentally |
| detected_at | UTC date for date; retain timestamp on backend |
| priority_score / score | priorityScore |
| low / medium / high | **Do not guess** a critical/high/moderate mapping; agree on classification |
| changes[].old_value / new_value | Source-grounded concise previousInformation/newInformation; account for multiple changed fields |
| what_changed | intelligenceBrief.whatChanged |
| why_it_may_matter | intelligenceBrief.whyItMatters |
| suggested_review / evidence_summary | No equivalent affected-population field; do not relabel either as whoMayBeAffected |
| source.name / source.url | Supply record-specific source metadata; current URL defaults to generic openFDA endpoint |
| effective_time | Not automatically publishedDate |
| snapshots/signals history | Build timeline events with agreed statuses and descriptions |

## Decisions to agree together before live integration

1. Severity mapping and treatment of low-priority/no-change results. A baseline
   snapshot or `has_changes: false` must not become a safety warning.
2. Source of affected-population text. If unavailable, use explicit wording such
   as "Not specified in the available source" rather than generating an assumption.
3. Whether aggregation returns a complete brief or uses a separate async request.
   The component has a loading skeleton, but the current alert contract requires
   completed brief fields. For asynchronous generation, agree on a tagged
   pending/ready/error response before wiring fetches.
4. Verified evidence URL and publication-date provenance.
5. Endpoint names, authentication (if any), and development origins. Current CORS
   permits localhost/127.0.0.1 on port 3000; temporary preview ports are not allowed.

## Integration boundary and remaining work

Phase 12 defines the contract; the UI still uses mockData directly. It is not yet
safe to swap in live responses without runtime validation and a data-access layer.
TypeScript alone does not validate HTTP JSON. Validate IDs, enum values, bounded
scores, actual calendar dates, nested fields, and nulls before rendering.

When connecting live data, pass a single loaded feed to dashboard, chart, and
notifications; replace every direct mock import together. Update mock badges,
AI provenance/disclaimers, the fixed demo reporting week, and freshness labels
from real metadata. Add loading, empty, and error states at the request boundary.
Use unique medication IDs for a live watchlist count rather than alert count or
name alone. Keep keys/service credentials on the backend. Do not call the mutating
monitor endpoint simply to render a page.

## Copy-ready message

Hi Prince — I've prepared the frontend response shape in
`frontend/types/medication.ts`, with a full example in
`docs/medication-alerts.example.json`. This is approximately the object my
frontend expects from your API. Could we agree on an aggregate alerts endpoint,
the low/medium/high → frontend severity mapping, affected-population text, and
record-specific FDA evidence metadata? Your Gemini field `why_it_may_matter`
maps to `whyItMatters`; `suggested_review` is different from `whoMayBeAffected`.
The full notes are in `docs/BACKEND_HANDOFF.md`. No need to replace your existing
services — an adapter/aggregate response can connect them to the UI.
