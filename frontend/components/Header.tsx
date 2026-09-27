import Link from "next/link";
import { Activity, ChevronDown } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";

export default function Header() {
  return (
    <header className="app-header">
      <Link href="/dashboard" className="brand" aria-label="RxSignal dashboard"><span className="brand-icon"><Activity size={25} aria-hidden="true" /></span><span>RxSignal<span className="brand-dot">.</span></span></Link>
      <span className="header-caption">MEDICATION INTELLIGENCE</span>
      <div className="header-actions">
        <NotificationCenter />
        <details className="profile-menu"><summary><span className="avatar">RX</span><span className="profile-name">Review workspace<small>Clinical intelligence</small></span><ChevronDown size={14} aria-hidden="true" /></summary><div className="notification-panel"><strong>RxSignal workspace</strong><p>Monitor, detect, prioritize, explain, and verify medication-label changes.</p><p>Clinical decision support only - not medical advice.</p></div></details>
      </div>
    </header>
  );
}
