"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Bell, ChevronDown } from "lucide-react";
import { getAlerts } from "@/lib/api";
import { alertHeadline } from "@/lib/dashboard";
import type { SignalAlert } from "@/types/medication";

export default function Header() {
  const [alerts, setAlerts] = useState<SignalAlert[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let active = true;
    getAlerts().then((feed) => { if (active) setAlerts(feed.alerts); }).catch(() => { if (active) setUnavailable(true); });
    return () => { active = false; };
  }, []);
  const highPriority = alerts.filter((alert) => alert.priority_level === "high");
  return (
    <header className="app-header">
      <Link href="/dashboard" className="brand" aria-label="RxSignal dashboard"><span className="brand-icon"><Activity size={25} aria-hidden="true" /></span><span>RxSignal<span className="brand-dot">.</span></span></Link>
      <span className="header-caption">MEDICATION INTELLIGENCE</span>
      <div className="header-actions">
        <details className="notifications"><summary aria-label={`Notifications: ${highPriority.length} high-priority updates`}><Bell size={20} aria-hidden="true" />{highPriority.length > 0 && <span className="notification-dot" />}</summary><div className="notification-panel"><strong>High-priority updates</strong><p>{unavailable ? "Signal feed unavailable." : "Verified medication-label signals"}</p>{highPriority.map((alert) => <Link key={alert.id} href={`/medication/${alert.id}`}>{alert.medication_name}<span>{alertHeadline(alert)}</span></Link>)}{!unavailable && !highPriority.length && <p>No high-priority updates.</p>}</div></details>
        <details className="profile-menu"><summary><span className="avatar">RX</span><span className="profile-name">Review workspace<small>Clinical intelligence</small></span><ChevronDown size={14} aria-hidden="true" /></summary><div className="notification-panel"><strong>RxSignal workspace</strong><p>Monitor, detect, prioritize, explain, and verify medication-label changes.</p><p>Clinical decision support only - not medical advice.</p></div></details>
      </div>
    </header>
  );
}
