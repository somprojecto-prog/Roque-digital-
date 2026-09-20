"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ManagerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      setMsg({ text: "Email ou palavra-passe incorretos.", ok: false });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (!profile || !["admin", "gestor"].includes(profile.role)) {
      await supabase.auth.signOut();
      setBusy(false);
      setMsg({
        text:
          profile?.role === "pendente"
            ? 'A tua conta ainda está pendente. Pede a um Admin para te dar acesso em "Equipa".'
            : "Esta conta não tem permissão para aceder ao painel.",
        ok: false,
      });
      return;
    }

    setMsg({ text: "Sessão iniciada. A redirecionar...", ok: true });
    setTimeout(() => router.push("/manager"), 500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cacau-darker px-6">
      <Link href="/" className="fixed left-6 top-6 text-sm text-creme/50 hover:text-creme">
        ← Voltar à loja
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-cacau/70 bg-cacau-dark p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-laranja font-display text-lg text-laranja">
          RD
        </div>
        <h1 className="text-center font-display text-xl text-creme">Painel de Gestão</h1>
        <p className="mt-1 text-center text-sm text-creme/50">
          Acesso restrito — Administradores e Gestores
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-creme/60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="oteuemail@exemplo.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-creme/60">Palavra-passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto disabled:opacity-60"
          >
            {busy ? "A entrar…" : "Entrar"}
          </button>
        </form>

        {msg && (
          <p className={`mt-4 text-center text-xs ${msg.ok ? "text-green-400" : "text-red-400"}`}>
            {msg.text}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-creme/50">
          Ainda não tens conta?{" "}
          <Link href="/manager/signup" className="font-semibold text-laranja">
            Pedir acesso
          </Link>
        </p>
      </div>
    </main>
  );
}
