import { notFound } from "next/navigation";
import { medications } from "@/data/mockData";

export default async function MedicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const medication = medications.find((item) => item.id === id);
  if (!medication) notFound();

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold">{medication.name}</h1>
      <p className="text-slate-600">Fictional medication detail placeholder. The timeline and intelligence brief will be added in later phases.</p>
    </section>
  );
}
