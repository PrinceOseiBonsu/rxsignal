import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, FlaskConical, Info } from "lucide-react";
import PriorityBadge from "@/components/PriorityBadge";
import { alertHeadline, formatDate, genericDisplay, isSyntheticAlert } from "@/lib/dashboard";
import type { SignalAlert } from "@/types/medication";

export default function AlertCard({ alert }: { alert: SignalAlert }) {
  const genericName = genericDisplay(alert);
  const synthetic = isSyntheticAlert(alert);
  return (
    <article className={`alert-card ${alert.priority_level}${synthetic ? " synthetic" : ""}`}>
      <Link href={`/medication/${alert.id}`} className="alert-card-link" aria-labelledby={`alert-name-${alert.id} alert-action-${alert.id}`}>
        <div className="alert-top">
          {synthetic ? <span className="demo-tag"><FlaskConical size={13} aria-hidden="true" /> DEMO SCENARIO</span> : <span className="source-tag">FDA label evidence</span>}
          <PriorityBadge priority={alert.priority_level} />
        </div>
        <div className="alert-body">
          <span className="alert-emblem"><FileText size={27} aria-hidden="true" /></span>
          <div className="alert-copy">
            <h3 id={`alert-name-${alert.id}`}>{alert.medication_name}</h3>
            {genericName && genericName !== alert.medication_name && <p className="generic-name">{genericName}</p>}
            <p className="alert-headline">{alertHeadline(alert)}</p>
            <span className="alert-date"><CalendarDays size={13} aria-hidden="true" /><span>Detected <time dateTime={alert.detected_at}>{formatDate(alert.detected_at)}</time></span></span>
            <span className="alert-action" id={`alert-action-${alert.id}`}>Review change <ArrowRight size={17} aria-hidden="true" /></span>
          </div>
          <div className="priority-score"><span>Review priority</span><strong>{alert.priority_score}<small>/100</small></strong><div className="score-track" aria-hidden="true"><span style={{ width: `${alert.priority_score}%` }} /></div></div>
        </div>
        <div className="alert-footer">
          <Info size={14} aria-hidden="true" />
          <p>{synthetic ? "Synthetic demonstration. Not an actual FDA update." : alert.current_snapshot?.source.name ?? "Persisted label evidence"}</p>
        </div>
      </Link>
    </article>
  );
}
