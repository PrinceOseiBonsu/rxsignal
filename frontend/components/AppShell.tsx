"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/onboarding" || pathname === "/") {
    return <main id="main-content" className="onboarding-main">{children}</main>;
  }
  return (
    <div className="workspace">
      <Sidebar />
      <div className="workspace-main">
        <Header detail={pathname.startsWith("/medication/")} />
        <main id="main-content" className="main-content">{children}</main>
      </div>
    </div>
  );
}
