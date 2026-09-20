"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Customer } from "@/types/database";

interface AuthContextValue {
  session: Session | null;
  customer: Customer | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateCustomer: (updates: Partial<Customer>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Garante que existe uma linha em `customers` ligada a este utilizador
  // (cria-a na primeira vez, tal como verificarSessao() fazia no site
  // original) — cobre também quem entrou via Google pela primeira vez.
  const loadCustomer = useCallback(
    async (userId: string, fallback: { name?: string | null; email?: string | null }) => {
      const { data: existing } = await supabase
        .from("customers")
        .select("*")
        .eq("auth_user_id", userId)
        .single();

      if (existing) {
        setCustomer(existing);
        return;
      }

      const { data: created } = await supabase
        .from("customers")
        .insert({
          auth_user_id: userId,
          full_name: fallback.name || fallback.email?.split("@")[0] || null,
          email: fallback.email,
        })
        .select()
        .single();
      setCustomer(created || null);
    },
    []
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      setSession(session);
      if (session) {
        await loadCustomer(session.user.id, {
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          email: session.user.email,
        });
      }
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await loadCustomer(newSession.user.id, {
          name: newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name,
          email: newSession.user.email,
        });
      } else {
        setCustomer(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadCustomer]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? "Email ou palavra-passe incorretos." : null };
  }, []);

  const signUpWithPassword = useCallback(async (name: string, email: string, password: string) => {
    // Sem "role" nos metadados: o trigger do Supabase sabe que esta conta
    // é de cliente, e não cria linha em `profiles` (essa é só para o
    // Manager, Admin/Gestor).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      return {
        error: error.message.includes("already") ? "Este email já tem conta." : error.message,
        needsConfirmation: false,
      };
    }

    if (data.user) {
      await supabase.from("customers").insert({ auth_user_id: data.user.id, full_name: name, email });
    }

    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  }, []);

  const updateCustomer = useCallback(
    async (updates: Partial<Customer>) => {
      if (!customer) return { error: "Sem sessão." };
      const { error } = await supabase.from("customers").update(updates).eq("id", customer.id);
      if (error) return { error: error.message };
      setCustomer({ ...customer, ...updates });
      return { error: null };
    },
    [customer]
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        customer,
        loading,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        signOut,
        updateCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
