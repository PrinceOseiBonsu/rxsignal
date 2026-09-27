import Link from "next/link";
import { Activity, AlertTriangle, Pill, CalendarDays, ArrowUpRight, Database, Clock3 } from "lucide-react";
import MedicationRadar from "@/components/MedicationRadar";
import SignalChart from "@/components/SignalChart";
import { alerts, mockDataNotice } from "@/data/mockData";
import { formatDate, getDashboardStats } from "@/lib/dashboard";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ specialty?: string | string[] }> }) {
  const { specialty } = await searchParams;
  const selectedSpecialty = typeof specialty === "string" && ["Cardiology", "Oncology", "Emergency Medicine", "Internal Medicine", "Other"].includes(specialty) ? specialty : null;
  const stats = getDashboardStats(alerts);
  const cards = [
    { label: "Active signals", value: stats.active, note: "Across your demo watchlist", icon: Activity, style: "teal" },
    { label: "Critical updates", value: stats.critical, note: "Highest-priority changes", icon: AlertTriangle, style: "red" },
    { label: "Medications monitored", value: stats.monitored, note: "In your demo watchlist", icon: Pill, style: "teal" },
    { label: "Updates this week", value: stats.updatesThisWeek, note: "Sep 9–15 · demo reporting week", icon: CalendarDays, style: "blue" },
  ];
  return (
    <div className="dashboard">
      <div className="page-heading"><div><p className="eyebrow">YOUR DAILY INTELLIGENCE</p><h1>Good morning, Dr. Carter<span className="greeting-dot">.</span></h1><p>Here’s what changed in the medications you follow.</p>{selectedSpecialty && <p className="dashboard-specialty">{selectedSpecialty} · Demo preview</p>}</div><div className="source-status" id="source-status"><span><Database size={14} aria-hidden="true" /> FDA source <b>Demo mode</b></span><small><Clock3 size={12} aria-hidden="true" /> Last updated: {stats.latestDate ? formatDate(stats.latestDate) : "No updates"} · demo</small></div></div>
      <div className="summary-grid">{cards.map(({ label, value, note, icon: Icon, style }) => <article className="summary-card" key={label}><div className="summary-top"><span>{label}</span><span className={`summary-icon ${style}`}><Icon size={18} aria-hidden="true" /></span></div><strong>{value.toString().padStart(2, "0")}</strong><p>{note}</p></article>)}</div>
      <div className="dashboard-columns"><MedicationRadar alerts={alerts} /><aside className="dashboard-aside"><SignalChart /><section id="medications" className="watchlist"><div className="section-heading"><div><span className="eyebrow">YOUR WATCHLIST</span><h2>Medications</h2></div><span className="count-pill">{stats.monitored}</span></div><ul>{alerts.map((alert) => <li key={alert.id}><span className="medication-icon"><Pill size={17} aria-hidden="true" /></span><Link href={`/medication/${alert.id}`}>{alert.drugName}<small>{alert.genericName}</small></Link><ArrowUpRight size={15} aria-hidden="true" /></li>)}</ul><p>All medications in this preview are fictional.</p></section></aside></div>
      <section id="timeline" className="timeline-panel"><div className="section-heading"><div><span className="eyebrow">RECENT CHANGES</span><h2>Update timeline</h2></div><span className="sort-label">Latest first</span></div><ol>{[...alerts].sort((a, b) => b.date.localeCompare(a.date)).map((alert) => <li key={alert.id}><span className={`timeline-dot ${alert.severity}`} /><time dateTime={alert.date}>{formatDate(alert.date)}</time><div><Link href={`/medication/${alert.id}`}>{alert.drugName}</Link><p>{alert.headline}</p></div><ArrowUpRight size={16} aria-hidden="true" /></li>)}</ol></section>
      <footer className="demo-disclaimer"><span className="mock-tag">DEMO</span><p>{mockDataNotice}</p></footer>
    </div>
  );
}
