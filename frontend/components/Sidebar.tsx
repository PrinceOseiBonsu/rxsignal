"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Radar, Pill, History, Database, ArrowUpRight } from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Radar", href: "/dashboard#radar", icon: Radar },
  { label: "Medications", href: "/dashboard#medications", icon: Pill },
  { label: "Timeline", href: "/dashboard#timeline", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <p className="nav-caption">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {navigation.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href} aria-current={href === pathname ? "page" : undefined} className={href === pathname ? "nav-link active" : "nav-link"}>
            <Icon size={19} aria-hidden="true" />{label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-note"><Database size={19} aria-hidden="true" /><strong>Clarity in every update.</strong><p>A focused view of the medications you follow.</p><a href="/dashboard#source-status">Demo data source <ArrowUpRight size={14} aria-hidden="true" /></a></div>
      <div className="sidebar-footer"><span className="status-dot" /> RxSignal preview <span>v0.1</span></div>
    </aside>
  );
}
