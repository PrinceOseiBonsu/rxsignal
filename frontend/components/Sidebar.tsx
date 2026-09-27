"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, FileText, History, House, Landmark, Pill } from "lucide-react";

const navigation = [
  { label: "Overview", mobileLabel: "Overview", href: "/dashboard", icon: House },
  { label: "Detected changes", mobileLabel: "Changes", href: "/dashboard#radar", icon: FileText },
  { label: "Monitored medications", mobileLabel: "Medications", href: "/dashboard#medications", icon: Pill },
  { label: "Signal history", mobileLabel: "History", href: "/dashboard#timeline", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="sidebar-brand" aria-label="RxSignal dashboard">
        <Activity size={32} aria-hidden="true" />
        <span>RxSignal<small>Medication intelligence</small></span>
      </Link>
      <nav aria-label="Main navigation">
        {navigation.map(({ label, mobileLabel, href, icon: Icon }) => (
          <Link key={label} href={href} aria-current={href === pathname ? "page" : undefined} className={href === pathname ? "nav-link active" : "nav-link"}>
            <Icon size={21} aria-hidden="true" />
            <span className="nav-label-desktop">{label}</span>
            <span className="nav-label-mobile">{mobileLabel}</span>
          </Link>
        ))}
      </nav>
      <a href="/dashboard#source-status" className="sidebar-footer">
        <Landmark size={21} aria-hidden="true" /> FDA label monitoring
      </a>
    </aside>
  );
}
