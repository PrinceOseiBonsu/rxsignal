import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Database, FlaskConical } from "lucide-react";
import IntelligenceBrief from "@/components/IntelligenceBrief";
import MedicationTimeline from "@/components/MedicationTimeline";
import PriorityBadge from "@/components/PriorityBadge";
import SourceEvidence from "@/components/SourceEvidence";
import WhatChanged from "@/components/WhatChanged";
import { ApiError, getAlert, getHistory } from "@/lib/api";
import { alertHeadline, buildTimeline, formatDate, genericDisplay, isSyntheticAlert } from "@/lib/dashboard";
import type { TimelineEvent } from "@/types/medication";

export default async function MedicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let alert;
  try { alert = await getAlert(id); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); return <section className="page-state error-state"><Database size={32} aria-hidden="true" /><h1>Signal data is unavailable</h1><p>The backend could not load this persisted signal. No unverified evidence is shown.</p></section>; }
  let timeline: TimelineEvent[] = [];
  try { timeline = buildTimeline(await getHistory(alert.drug_key)); } catch { timeline = []; }
  const genericName = genericDisplay(alert);
  const synthetic = isSyntheticAlert(alert);
  return (
    <section className="medication-detail">
      <Link href="/dashboard#radar" className="detail-back"><ArrowLeft size={16} aria-hidden="true" /> Medication radar</Link>
      <header className="medication-heading"><p className="eyebrow">{synthetic ? "DEMO SCENARIO" : `VERIFIED SIGNAL #${alert.id}`}</p><h1>{alert.medication_name}</h1>{genericName && <p className="detail-generic">{genericName}</p>}</header>
      {synthetic && <div className="demo-detail-disclosure"><FlaskConical size={20} aria-hidden="true" /><div><strong>Synthetic demonstration</strong><p>Synthetic label change used to demonstrate the RxSignal workflow. Not an actual FDA update.</p></div></div>}
      <section className={`detail-alert ${alert.priority_level}`} aria-label="Signal overview"><div className="detail-alert-main"><div><PriorityBadge priority={alert.priority_level} /><h2>{alertHeadline(alert)}</h2><p>{alert.changed_fields.length} monitored {alert.changed_fields.length === 1 ? "section" : "sections"} changed. RxSignal established this signal deterministically.</p></div><div className="detail-priority"><span>REVIEW PRIORITY</span><strong>{alert.priority_score}<small>/100</small></strong><p>Deterministic score</p></div></div><dl className="detail-metadata"><div><dt><CalendarDays size={15} aria-hidden="true" /> Date detected</dt><dd><time dateTime={alert.detected_at}>{formatDate(alert.detected_at)}</time></dd></div><div><dt><Database size={15} aria-hidden="true" /> Evidence source</dt><dd>{alert.current_snapshot?.source.name ?? "Persisted label snapshots"}</dd></div></dl></section>
      <IntelligenceBrief alert={alert} />
      <WhatChanged changes={alert.changes} detectedAt={alert.detected_at} synthetic={synthetic} />
      <section className="detail-information"><p className="eyebrow">DETERMINISTIC SCORING</p><h2>Priority reasons</h2><ol>{alert.priority_reasons.map((reason) => <li key={reason}>{reason}</li>)}</ol></section>
      <SourceEvidence snapshot={alert.current_snapshot} />
      <MedicationTimeline key={alert.id} events={timeline} synthetic={synthetic} />
    </section>
  );
}
