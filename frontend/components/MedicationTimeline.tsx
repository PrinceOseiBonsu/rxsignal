"use client";

import { useId, useState } from "react";
import { History } from "lucide-react";
import { formatDate } from "@/lib/dashboard";
import type { TimelineEvent } from "@/types/medication";

export default function MedicationTimeline({ events }: { events: TimelineEvent[] }) {
  const ordered = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const [selectedIndex, setSelectedIndex] = useState(ordered.length - 1);
  const selected = ordered[selectedIndex] ?? ordered.at(-1);
  const panelId = useId();
  return (
    <section className="medication-timeline" aria-label="Medication timeline">
      <div className="medication-timeline-heading"><div><p className="eyebrow">THE HISTORY BEHIND THE SIGNAL</p><h2>Medication timeline</h2></div><History size={21} aria-hidden="true" /></div>
      <p className="timeline-instruction">Follow the label’s evolution. Select an event to explore the change.</p>
      {ordered.length ? <>
        <div className="timeline-scroll">
          <ol className="medication-event-track">
            {ordered.map((event, index) => (
              <li key={`${event.date}-${index}`} className={`medication-event ${event.status}`}>
                <button type="button" className="timeline-event-button" aria-pressed={selected === event} aria-controls={panelId} onClick={() => setSelectedIndex(index)}>
                  <span className="event-status">{event.status}</span>
                  <span className="event-marker" aria-hidden="true" />
                  <time dateTime={event.date}>{formatDate(event.date)}</time>
                  <span className="event-label">{event.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div id={panelId} className={`timeline-event-detail ${selected?.status}`} role="status" aria-live="polite" aria-atomic="true">
          <span className="event-detail-kicker">SELECTED EVENT · {selected?.status}</span>
          <h3>{selected?.label}</h3>
          <p>{selected?.description}</p>
        </div>
      </> : <p className="timeline-empty">No timeline events are available yet.</p>}
      <p className="timeline-footnote">Fictional label history · Events are ordered by date; spacing does not represent elapsed time. “Normal” describes the demo label state, not a guarantee of safety.</p>
    </section>
  );
}
