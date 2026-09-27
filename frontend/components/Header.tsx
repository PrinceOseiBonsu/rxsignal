import Link from "next/link";
import { Activity, ChevronRight, ChevronsRight } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";

export default function Header({ detail = false }: { detail?: boolean }) {
  return (
    <header className="app-header">
      <Link href="/dashboard" className="mobile-brand" aria-label="RxSignal dashboard"><Activity size={25} aria-hidden="true" /><span>RxSignal</span></Link>
      <nav className="workspace-breadcrumb" aria-label="Breadcrumb">
        <ChevronsRight size={15} aria-hidden="true" />
        <Link href="/dashboard">Workspace</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page">{detail ? "Detected change" : "Overview"}</span>
      </nav>
      <div className="header-actions">
        <NotificationCenter />
        <details className="profile-menu"><summary aria-label="RxSignal workspace information" title="Workspace information"><span className="avatar">RX</span></summary><div className="notification-panel"><strong>RxSignal workspace</strong><p>Clinical decision support only - not medical advice.</p></div></details>
      </div>
    </header>
  );
}
