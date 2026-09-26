import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "RxSignal",
  description: "Medication safety intelligence — frontend development preview",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <Activity aria-hidden="true" className="text-teal-700" /> RxSignal
            </Link>
            <nav aria-label="Main navigation" className="flex gap-5 text-sm">
              <Link href="/onboarding">Onboarding</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
