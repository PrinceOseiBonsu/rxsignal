import { LoaderCircle } from "lucide-react";

export default function DashboardLoading() {
  return <section className="page-state loading-state" aria-busy="true"><LoaderCircle className="state-icon spin" size={28} aria-hidden="true" /><p className="eyebrow">RXSIGNAL</p><h1>Loading verified medication intelligence...</h1><p>Connecting to persisted signals and monitoring history.</p></section>;
}
