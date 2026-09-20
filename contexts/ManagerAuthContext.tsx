"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ProfileRole } from "@/types/database";

interface ManagerProfile {
  id: string;
  full_name: string;
  role: ProfileRole;
}

interface ManagerAuthContextValue {
  profile: ManagerProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const ManagerAuthContext = createContext<ManagerAuthContextValue | null>(null);

/**
 * Só deve envolver as páginas protegidas do Manager (o grupo de rotas
 * (protected)) — nunca /manager/login ou /manager/signup, senão criava
 * um ciclo de redireção.
 */
export function ManagerAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/manager/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", session.user.id)
        .single();

      if (!active) return;

      if (!prof || !["admin", "gestor"].includes(prof.role)) {
        await supabase.auth.signOut();
        router.replace("/manager/login");
        return;
      }

      setProfile(prof);
      setLoading(false);
    }

    check();
    return () => {
      active = false;
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/manager/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cacau-darker">
        <p className="text-sm text-creme/50">A verificar sessão…</p>
      </div>
    );
  }

  return (
    <ManagerAuthContext.Provider value={{ profile, loading, signOut }}>
      {children}
    </ManagerAuthContext.Provider>
  );
}

export function useManagerAuth() {
  const ctx = useContext(ManagerAuthContext);
  if (!ctx) throw new Error("useManagerAuth deve ser usado dentro de <ManagerAuthProvider>");
  return ctx;
}
