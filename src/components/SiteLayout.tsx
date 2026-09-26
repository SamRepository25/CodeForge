import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PrivacyCopyrightNotice } from "./PrivacyCopyrightNotice";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <PrivacyCopyrightNotice />
      <Footer />
    </div>
  );
}
