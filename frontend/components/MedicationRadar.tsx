"use client";

import { useState } from "react";
import { Radar, Search, SlidersHorizontal } from "lucide-react";
import AlertCard from "@/components/AlertCard";
import type { PriorityLevel, SignalAlert } from "@/types/medication";

export default function MedicationRadar({ alerts }: { alerts: SignalAlert[] }) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<PriorityLevel | "all">("all");
  const filtered = alerts
    .filter((alert) => (priority === "all" || alert.priority_level === priority) && `${alert.medication_name} ${alert.drug_key} ${alert.changed_fields.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => b.priority_score - a.priority_score);
  return (
    <section id="radar" className="radar-section">
      <div className="section-heading"><div><span className="eyebrow">WHAT REQUIRES ATTENTION</span><h2>Medication radar <span className="count-pill">{alerts.length}</span></h2><p>Verified label signals, ordered by deterministic review priority.</p></div><span className="sort-label"><SlidersHorizontal size={14} aria-hidden="true" /> Highest priority first</span></div>
      <div className="radar-controls"><label className="signal-filter"><span className="filter-label">Filter detected signals</span><span className="search-field"><Search size={17} aria-hidden="true" /><input type="search" placeholder={alerts.length ? "Filter detected signals..." : "No detected signals to filter"} value={query} onChange={(event) => setQuery(event.target.value)} disabled={!alerts.length} /></span></label><label className="severity-select"><span className="sr-only">Filter by priority</span><select value={priority} onChange={(event) => setPriority(event.target.value as PriorityLevel | "all")} disabled={!alerts.length}><option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label></div>
      <p className="result-count" role="status">Showing {filtered.length} of {alerts.length} verified signals</p>
      <div className="alert-list">{filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)}</div>
      {!filtered.length && <div className="empty-state"><Radar size={30} aria-hidden="true" /><h3>{alerts.length ? "No matching signals" : "No label changes detected yet"}</h3><p>{alerts.length ? "Try another medication or priority level." : "Monitored labels are current. New verified changes will appear here."}</p>{alerts.length > 0 && <button type="button" onClick={() => { setQuery(""); setPriority("all"); }}>Clear filters</button>}</div>}
    </section>
  );
}
