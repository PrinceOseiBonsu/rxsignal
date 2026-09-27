import Link from "next/link";

export default function NotFound() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link href="/dashboard" className="text-teal-700 underline">Return to dashboard</Link>
    </section>
  );
}
