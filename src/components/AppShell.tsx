"use client";

import { SideNav } from "./SideNav";
import { TopNav } from "./TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav />
        <main className="flex-1 px-6 py-8 md:px-12 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
