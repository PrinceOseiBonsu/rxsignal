"use client";

import Link from "next/link";
import { Activity, Bell, ChevronDown } from "lucide-react";
import { alerts } from "@/data/mockData";

export default function Header() {
  const critical = alerts.filter((alert) => alert.severity === "critical");
  return (
    <header className="app-header">
      <Link href="/dashboard" className="brand" aria-label="RxSignal dashboard">
        <span className="brand-icon"><Activity size={25} aria-hidden="true" /></span>
        <span>RxSignal<span className="brand-dot">.</span></span>
      </Link>
      <span className="header-caption">MEDICATION INTELLIGENCE</span>
      <div className="header-actions">
        <details className="notifications">
          <summary aria-label={`Notifications: ${critical.length} critical updates`}>
            <Bell size={20} aria-hidden="true" /><span className="notification-dot" />
          </summary>
          <div className="notification-panel">
            <strong>Priority updates</strong><p>From your demo medication feed</p>
            {critical.map((alert) => <Link key={alert.id} href={`/medication/${alert.id}`}>{alert.drugName}<span>{alert.headline}</span></Link>)}
            {!critical.length && <p>You have no critical updates.</p>}
          </div>
        </details>
        <details className="profile-menu">
          <summary><span className="avatar">EC</span><span className="profile-name">Dr. Carter<small>Demo physician</small></span><ChevronDown size={14} aria-hidden="true" /></summary>
          <div className="notification-panel"><strong>Dr. Evelyn Carter</strong><p>Demo profile · Internal medicine</p><p>This preview uses a sample profile. Account settings are not connected yet.</p></div>
        </details>
      </div>
    </header>
  );
}
