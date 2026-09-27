import Link from "next/link";
import { ArrowLeft, FileSearch } from "lucide-react";

export default function SignalNotFound() {
  return <section className="page-state"><FileSearch className="state-icon" size={28} aria-hidden="true" /><p className="eyebrow">SIGNAL NOT FOUND</p><h1>This persisted signal does not exist.</h1><p>It may have been removed or the link may be incorrect.</p><Link className="state-link" href="/dashboard"><ArrowLeft size={16} aria-hidden="true" />Return to medication radar</Link></section>;
}
