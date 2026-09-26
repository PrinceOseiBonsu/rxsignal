import { notFound } from "next/navigation";
import { alerts, mockDataNotice } from "@/data/mockData";

export default async function MedicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const medication = alerts.find((item) => item.id === id);
  if (!medication) notFound();

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold">{medication.drugName}</h1>
      <p className="text-slate-600">{mockDataNotice}</p>
      <p>{medication.genericName}</p>
      <p>{medication.severity} · Priority {medication.priorityScore}/100 · <time dateTime={medication.date}>{medication.date}</time></p>
      <h2 className="text-xl font-semibold">{medication.headline}</h2>
      <dl className="space-y-4">
        {[
          ["Previous information", medication.previousInformation],
          ["New information", medication.newInformation],
          ["AI summary (mock)", medication.aiSummary],
          ["What changed", medication.intelligenceBrief.whatChanged],
          ["Why it matters", medication.intelligenceBrief.whyItMatters],
          ["Affected population", medication.intelligenceBrief.whoMayBeAffected],
          ["Source (mock)", medication.source],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="font-semibold">{label}</dt>
            <dd className="text-slate-600">{value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="text-xl font-semibold">Timeline (mock)</h2>
      <ol className="list-inside list-decimal space-y-2">
        {medication.timeline.map((event) => (
          <li key={event.date}>
            <time dateTime={event.date}>{event.date}</time> — {event.label} ({event.status})
          </li>
        ))}
      </ol>
    </section>
  );
}
