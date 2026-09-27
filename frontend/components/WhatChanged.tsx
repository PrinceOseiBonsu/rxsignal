import { ArrowRight, CalendarDays, FileText, PlusCircle } from "lucide-react";
import { formatDate, formatField } from "@/lib/dashboard";
import type { FieldChange } from "@/types/medication";

function evidenceText(values: string[]) {
  return values.length ? values.join("\n\n") : "No text was present in this monitored section.";
}

export default function WhatChanged({ changes, detectedAt, synthetic = false }: { changes: FieldChange[]; detectedAt: string; synthetic?: boolean }) {
  return (
    <section className="change-comparison" aria-labelledby="what-changed-title">
      <div className="change-heading"><div><p className="eyebrow">{synthetic ? "SYNTHETIC TEST EVIDENCE" : "VERIFIED LABEL EVIDENCE"}</p><h2 id="what-changed-title">Before and after</h2></div><span className="change-date"><CalendarDays size={14} aria-hidden="true" />Detected <time dateTime={detectedAt}>{formatDate(detectedAt)}</time></span></div>
      <div className="change-list">{changes.map((change) => <article className="change-block" key={change.field}><div className="change-field-heading"><strong>{formatField(change.field)}</strong><span>{change.change_type}</span></div><div className="comparison-grid"><div className="comparison-card comparison-before"><h3><FileText size={17} aria-hidden="true" /><span>Previous information<small>BEFORE</small></span></h3><p>{evidenceText(change.old_value)}</p></div><div className="comparison-arrow" aria-hidden="true"><ArrowRight size={21} /></div><div className="comparison-card comparison-after"><h3><PlusCircle size={17} aria-hidden="true" /><span>Current information<small>NOW</small></span></h3><p>{evidenceText(change.new_value)}</p></div></div></article>)}</div>
      <p className="comparison-caption"><span aria-hidden="true" />{synthetic ? "This comparison uses persisted synthetic demonstration snapshots, not FDA evidence." : "This comparison is deterministic evidence from persisted FDA label snapshots."} AI does not establish whether a change occurred.</p>
    </section>
  );
}
