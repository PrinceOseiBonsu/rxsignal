export type Severity = "critical" | "high" | "moderate";
export type TimelineStatus = "normal" | "update" | "warning";

export interface TimelineEvent {
  /** ISO date (YYYY-MM-DD), so events can be sorted consistently. */
  date: string;
  status: TimelineStatus;
  label: string;
  description: string;
}

export interface SourceEvidence {
  name: string;
  sourceType: string;
  /** ISO publication date from the source, distinct from detection date. */
  publishedDate: string | null;
  /** A record-specific official URL; null until supplied by the backend. */
  url: string | null;
  isMock: boolean;
}

export interface MedicationAlert {
  id: string;
  isMock: boolean;
  drugName: string;
  genericName?: string;
  severity: Severity;
  /** Integer from 0 to 100. Backend owns scoring; mock scores are hand-assigned. */
  priorityScore: number;
  /** UTC detection date, YYYY-MM-DD; not the publication date. */
  date: string;
  headline: string;
  previousInformation: string;
  newInformation: string;
  /** Exact phrase in newInformation, editorially selected for the mock comparison. */
  highlightedChange?: string;
  /** Handwritten placeholder for a future AI-generated summary. */
  aiSummary?: string;
  intelligenceBrief: {
    whatChanged: string;
    whyItMatters: string;
    whoMayBeAffected: string;
  };
  source: SourceEvidence;
  timeline: TimelineEvent[];
}

/** Proposed aggregate API response; endpoint not implemented in the backend yet. */
export interface MedicationAlertsResponse {
  alerts: MedicationAlert[];
  /** UTC ISO timestamp for feed refresh, or null when unknown. */
  updatedAt: string | null;
}
