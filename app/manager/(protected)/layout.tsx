"use client";

import { useState } from "react";
import { ManagerAuthProvider, useManagerAuth } from "@/contexts/ManagerAuthContext";
import ManagerSidebar from "@/components/manager/ManagerSidebar";

function Shell({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useManagerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cacau-darker">
      <ManagerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-4 border-b border-creme/10 px-6 py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="text-creme lg:hidden"
          >
            ☰
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-laranja text-xs font-bold text-preto">
              {profile?.full_name?.charAt(0).toUpperCase() || "?"}
            </span>
            <span className="text-creme/80">{profile?.full_name}</span>
            <span className="rounded-full border border-creme/15 px-2 py-0.5 text-[11px] capitalize text-creme/50">
              {profile?.role}
            </span>
            <button onClick={signOut} className="text-creme/50 hover:text-laranja">
              Sair
            </button>
          </div>
        </header>

        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

export default function ManagerProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ManagerAuthProvider>
      <Shell>{children}</Shell>
    </ManagerAuthProvider>
  );
}
