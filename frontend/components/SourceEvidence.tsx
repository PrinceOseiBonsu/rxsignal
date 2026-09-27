import { Landmark, ExternalLink, CalendarDays, FileText, Info } from "lucide-react";
import { formatDate } from "@/lib/dashboard";
import type { SourceEvidence as Evidence } from "@/types/medication";

// Only link to an official FDA host once an actual source record is provided.
export function officialEvidenceUrl(evidence: Evidence): string | null {
  if (evidence.isMock || !evidence.url) return null;
  try {
    const url = new URL(evidence.url);
    return url.protocol === "https:" && !url.username && !url.password &&
      (url.hostname === "fda.gov" || url.hostname.endsWith(".fda.gov"))
      ? url.href : null;
  } catch { return null; }
}

export default function SourceEvidence({ evidence }: { evidence: Evidence }) {
  const url = officialEvidenceUrl(evidence);
  return (
    <section className="source-evidence" aria-labelledby="source-evidence-title">
      <div className="evidence-heading"><span className="evidence-emblem"><Landmark size={23} aria-hidden="true" /></span><div><p className="eyebrow">ORIGINAL SOURCE</p><h2 id="source-evidence-title">Source Evidence</h2></div><span className="evidence-status">{evidence.isMock ? "Demo · not verified" : "Source reference"}</span></div>
      <p className="evidence-explanation">FDA information is the source. AI helps explain the change.</p>
      <div className="evidence-record">
        <h3>{evidence.name}</h3>
        <dl className="evidence-metadata">
          <div><dt><FileText size={14} aria-hidden="true" /> Source type</dt><dd>{evidence.sourceType}{evidence.isMock && " (mock)"}</dd></div>
          <div><dt><CalendarDays size={14} aria-hidden="true" /> Publication date</dt><dd>{evidence.publishedDate ? <><time dateTime={evidence.publishedDate}>{formatDate(evidence.publishedDate)}</time>{evidence.isMock && " (mock)"}</> : "Not available — awaiting source"}</dd></div>
        </dl>
        {url ? <a className="evidence-link" href={url} target="_blank" rel="noopener noreferrer">View Official Evidence <ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : <button className="evidence-link" type="button" disabled aria-describedby="evidence-availability">View Official Evidence <ExternalLink size={15} aria-hidden="true" /></button>}
      </div>
      <p className="evidence-note" id="evidence-availability"><Info size={15} aria-hidden="true" />{evidence.isMock ? "This fictional alert has no official FDA evidence attached. The link will be available when a matching source is connected." : url ? "Review the original source before making clinical decisions. The AI summary is an interpretation, not the source document." : "An official source link is not available yet. Review the original source before making clinical decisions."}</p>
    </section>
  );
}
