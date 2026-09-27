import type { MedicationAlert } from "@/types/medication";

export const mockDataNotice =
  "Fictional development data: names, safety events, scores, summaries, and FDA attributions are invented. Not medical guidance.";

// All three alerts are fabricated UI fixtures, not reports about real products.
// Dates use YYYY-MM-DD; timeline entries are ordered oldest to newest.
// AI summaries are handwritten examples. No AI or FDA service is called.
export const alerts: MedicationAlert[] = [
  {
    id: "demo-medication-a",
    isMock: true,
    drugName: "Demo Medication A",
    genericName: "Fictional compound A",
    severity: "critical",
    priorityScore: 92,
    date: "2026-09-01",
    headline: "Mock boxed warning added",
    previousInformation:
      "The fictional label described routine monitoring and contained no boxed warning.",
    newInformation:
      "The fictional label now includes a boxed warning about a serious reaction during repeated treatment.",
    highlightedChange: "a boxed warning about a serious reaction during repeated treatment",
    aiSummary:
      "Mock AI summary: A new boxed warning raises the priority of this fictional alert, especially for people receiving repeated treatment.",
    intelligenceBrief: {
      whatChanged: "A boxed warning was added to the fictional label.",
      whyItMatters:
        "This demo represents a major safety change that should appear prominently in the interface.",
      whoMayBeAffected: "Fictional adult patients receiving repeated treatment courses.",
    },
    source: "U.S. Food and Drug Administration — mock attribution; no real FDA notice",
    evidence: {
      publisher: "U.S. Food & Drug Administration",
      sourceType: "Drug labeling update",
      publishedAt: null,
      url: null,
      isMock: true,
    },
    timeline: [
      { date: "2024-01-15", status: "normal", label: "Mock initial label", description: "Initial fictional label included routine monitoring, without a boxed warning." },
      { date: "2025-06-10", status: "update", label: "Mock monitoring update", description: "Fictional monitoring information was updated ahead of the later warning." },
      { date: "2026-09-01", status: "warning", label: "Mock boxed warning", description: "A fictional boxed warning was added for serious reactions during repeated treatment." },
    ],
  },
  {
    id: "demo-medication-b",
    isMock: true,
    drugName: "Demo Medication B",
    genericName: "Fictional compound B",
    severity: "high",
    priorityScore: 76,
    date: "2026-09-08",
    headline: "Mock interaction warning expanded",
    previousInformation:
      "The fictional label listed a general interaction precaution without naming a specific combination.",
    newInformation:
      "The fictional label adds a warning about use with Fictional Compound X and describes additional monitoring.",
    highlightedChange: "a warning about use with Fictional Compound X",
    aiSummary:
      "Mock AI summary: The interaction section now identifies a specific fictional combination, creating a high-priority review scenario.",
    intelligenceBrief: {
      whatChanged: "A specific interaction warning was added to the fictional label.",
      whyItMatters:
        "This demo lets the interface show an important safety update below the critical alert.",
      whoMayBeAffected: "Fictional patients also receiving Fictional Compound X.",
    },
    source: "U.S. Food and Drug Administration — mock attribution; no real FDA notice",
    evidence: {
      publisher: "U.S. Food & Drug Administration",
      sourceType: "Drug labeling update",
      publishedAt: null,
      url: null,
      isMock: true,
    },
    timeline: [
      { date: "2024-03-20", status: "normal", label: "Mock initial label", description: "Initial fictional label contained a general interaction precaution." },
      { date: "2025-11-12", status: "update", label: "Mock interaction review", description: "A fictional review examined the interaction wording." },
      { date: "2026-09-08", status: "warning", label: "Mock interaction warning", description: "A fictional warning now names the combination with Fictional Compound X." },
    ],
  },
  {
    id: "demo-medication-c",
    isMock: true,
    drugName: "Demo Medication C",
    genericName: "Fictional compound C",
    severity: "moderate",
    priorityScore: 48,
    date: "2026-09-15",
    headline: "Mock population guidance clarified",
    previousInformation:
      "The fictional label gave general follow-up information without a separate section for older adults.",
    newInformation:
      "The fictional label clarifies follow-up information for older adults without adding a boxed warning.",
    highlightedChange: "clarifies follow-up information for older adults",
    aiSummary:
      "Mock AI summary: Follow-up wording for a fictional population has been clarified, providing a moderate-priority example for the dashboard.",
    intelligenceBrief: {
      whatChanged: "Follow-up wording for older adults was clarified in the fictional label.",
      whyItMatters:
        "This demo provides a lower-priority label update for comparison and filtering.",
      whoMayBeAffected: "Fictional adults aged 65 and older receiving this demo medication.",
    },
    source: "U.S. Food and Drug Administration — mock attribution; no real FDA notice",
    evidence: {
      publisher: "U.S. Food & Drug Administration",
      sourceType: "Drug labeling update",
      publishedAt: null,
      url: null,
      isMock: true,
    },
    timeline: [
      { date: "2024-05-02", status: "normal", label: "Mock initial label", description: "Initial fictional label provided general follow-up information." },
      { date: "2025-08-18", status: "update", label: "Mock population review", description: "A fictional review considered follow-up wording for older adults." },
      { date: "2026-09-15", status: "update", label: "Mock guidance clarification", description: "Fictional follow-up guidance for adults aged 65 and older was clarified." },
    ],
  },
];
