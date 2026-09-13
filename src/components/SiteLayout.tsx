import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { StickyMobileCta } from "./StickyMobileCta";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      <Footer />
      <StickyMobileCta />
    </div>
  );
}
