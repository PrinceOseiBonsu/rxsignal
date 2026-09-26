import Link from "next/link";
import SignalChart from "@/components/SignalChart";
import { alerts, mockDataNotice } from "@/data/mockData";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-slate-600">{mockDataNotice}</p>
      <ul className="space-y-2">
        {alerts.map((medication) => (
          <li key={medication.id}>
            <Link className="font-medium text-teal-700 underline" href={`/medication/${medication.id}`}>{medication.drugName}</Link>
            <p className="text-sm text-slate-600">{medication.severity} · Priority {medication.priorityScore}/100 · <time dateTime={medication.date}>{medication.date}</time></p>
            <p>{medication.headline}</p>
          </li>
        ))}
      </ul>
      <SignalChart />
    </section>
  );
}
