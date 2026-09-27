import Link from "next/link";
import {
  Activity,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
  FileCheck2,
  FileText,
  Pill,
} from "lucide-react";
import MedicationRadar from "@/components/MedicationRadar";
import MonitorMedicationForm from "@/components/MonitorMedicationForm";
import SignalChart from "@/components/SignalChart";
import { getAlerts } from "@/lib/api";
import { alertHeadline, formatDate, isSyntheticAlert, isSyntheticSource } from "@/lib/dashboard";

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

  const demoSignals = feed.alerts.filter(isSyntheticAlert).length;
  const demoMedications = feed.monitored_medications.filter((medication) => isSyntheticSource(medication.source)).length;
  const metrics = [
    { label: "Monitored medications", value: feed.monitored_medications.length, icon: Pill, tone: "blue" },
    { label: "Real detected changes", value: feed.alerts.length - demoSignals, icon: FileText, tone: "blue" },
    { label: "Demo signals", value: demoSignals, icon: Activity, tone: "purple" },
  ];
  const medicationsWithSignals = new Set(feed.alerts.map((alert) => alert.drug_key));
  // The feed has latest capture times, not baseline dates. Label these as snapshots.
  const history = [
    ...feed.monitored_medications.filter((medication) => !medicationsWithSignals.has(medication.drug_key)).map((medication) => ({
      key: `snapshot-${medication.drug_key}`,
      date: medication.latest_snapshot_at,
      name: medication.medication_name,
      description: isSyntheticSource(medication.source) ? "Synthetic snapshot saved" : "Label snapshot saved",
      kind: isSyntheticSource(medication.source) ? "demo" : "snapshot",
      href: null,
    })),
    ...feed.alerts.map((alert) => ({
      key: `signal-${alert.id}`,
      date: alert.detected_at,
      name: alert.medication_name,
      description: isSyntheticAlert(alert) ? "Demo signal detected" : alertHeadline(alert),
      kind: isSyntheticAlert(alert) ? "demo" : "signal",
      href: `/medication/${alert.id}`,
    })),
  ].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

  return (
    <div className="dashboard">
      <header className="page-heading dashboard-hero">
        <div>
          <h1>Never miss what <span>changed.</span></h1>
          <p>Monitor medication labels. Prioritize changes. Review the evidence.</p>
          {selectedSpecialty && <p className="dashboard-specialty">Review lens: {selectedSpecialty}</p>}
        </div>
      </header>

      <MonitorMedicationForm />

      <div className="dashboard-focus">
        <div className="dashboard-primary">
          <MedicationRadar alerts={feed.alerts} />

          <section id="timeline" className="signal-history" aria-labelledby="history-title">
            <div className="section-heading">
              <h2 id="history-title">Signal history</h2>
              <div className="history-legend" aria-label="History event types">
                <span><i className="snapshot" />Label saved</span>
                {feed.alerts.length > demoSignals && <span><i className="signal" />Change</span>}
                {demoSignals > 0 && <span><i className="demo" />Demo signal</span>}
              </div>
            </div>
            {history.length ? (
              <div className="history-scroll" role="region" aria-label="Saved labels and detected signals" tabIndex={0}>
                <ol className="history-track">
                  {history.map((event) => (
                    <li className={`history-event ${event.kind}`} key={event.key}>
                      <span className="history-marker" aria-hidden="true" />
                      <time dateTime={event.date}>{formatDate(event.date)}</time>
                      {event.href ? <Link href={event.href}>{event.name}</Link> : <strong>{event.name}</strong>}
                      <p>{event.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : <p className="timeline-empty">No label snapshots or signals saved yet.</p>}
          </section>

          <details className="activity-details">
            <summary><ChartNoAxesCombined size={18} aria-hidden="true" /><span>Signal activity</span><ChevronDown size={16} aria-hidden="true" /></summary>
            <SignalChart alerts={feed.alerts} />
          </details>
        </div>

        <aside className="dashboard-context" aria-label="Monitoring context">
          <section className="monitoring-overview" aria-labelledby="monitoring-status-title">
            <h2 id="monitoring-status-title">Monitoring overview</h2>
            <dl className="overview-metrics">
              {metrics.map(({ label, value, icon: Icon, tone }) => (
                <div className={`overview-metric ${tone}`} key={label}>
                  <Icon size={23} aria-hidden="true" />
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {demoMedications > 0 && <p className="overview-note">Includes {demoMedications} synthetic demo {demoMedications === 1 ? "medication" : "medications"}.</p>}
          </section>

          <section id="medications" className="watchlist">
            <h2>Monitored medications</h2>
            <ul>
              {feed.monitored_medications.map((medication) => {
                const synthetic = isSyntheticSource(medication.source);
                const latestSignal = feed.alerts.filter((alert) => alert.drug_key === medication.drug_key).sort((a, b) => Date.parse(b.detected_at) - Date.parse(a.detected_at))[0];
                return (
                  <li key={medication.drug_key}>
                    <div className="watchlist-name">
                      <strong>{medication.medication_name}</strong>
                      <small className={synthetic ? "synthetic-status" : "saved-status"}><span />{synthetic ? "Synthetic demonstration" : "Label saved"}</small>
                    </div>
                    {latestSignal ? (
                      <Link className="watchlist-status" href={`/medication/${latestSignal.id}`}>{synthetic ? "Demo signal" : "Review change"}<ChevronRight size={16} aria-hidden="true" /></Link>
                    ) : <span className="watchlist-status">No detected changes</span>}
                  </li>
                );
              })}
            </ul>
            {!feed.monitored_medications.length && <p>No medication labels are monitored yet.</p>}
          </section>

          <section className="evidence-first" aria-labelledby="evidence-first-title">
            <div className="evidence-first-heading">
              <div><h2 id="evidence-first-title">Evidence first</h2><p>Every signal links back to its source.</p></div>
              <FileCheck2 size={46} strokeWidth={1.25} aria-hidden="true" />
            </div>
            <div className="source-status" id="source-status">
              <span><Database size={14} aria-hidden="true" /> FDA + Tiger Data <b>Connected</b></span>
              <small><Clock3 size={12} aria-hidden="true" />Latest record: {feed.updated_at ? formatDate(feed.updated_at) : "Awaiting first snapshot"}</small>
            </div>
          </section>
        </aside>
      </div>

      <footer className="clinical-disclaimer">Clinical decision support only - not medical advice. Always verify against the original labeling source.</footer>
    </div>
  );
}
