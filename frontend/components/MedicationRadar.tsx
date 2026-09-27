"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Radar } from "lucide-react";
import AlertCard from "@/components/AlertCard";
import type { MedicationAlert, Severity } from "@/types/medication";

export default function MedicationRadar({ alerts }: { alerts: MedicationAlert[] }) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const filtered = alerts.filter((alert) => (severity === "all" || alert.severity === severity) && `${alert.drugName} ${alert.genericName ?? ""} ${alert.headline}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => b.priorityScore - a.priorityScore);
  return (
    <section id="radar" className="radar-section">
      <div className="section-heading"><div><span className="eyebrow">WHAT NEEDS YOUR ATTENTION</span><h2>Medication radar <span className="count-pill">{alerts.length}</span></h2><p>Your latest safety signals, ordered by priority.</p></div><span className="sort-label"><SlidersHorizontal size={14} aria-hidden="true" /> Highest priority first</span></div>
      <div className="radar-controls"><label className="search-field"><Search size={17} aria-hidden="true" /><span className="sr-only">Search medications</span><input type="search" placeholder="Search medications or updates…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="severity-select"><span className="sr-only">Filter by severity</span><select value={severity} onChange={(event) => setSeverity(event.target.value as Severity | "all")}><option value="all">All severities</option><option value="critical">Critical</option><option value="high">High</option><option value="moderate">Moderate</option></select></label></div>
      <p className="result-count" role="status">Showing {filtered.length} of {alerts.length} signals</p>
      <div className="alert-list">{filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)}</div>
      {!filtered.length && <div className="empty-state"><Radar size={30} aria-hidden="true" /><h3>No matching signals</h3><p>Try another medication name or severity.</p><button type="button" onClick={() => { setQuery(""); setSeverity("all"); }}>Clear filters</button></div>}
    </section>
  );
}
