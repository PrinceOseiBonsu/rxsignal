import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import PriorityBadge from "@/components/PriorityBadge";
import { formatDate } from "@/lib/dashboard";
import type { MedicationAlert } from "@/types/medication";

export default function AlertCard({ alert }: { alert: MedicationAlert }) {
  return (
    <article className={`alert-card ${alert.severity}`}>
      <Link
        href={`/medication/${alert.id}`}
        className="alert-card-link"
        aria-labelledby={`alert-name-${alert.id} alert-action-${alert.id}`}
      >
        <div className="alert-top">
          <PriorityBadge severity={alert.severity} />
          <span className="alert-date">
            <CalendarDays size={13} aria-hidden="true" />
            <span>Updated <time dateTime={alert.date}>{formatDate(alert.date)}</time></span>
          </span>
        </div>
        <div className="alert-body">
          <div>
            <h3 id={`alert-name-${alert.id}`}>{alert.drugName}</h3>
            {alert.genericName && <p className="generic-name">{alert.genericName}</p>}
            <p className="alert-headline">{alert.headline}</p>
          </div>
          <div className="priority-score">
            <span>PRIORITY SCORE</span>
            <strong>{alert.priorityScore}<small>/100</small></strong>
            <div className="score-track" aria-hidden="true">
              <span style={{ width: `${alert.priorityScore}%` }} />
            </div>
          </div>
        </div>
        <div className="alert-footer">
          <span title={alert.source}>FDA source <span className="mock-tag">MOCK</span></span>
          <span className="alert-action" id={`alert-action-${alert.id}`}>
            View intelligence <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
