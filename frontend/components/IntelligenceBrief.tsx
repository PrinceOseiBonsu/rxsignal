"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Database, FilePenLine, Info, ShieldCheck, Sparkles } from "lucide-react";
import { generateIntelligence } from "@/lib/api";
import { isSyntheticAlert } from "@/lib/dashboard";
import type { IntelligenceBrief as Brief, SignalAlert } from "@/types/medication";

const sections = [
  { key: "what_changed", title: "What changed", icon: FilePenLine },
  { key: "why_it_may_matter", title: "Why it may matter", icon: ShieldCheck },
  { key: "suggested_review", title: "Suggested review", icon: ClipboardCheck },
  { key: "evidence_summary", title: "Evidence summary", icon: Database },
] as const;

function Skeleton() {
  return <section className="intelligence-brief" aria-label="AI Intelligence Brief" aria-busy="true"><div className="brief-heading"><span className="brief-emblem"><Sparkles size={21} aria-hidden="true" /></span><div><p className="eyebrow">RXSIGNAL INTELLIGENCE</p><h2>Grounded intelligence brief</h2></div></div><p role="status" className="brief-loading-label">Explaining the verified evidence...</p><div className="brief-sections" aria-hidden="true">{sections.map(({ key }) => <div className="brief-skeleton-row" key={key}><span className="skeleton-bar skeleton-title" /><span className="skeleton-bar" /><span className="skeleton-bar skeleton-short" /></div>)}</div></section>;
}

export default function IntelligenceBrief({ alert }: { alert: SignalAlert }) {
  const synthetic = isSyntheticAlert(alert);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    generateIntelligence(alert).then((result) => { if (active) setBrief(result); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [alert, attempt]);
  if (error) return <section className="intelligence-brief brief-error"><div className="brief-heading"><span className="brief-emblem"><Info size={21} aria-hidden="true" /></span><div><p className="eyebrow">RXSIGNAL INTELLIGENCE</p><h2>Intelligence brief unavailable</h2></div></div><div className="brief-sections"><p>The verified change evidence and deterministic priority remain available below. The explanatory service could not complete this request.</p><button type="button" onClick={() => { setBrief(null); setError(false); setAttempt((value) => value + 1); }}>Try again</button></div></section>;
  if (!brief) return <Skeleton />;
  return (
    <section className="intelligence-brief" aria-label="AI Intelligence Brief">
      <div className="brief-heading"><span className="brief-emblem"><Sparkles size={21} aria-hidden="true" /></span><div><p className="eyebrow">{synthetic ? "SYNTHETIC DEMONSTRATION" : "RXSIGNAL INTELLIGENCE"}</p><h2>Grounded intelligence brief</h2></div><span className="brief-ai-label"><Sparkles size={11} aria-hidden="true" /> Evidence-grounded explanation</span></div>
      <div className="brief-sections">{sections.map(({ key, title, icon: Icon }) => <section className="brief-section" key={key}><span className="brief-section-icon"><Icon size={17} aria-hidden="true" /></span><div><h3>{title}</h3><p>{brief[key]}</p></div></section>)}</div>
      <div className="brief-disclaimer"><Info size={15} aria-hidden="true" /><p>{synthetic && "This brief explains synthetic demonstration evidence, not an actual FDA update. "}AI explains verified RxSignal evidence. It does not detect the change or alter the deterministic priority. Clinical decision support only - not medical advice.</p></div>
    </section>
  );
}
