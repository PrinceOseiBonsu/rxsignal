import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import PriorityBadge from "@/components/PriorityBadge";
import { formatDate } from "@/lib/dashboard";
import type { MedicationAlert } from "@/types/medication";

export default function AlertCard({ alert }: { alert: MedicationAlert }) {
  return (
    <article className={`alert-card ${alert.severity}`}>
      <div className="alert-top"><PriorityBadge severity={alert.severity} /><span className="alert-date"><CalendarDays size={13} aria-hidden="true" /><time dateTime={alert.date}>{formatDate(alert.date)}</time></span></div>
      <div className="alert-body"><div><h3>{alert.drugName}</h3><p className="generic-name">{alert.genericName}</p><p className="alert-headline">{alert.headline}</p></div><div className="priority-score"><span>PRIORITY SCORE</span><strong>{alert.priorityScore}<small>/100</small></strong><div className="score-track" aria-hidden="true"><span style={{ width: `${alert.priorityScore}%` }} /></div></div></div>
      <div className="alert-footer"><span>FDA label update <span className="mock-tag">MOCK</span></span><Link href={`/medication/${alert.id}`}>View intelligence <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </article>
  );
}
