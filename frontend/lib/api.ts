import type {
  AlertSnapshotEvidence,
  AlertsResponse,
  FieldChange,
  HistoryResponse,
  IntelligenceBrief,
  MonitoredMedication,
  MonitoringResult,
  PriorityLevel,
  SignalAlert,
  SourceMetadata,
} from "@/types/medication";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function apiBaseUrl() {
  const configured =
    typeof window === "undefined"
      ? process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL
      : process.env.NEXT_PUBLIC_API_BASE_URL;
  return (configured ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(`Invalid API response field: ${field}.`, 502);
  }
  return value;
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  return requiredString(value, field);
}

function requiredNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiError(`Invalid API response field: ${field}.`, 502);
  }
  return value;
}

function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ApiError(`Invalid API response field: ${field}.`, 502);
  }
  return value;
}

function priorityLevel(value: unknown): PriorityLevel {
  if (value !== "low" && value !== "medium" && value !== "high") {
    throw new ApiError("Invalid API priority level.", 502);
  }
  return value;
}

function sourceMetadata(value: unknown): SourceMetadata {
  if (!isRecord(value)) throw new ApiError("Invalid API source metadata.", 502);
  return {
    name: requiredString(value.name, "source.name"),
    url: requiredString(value.url, "source.url"),
  };
}

function fieldChange(value: unknown): FieldChange {
  if (!isRecord(value)) throw new ApiError("Invalid API change evidence.", 502);
  const fields = [
    "indications_and_usage",
    "warnings",
    "boxed_warning",
    "contraindications",
    "adverse_reactions",
  ] as const;
  const types = ["added", "removed", "modified"] as const;
  if (!fields.includes(value.field as (typeof fields)[number])) {
    throw new ApiError("Invalid API changed field.", 502);
  }
  if (!types.includes(value.change_type as (typeof types)[number])) {
    throw new ApiError("Invalid API change type.", 502);
  }
  return {
    field: value.field as FieldChange["field"],
    change_type: value.change_type as FieldChange["change_type"],
    old_value: stringArray(value.old_value, "change.old_value"),
    new_value: stringArray(value.new_value, "change.new_value"),
  };
}

function snapshotEvidence(value: unknown): AlertSnapshotEvidence | null {
  if (value === null) return null;
  if (!isRecord(value)) throw new ApiError("Invalid API snapshot evidence.", 502);
  return {
    id: requiredNumber(value.id, "snapshot.id"),
    captured_at: requiredString(value.captured_at, "snapshot.captured_at"),
    effective_time: nullableString(value.effective_time, "snapshot.effective_time"),
    generic_name: stringArray(value.generic_name, "snapshot.generic_name"),
    brand_name: stringArray(value.brand_name, "snapshot.brand_name"),
    manufacturer: stringArray(value.manufacturer, "snapshot.manufacturer"),
    source: sourceMetadata(value.source),
  };
}

function signalAlert(value: unknown): SignalAlert {
  if (!isRecord(value)) throw new ApiError("Invalid API alert.", 502);
  if (!Array.isArray(value.changes) || !Array.isArray(value.changed_fields)) {
    throw new ApiError("Invalid API alert evidence.", 502);
  }
  const changes = value.changes.map(fieldChange);
  const validFields = new Set(changes.map((change) => change.field));
  if (value.changed_fields.some((field) => typeof field !== "string" || !validFields.has(field as FieldChange["field"]))) {
    throw new ApiError("Invalid API changed fields.", 502);
  }
  return {
    id: requiredNumber(value.id, "alert.id"),
    drug_key: requiredString(value.drug_key, "alert.drug_key"),
    medication_name: requiredString(value.medication_name, "alert.medication_name"),
    detected_at: requiredString(value.detected_at, "alert.detected_at"),
    previous_snapshot_id: value.previous_snapshot_id === null ? null : requiredNumber(value.previous_snapshot_id, "alert.previous_snapshot_id"),
    current_snapshot_id: value.current_snapshot_id === null ? null : requiredNumber(value.current_snapshot_id, "alert.current_snapshot_id"),
    changed_fields: value.changed_fields as FieldChange["field"][],
    changes,
    priority_score: requiredNumber(value.priority_score, "alert.priority_score"),
    priority_level: priorityLevel(value.priority_level),
    priority_reasons: stringArray(value.priority_reasons, "alert.priority_reasons"),
    previous_snapshot: snapshotEvidence(value.previous_snapshot),
    current_snapshot: snapshotEvidence(value.current_snapshot),
  };
}

