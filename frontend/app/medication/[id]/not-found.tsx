import Link from "next/link";

export default function SignalNotFound() {
  return <section className="page-state"><p className="eyebrow">SIGNAL NOT FOUND</p><h1>This persisted signal does not exist.</h1><p>It may have been removed or the link may be incorrect.</p><Link className="state-link" href="/dashboard">Return to medication radar</Link></section>;
}
