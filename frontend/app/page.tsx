import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Phase 1 · Development preview</p>
      <h1 className="text-4xl font-bold">RxSignal frontend</h1>
      <p className="text-slate-600">The project foundation is ready. These pages are placeholders for the next phases.</p>
      <Link href="/dashboard" className="inline-block rounded-lg bg-teal-700 px-5 py-3 font-medium text-white">Open dashboard</Link>
    </section>
  );
}
