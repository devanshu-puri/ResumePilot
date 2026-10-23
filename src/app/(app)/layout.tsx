import React from "react";
import { NavRail } from "@/components/layout/nav-rail";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <NavRail />
      <div className="flex-1 flex flex-col min-w-0 pb-16 sm:pb-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1120px] w-full mx-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
