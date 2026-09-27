import Link from "next/link";
import { ArrowLeft, FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <section className="page-state">
      <FileSearch size={28} className="state-icon" aria-hidden="true" />
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>Page not found</h1>
      <Link href="/dashboard" className="state-link"><ArrowLeft size={16} aria-hidden="true" />Return to dashboard</Link>
    </section>
  );
}
