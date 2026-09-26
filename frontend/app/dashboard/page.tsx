import Link from "next/link";
import SignalChart from "@/components/SignalChart";
import { medications } from "@/data/mockData";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-slate-600">Setup preview using fictional data, with no connection to the backend.</p>
      <ul className="space-y-2">
        {medications.map((medication) => (
          <li key={medication.id}>
            <Link className="font-medium text-teal-700 underline" href={`/medication/${medication.id}`}>{medication.name}</Link>
          </li>
        ))}
      </ul>
      <SignalChart />
    </section>
  );
}
