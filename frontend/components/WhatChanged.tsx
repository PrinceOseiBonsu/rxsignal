import { ArrowRight, CalendarDays, FileText, PlusCircle } from "lucide-react";
import { formatDate } from "@/lib/dashboard";
import type { MedicationAlert } from "@/types/medication";

export default function WhatChanged({ alert }: { alert: MedicationAlert }) {
  const position = alert.highlightedChange ? alert.newInformation.indexOf(alert.highlightedChange) : -1;
  return (
    <section className="change-comparison" aria-labelledby="what-changed-title">
      <div className="change-heading">
        <div><p className="eyebrow">THE CHANGE AT A GLANCE</p><h2 id="what-changed-title">What changed?</h2></div>
        <span className="change-date"><CalendarDays size={14} aria-hidden="true" />Changed <time dateTime={alert.date}>{formatDate(alert.date)}</time></span>
      </div>
      <div className="comparison-grid">
        <article className="comparison-card comparison-before">
          <h3><FileText size={17} aria-hidden="true" /><span>Previous information<small>BEFORE</small></span></h3>
          <p>{alert.previousInformation}</p>
        </article>
        <div className="comparison-arrow" aria-hidden="true"><ArrowRight size={21} /></div>
        <article className="comparison-card comparison-after">
          <h3><PlusCircle size={17} aria-hidden="true" /><span>New information<small>NOW</small></span></h3>
          <p>{position < 0 ? alert.newInformation : <>
            {alert.newInformation.slice(0, position)}
            <mark>{alert.highlightedChange}</mark>
            {alert.newInformation.slice(position + alert.highlightedChange.length)}
          </>}</p>
          <span className="change-label">{alert.severity === "critical" ? "Major safety change" : alert.severity === "high" ? "Safety warning expanded" : "Guidance clarified"}</span>
        </article>
      </div>
      <p className="comparison-caption"><span aria-hidden="true" /> Highlighted wording identifies the change in this fictional example; not a verified FDA label comparison.</p>
    </section>
  );
}
