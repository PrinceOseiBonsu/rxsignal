import { CalendarDays, ExternalLink, FileText, Info, Landmark } from "lucide-react";
import { formatDate, isSyntheticSource } from "@/lib/dashboard";
import type { AlertSnapshotEvidence } from "@/types/medication";

const GENERIC_OPENFDA_URL = "https://api.fda.gov/drug/label.json";

function officialEvidenceUrl(snapshot: AlertSnapshotEvidence): string | null {
  if (!snapshot.source.url || snapshot.source.url === GENERIC_OPENFDA_URL) return null;
  try {
    const url = new URL(snapshot.source.url);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (url.hostname === "fda.gov" || url.hostname.endsWith(".fda.gov"))
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function effectiveDate(value: string | null) {
  if (!value) return null;
  return /^\d{8}$/.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : value;
}

export default function SourceEvidence({ snapshot }: { snapshot: AlertSnapshotEvidence | null }) {
  if (!snapshot) {
    return (
      <section className="source-evidence">
        <div className="evidence-heading">
          <span className="evidence-emblem"><Landmark size={23} aria-hidden="true" /></span>
          <div><p className="eyebrow">ORIGINAL SOURCE</p><h2>Source evidence</h2></div>
        </div>
        <p className="evidence-note"><Info size={15} aria-hidden="true" />Snapshot source metadata is not available for this persisted signal.</p>
      </section>
    );
  }

  const synthetic = isSyntheticSource(snapshot.source);
  const url = synthetic ? null : officialEvidenceUrl(snapshot);
  const labelDate = effectiveDate(snapshot.effective_time);

  return (
    <section className={`source-evidence${synthetic ? " synthetic" : ""}`} aria-labelledby="source-evidence-title">
      <div className="evidence-heading">
        <span className="evidence-emblem"><Landmark size={23} aria-hidden="true" /></span>
        <div><p className="eyebrow">{synthetic ? "DEMONSTRATION SOURCE" : "ORIGINAL SOURCE"}</p><h2 id="source-evidence-title">Source evidence</h2></div>
        <span className="evidence-status">{synthetic ? "Synthetic snapshot" : "Persisted FDA snapshot"}</span>
      </div>
      <p className="evidence-explanation">
        {synthetic
          ? "This evidence is fictional and exists only to demonstrate the deterministic RxSignal workflow. It is not an FDA record."
          : "FDA label information is the evidence. AI is used only to explain the verified change."}
      </p>
      <div className="evidence-record">
        <h3>{snapshot.source.name}</h3>
        <dl className="evidence-metadata">
          <div><dt><FileText size={14} aria-hidden="true" /> Source type</dt><dd>{synthetic ? "RxSignal synthetic demonstration" : "Normalized drug labeling record"}</dd></div>
          <div><dt><CalendarDays size={14} aria-hidden="true" /> Label effective date</dt><dd>{labelDate ? <time dateTime={labelDate}>{formatDate(labelDate)}</time> : "Not available"}</dd></div>
          <div><dt><CalendarDays size={14} aria-hidden="true" /> Snapshot captured</dt><dd><time dateTime={snapshot.captured_at}>{formatDate(snapshot.captured_at)}</time></dd></div>
        </dl>
        {url ? (
          <a className="evidence-link" href={url} target="_blank" rel="noopener noreferrer">View official evidence <ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        ) : (
          <button className="evidence-link" type="button" disabled aria-describedby="evidence-availability">{synthetic ? "No FDA source - synthetic scenario" : "Record-specific link unavailable"} <ExternalLink size={15} aria-hidden="true" /></button>
        )}
      </div>
      <p className="evidence-note" id="evidence-availability"><Info size={15} aria-hidden="true" />{synthetic ? "Synthetic demonstration only. Not an actual FDA update." : url ? "Review the original source before making clinical decisions." : "RxSignal retained the normalized FDA evidence, but a record-specific FDA document URL was not supplied."}</p>
    </section>
  );
}
