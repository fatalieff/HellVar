"use client";

import * as React from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <main id="main" className="relative flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
