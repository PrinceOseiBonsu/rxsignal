export type PriorityLevel = "low" | "medium" | "high";
export type MonitoredField =
  | "indications_and_usage"
  | "warnings"
  | "boxed_warning"
  | "contraindications"
  | "adverse_reactions";
export type ChangeType = "added" | "removed" | "modified";
export type TimelineStatus = "normal" | "update" | "warning";

export interface FieldChange {
  field: MonitoredField;
  change_type: ChangeType;
  old_value: string[];
  new_value: string[];
}

export interface SourceMetadata {
  name: string;
  url: string;
}

export interface AlertSnapshotEvidence {
  id: number;
  captured_at: string;
  effective_time: string | null;
  generic_name: string[];
  brand_name: string[];
  manufacturer: string[];
  source: SourceMetadata;
}

export interface SignalAlert {
  id: number;
  drug_key: string;
  medication_name: string;
  detected_at: string;
  previous_snapshot_id: number | null;
  current_snapshot_id: number | null;
  changed_fields: MonitoredField[];
  changes: FieldChange[];
  priority_score: number;
  priority_level: PriorityLevel;
  priority_reasons: string[];
  previous_snapshot: AlertSnapshotEvidence | null;
  current_snapshot: AlertSnapshotEvidence | null;
}

export interface MonitoredMedication {
  drug_key: string;
  medication_name: string;
  generic_name: string[];
  brand_name: string[];
  latest_snapshot_at: string;
  effective_time: string | null;
  source: SourceMetadata;
}

export interface AlertsResponse {
  alerts: SignalAlert[];
  monitored_medications: MonitoredMedication[];
  updated_at: string | null;
}

export interface DrugLabel {
  generic_name: string[];
  brand_name: string[];
  manufacturer: string[];
  indications_and_usage: string[];
  warnings: string[];
  boxed_warning: string[];
  contraindications: string[];
  adverse_reactions: string[];
  effective_time: string | null;
  source: SourceMetadata;
}

export interface SnapshotRecord {
  id: number;
  drug_key: string;
  label: DrugLabel;
  captured_at: string;
}

export interface SignalRecord {
  id: number;
  drug_key: string;
  previous_snapshot_id: number | null;
  current_snapshot_id: number | null;
  detected_at: string;
  changed_fields: MonitoredField[];
  changes: FieldChange[];
  priority_score: number;
  priority_level: PriorityLevel;
  priority_reasons: string[];
}

export interface HistoryResponse {
  drug_key: string;
  snapshot_count: number;
  signal_count: number;
  snapshot_order: string;
  snapshots: SnapshotRecord[];
  signals: SignalRecord[];
}

export interface IntelligenceBrief {
  what_changed: string;
  why_it_may_matter: string;
  suggested_review: string;
  evidence_summary: string;
}

export interface TimelineEvent {
  date: string;
  status: TimelineStatus;
  label: string;
  description: string;
}

export interface MonitoringResult {
  drug_key: string;
  baseline_created: boolean;
  has_changes: boolean;
  message: string;
}
