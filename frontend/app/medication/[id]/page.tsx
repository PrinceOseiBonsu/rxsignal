import Link from "next/link";
import { ArrowLeft, CalendarDays, Database } from "lucide-react";
import IntelligenceBrief from "@/components/IntelligenceBrief";
import WhatChanged from "@/components/WhatChanged";
import PriorityBadge from "@/components/PriorityBadge";
import { formatDate } from "@/lib/dashboard";
import { notFound } from "next/navigation";
import { alerts, mockDataNotice } from "@/data/mockData";

export default async function MedicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const medication = alerts.find((item) => item.id === id);
  if (!medication) notFound();

  return (
    <section className="medication-detail">
      <Link href="/dashboard#radar" className="detail-back"><ArrowLeft size={16} aria-hidden="true" /> Medication Radar</Link>
      <header className="medication-heading">
        <p className="eyebrow">MEDICATION INTELLIGENCE</p>
        <h1>{medication.drugName}</h1>
        {medication.genericName && <p className="detail-generic">{medication.genericName}</p>}
      </header>
      <section className={`detail-alert ${medication.severity}`} aria-label="Alert overview">
        <div className="detail-alert-main">
          <div><PriorityBadge severity={medication.severity} /><h2>{medication.headline}</h2><p>{medication.intelligenceBrief.whatChanged}</p></div>
          <div className="detail-priority"><span>PRIORITY SCORE</span><strong>{medication.priorityScore}<small>/100</small></strong><p>Demo score</p></div>
        </div>
        <dl className="detail-metadata">
          <div><dt><CalendarDays size={15} aria-hidden="true" /> Date detected</dt><dd><time dateTime={medication.date}>{formatDate(medication.date)}</time></dd></div>
          <div><dt><Database size={15} aria-hidden="true" /> FDA source <span className="mock-tag">MOCK</span></dt><dd>{medication.source}</dd></div>
        </dl>
      </section>
      <p className="detail-demo-notice"><span className="mock-tag">DEMO</span>{mockDataNotice}</p>
      <WhatChanged alert={medication} />
      <IntelligenceBrief brief={medication.intelligenceBrief} />
      <section className="detail-information" aria-labelledby="detail-timeline-title">
      <h2 id="detail-timeline-title">Timeline (mock)</h2>
      <ol className="list-inside list-decimal space-y-2">
        {medication.timeline.map((event) => (
          <li key={event.date}>
            <time dateTime={event.date}>{formatDate(event.date)}</time> — {event.label} ({event.status})
          </li>
        ))}
      </ol>
      </section>
    </section>
  );
}
