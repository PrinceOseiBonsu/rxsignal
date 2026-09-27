import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Database,
  Pill,
} from "lucide-react";
import MedicationRadar from "@/components/MedicationRadar";
import MonitorMedicationForm from "@/components/MonitorMedicationForm";
import SignalChart from "@/components/SignalChart";
import { getAlerts } from "@/lib/api";
import {
  alertHeadline,
  formatDate,
  getDashboardStats,
  isSyntheticSource,
} from "@/lib/dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string | string[] }>;
}) {
  const { specialty } = await searchParams;
  const selectedSpecialty =
    typeof specialty === "string" &&
    ["Cardiology", "Oncology", "Emergency Medicine", "Internal Medicine", "Other"].includes(specialty)
      ? specialty
      : null;

  let feed;
  try {
    feed = await getAlerts();
  } catch {
    return (
      <section className="page-state error-state">
        <Database size={32} aria-hidden="true" />
        <p className="eyebrow">BACKEND CONNECTION</p>
        <h1>Live medication intelligence is unavailable</h1>
        <p>RxSignal could not reach the backend. No unverified data is shown.</p>
      </section>
    );
  }

  const stats = getDashboardStats(feed);
  const cards = [
    { label: "Active signals", value: stats.active, note: "Persisted changes", icon: Activity, style: "teal" },
    { label: "High priority", value: stats.high, note: "Requires review", icon: AlertTriangle, style: "red" },
    { label: "Medications monitored", value: stats.monitored, note: "FDA baselines saved", icon: Pill, style: "teal" },
    { label: "Updates this week", value: stats.updatesThisWeek, note: "Detected in 7 days", icon: CalendarDays, style: "blue" },
  ];

  return (
    <div className="dashboard">
      <header className="page-heading dashboard-hero">
        <div>
          <p className="eyebrow">MEDICATION LABEL INTELLIGENCE</p>
          <h1>Never miss what changed<span className="greeting-dot">.</span></h1>
          <p>Monitor medications for FDA labeling changes. RxSignal detects what changed, prioritizes it, and gives you the evidence to review.</p>
          {selectedSpecialty && <p className="dashboard-specialty">Review lens: {selectedSpecialty}</p>}
        </div>
        <div className="source-status" id="source-status">
          <span><Database size={14} aria-hidden="true" /> FDA + Tiger Data <b>Connected</b></span>
          <small><Clock3 size={12} aria-hidden="true" />Refreshed: {feed.updated_at ? formatDate(feed.updated_at) : "Awaiting first snapshot"}</small>
        </div>
      </header>

      <div className="dashboard-focus">
        <section className="dashboard-primary" aria-label="Monitor and review">
          <MonitorMedicationForm />
          <MedicationRadar alerts={feed.alerts} />
        </section>

        <aside className="dashboard-context" aria-label="Monitoring context">
          <section className="summary-section" aria-labelledby="monitoring-status-title">
            <div className="context-heading">
              <p className="eyebrow">AT A GLANCE</p>
              <h2 id="monitoring-status-title">Monitoring status</h2>
            </div>
            <div className="summary-grid summary-grid-compact">
              {cards.map(({ label, value, note, icon: Icon, style }) => (
                <article className="summary-card" key={label}>
                  <div className="summary-top"><span>{label}</span><span className={`summary-icon ${style}`}><Icon size={16} aria-hidden="true" /></span></div>
                  <strong>{value.toString().padStart(2, "0")}</strong>
                  <p>{note}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="medications" className="watchlist">
            <div className="section-heading">
              <div><span className="eyebrow">MONITORING</span><h2>Monitored medications</h2></div>
              <span className="count-pill">{stats.monitored}</span>
            </div>
            <ul>
              {feed.monitored_medications.map((medication) => (
                <li key={medication.drug_key}>
                  <span className="medication-icon"><Pill size={17} aria-hidden="true" /></span>
                  <span>
                    {medication.medication_name}
                    <small>{medication.generic_name.join(", ") || medication.drug_key}</small>
                    {isSyntheticSource(medication.source) && <em className="watchlist-demo">Synthetic demonstration</em>}
                  </span>
                  <time dateTime={medication.latest_snapshot_at}>{formatDate(medication.latest_snapshot_at)}</time>
                </li>
              ))}
            </ul>
            {!feed.monitored_medications.length && <p>No medication labels are monitored yet.</p>}
          </section>
        </aside>
      </div>

      <div className="dashboard-support">
        <SignalChart alerts={feed.alerts} />
        <section id="timeline" className="timeline-panel">
          <div className="section-heading">
            <div><span className="eyebrow">RECENT CHANGES</span><h2>Signal history</h2></div>
            <span className="sort-label">Newest first</span>
          </div>
          {feed.alerts.length ? (
            <ol>
              {feed.alerts.map((alert) => (
                <li key={alert.id}>
                  <span className={`timeline-dot ${alert.priority_level}`} />
                  <time dateTime={alert.detected_at}>{formatDate(alert.detected_at)}</time>
                  <div><Link href={`/medication/${alert.id}`}>{alert.medication_name}</Link><p>{alertHeadline(alert)}</p></div>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </li>
              ))}
            </ol>
          ) : (
            <div className="timeline-empty">No verified label changes have been detected.</div>
          )}
        </section>
      </div>

      <footer className="clinical-disclaimer">Clinical decision support only - not medical advice. Always verify against the original labeling source.</footer>
    </div>
  );
}
