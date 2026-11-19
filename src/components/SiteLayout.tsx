import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteLayout({ children, showChrome = true }: { children: ReactNode; showChrome?: boolean }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {showChrome && <Navbar />}
      <main className="flex-1">{children}</main>
      {showChrome && <Footer />}
    </div>
  );
}
