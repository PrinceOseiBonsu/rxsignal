export type Severity = "critical" | "high" | "moderate";
export type TimelineStatus = "normal" | "update" | "warning";

export interface TimelineEvent {
  /** ISO date (YYYY-MM-DD), so events can be sorted consistently. */
  date: string;
  status: TimelineStatus;
  label: string;
}

export interface MedicationAlert {
  id: string;
  isMock: true;
  drugName: string;
  genericName?: string;
  severity: Severity;
  /** Hand-assigned demo score from 0 to 100; not a clinical calculation. */
  priorityScore: number;
  date: string;
  headline: string;
  previousInformation: string;
  newInformation: string;
  /** Handwritten placeholder for a future AI-generated summary. */
  aiSummary: string;
  intelligenceBrief: {
    whatChanged: string;
    whyItMatters: string;
    whoMayBeAffected: string;
  };
  /** Display-only mock attribution, not a verified FDA citation. */
  source: string;
  timeline: TimelineEvent[];
}
