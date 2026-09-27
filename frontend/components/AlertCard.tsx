import Link from "next/link";
import { ArrowUpRight, CalendarDays, FlaskConical } from "lucide-react";
import PriorityBadge from "@/components/PriorityBadge";
import { alertHeadline, formatDate, genericDisplay, isSyntheticAlert } from "@/lib/dashboard";
import type { SignalAlert } from "@/types/medication";

export default function AlertCard({ alert }: { alert: SignalAlert }) {
  const genericName = genericDisplay(alert);
  const synthetic = isSyntheticAlert(alert);
  return (
    <article className={`alert-card ${alert.priority_level}`}>
      <Link href={`/medication/${alert.id}`} className="alert-card-link" aria-labelledby={`alert-name-${alert.id} alert-action-${alert.id}`}>
        {synthetic && <div className="demo-card-disclosure"><span><FlaskConical size={14} aria-hidden="true" /> DEMO SCENARIO</span><p>Synthetic label change used to demonstrate the RxSignal workflow. Not an actual FDA update.</p></div>}
        <div className="alert-top">
          <PriorityBadge priority={alert.priority_level} />
          <span className="alert-date"><CalendarDays size={13} aria-hidden="true" /><span>Detected <time dateTime={alert.detected_at}>{formatDate(alert.detected_at)}</time></span></span>
        </div>
        <div className="alert-body">
          <div>
            <h3 id={`alert-name-${alert.id}`}>{alert.medication_name}</h3>
            {genericName && <p className="generic-name">{genericName}</p>}
            <p className="alert-headline">{alertHeadline(alert)}</p>
          </div>
          <div className="priority-score"><span>REVIEW PRIORITY</span><strong>{alert.priority_score}<small>/100</small></strong><div className="score-track" aria-hidden="true"><span style={{ width: `${alert.priority_score}%` }} /></div></div>
        </div>
        <div className="alert-footer">
          <span title={alert.current_snapshot?.source.name}>{synthetic ? "RxSignal synthetic demonstration" : "FDA label evidence"}</span>
          <span className="alert-action" id={`alert-action-${alert.id}`}>Review change <ArrowUpRight size={16} aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  );
}
