"use client";

import { useState } from "react";
import { Radar, Search } from "lucide-react";
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
      <div className="section-heading"><h2>Detected changes</h2><span className="count-pill" aria-label={`${alerts.length} detected signals`}>{alerts.length}</span></div>
      <div className="radar-controls">
        <div className="priority-tabs" role="group" aria-label="Filter by priority">
          {([['all', 'All changes'], ['high', 'High priority'], ['medium', 'Medium'], ['low', 'Low']] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={priority === value} onClick={() => setPriority(value)}>{label}</button>
          ))}
        </div>
        <label className="signal-filter"><span className="sr-only">Filter detected signals</span><span className="search-field"><Search size={15} aria-hidden="true" /><input type="search" placeholder="Filter detected signals..." value={query} onChange={(event) => setQuery(event.target.value)} disabled={!alerts.length} /></span></label>
      </div>
      <p className="result-count sr-only" role="status">Showing {filtered.length} of {alerts.length} detected signals, highest priority first</p>
      <div className="alert-list">{filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)}</div>
      {!filtered.length && <div className="empty-state"><Radar size={30} aria-hidden="true" /><h3>{alerts.length ? "No matching signals" : "No label changes detected yet"}</h3><p>{alerts.length ? "Try another medication or priority level." : "Monitored labels are current. New verified changes will appear here."}</p>{alerts.length > 0 && <button type="button" onClick={() => { setQuery(""); setPriority("all"); }}>Clear filters</button>}</div>}
    </section>
  );
}