function monitoredMedication(value: unknown): MonitoredMedication {
  if (!isRecord(value)) throw new ApiError("Invalid monitored medication.", 502);
  return {
    drug_key: requiredString(value.drug_key, "medication.drug_key"),
    medication_name: requiredString(value.medication_name, "medication.medication_name"),
    generic_name: stringArray(value.generic_name, "medication.generic_name"),
    brand_name: stringArray(value.brand_name, "medication.brand_name"),
    latest_snapshot_at: requiredString(value.latest_snapshot_at, "medication.latest_snapshot_at"),
    effective_time: nullableString(value.effective_time, "medication.effective_time"),
    source: sourceMetadata(value.source),
  };
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      cache: "no-store",
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("RxSignal API is unavailable.", 0);
  }
  if (!response.ok) {
    let detail = `RxSignal API returned HTTP ${response.status}.`;
    try {
      const payload: unknown = await response.json();
      if (isRecord(payload) && typeof payload.detail === "string") detail = payload.detail;
    } catch {
      // Keep the sanitized HTTP fallback.
    }
    throw new ApiError(detail, response.status);
  }
  try {
    return await response.json();
  } catch {
    throw new ApiError("RxSignal API returned invalid JSON.", 502);
  }
}

export async function getAlerts(): Promise<AlertsResponse> {
  const value = await requestJson("/api/alerts");
  if (!isRecord(value) || !Array.isArray(value.alerts) || !Array.isArray(value.monitored_medications)) {
    throw new ApiError("RxSignal API returned an invalid alert feed.", 502);
  }
  return {
    alerts: value.alerts.map(signalAlert),
    monitored_medications: value.monitored_medications.map(monitoredMedication),
    updated_at: nullableString(value.updated_at, "updated_at"),
  };
}

export async function getAlert(id: string | number): Promise<SignalAlert> {
  return signalAlert(await requestJson(`/api/alerts/${encodeURIComponent(id)}`));
}

export async function getHistory(drugKey: string): Promise<HistoryResponse> {
  const value = await requestJson(`/api/history/${encodeURIComponent(drugKey)}`);
  if (!isRecord(value) || !Array.isArray(value.snapshots) || !Array.isArray(value.signals)) {
    throw new ApiError("RxSignal API returned invalid history.", 502);
  }
  return value as unknown as HistoryResponse;
}

export async function generateIntelligence(alert: SignalAlert): Promise<IntelligenceBrief> {
  const value = await requestJson("/api/intelligence", {
    method: "POST",
    body: JSON.stringify({
      medication_name: alert.medication_name,
      changed_fields: alert.changed_fields,
      changes: alert.changes,
      priority_score: alert.priority_score,
      priority_level: alert.priority_level,
      priority_reasons: alert.priority_reasons,
      source_metadata: {
        ...(alert.current_snapshot?.source ?? {}),
        signal_id: alert.id,
        detected_at: alert.detected_at,
      },
    }),
  });
  if (!isRecord(value)) throw new ApiError("Invalid intelligence response.", 502);
  return {
    what_changed: requiredString(value.what_changed, "what_changed"),
    why_it_may_matter: requiredString(value.why_it_may_matter, "why_it_may_matter"),
    suggested_review: requiredString(value.suggested_review, "suggested_review"),
    evidence_summary: requiredString(value.evidence_summary, "evidence_summary"),
  };
}

export async function monitorMedication(drugName: string): Promise<MonitoringResult> {
  const value = await requestJson(`/api/monitor/${encodeURIComponent(drugName)}`, { method: "POST" });
  if (!isRecord(value)) throw new ApiError("Invalid monitoring response.", 502);
  return {
    drug_key: requiredString(value.drug_key, "monitor.drug_key"),
    baseline_created: Boolean(value.baseline_created),
    has_changes: Boolean(value.has_changes),
    message: requiredString(value.message, "monitor.message"),
  };
}
