import type { Metadata } from "next";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "RxSignal | Medication intelligence",
  description: "Medication safety intelligence — fictional development preview",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <div className="app-shell"><Sidebar /><main id="main-content" className="main-content">{children}</main></div>
      </body>
    </html>
  );
}
