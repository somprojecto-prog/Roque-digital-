"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ManagerSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "gestor">("admin");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || password.length < 6) {
      setMsg({ text: "Preenche o nome e uma palavra-passe com 6+ caracteres.", ok: false });
      return;
    }

    setBusy(true);
    setMsg(null);

    // Enviamos "role" nos metadados — é isto que diferencia do registo de
    // clientes (conta.html) e permite ao trigger do Supabase
    // (fix-signup-trigger.sql) criar a linha em `profiles` sozinho.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role } },
    });

    setBusy(false);

    if (error) {
      setMsg({
        text: error.message.includes("already") ? "Este email já tem conta." : error.message,
        ok: false,
      });
      return;
    }

    setMsg({
      text: data.session
        ? "Conta criada! A entrar..."
        : 'Conta criada! Se for a primeira conta Admin, entra já; caso contrário, pede a um Admin para te ativar em "Equipa".',
      ok: true,
    });

    if (data.session) setTimeout(() => router.push("/manager"), 800);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cacau-darker px-6 py-16">
      <Link href="/" className="fixed left-6 top-6 text-sm text-creme/50 hover:text-creme">
        ← Voltar à loja
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-cacau/70 bg-cacau-dark p-8">
        <h1 className="text-center font-display text-xl text-creme">Pedir acesso ao painel</h1>
        <p className="mt-1 text-center text-sm text-creme/50">
          A primeira conta criada deve ser Admin.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="O teu nome"
            className="input-field"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input-field"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Palavra-passe (6+ caracteres)"
            className="input-field"
          />

          <div className="mt-1 flex rounded-full border border-creme/10 p-1 text-sm">
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 rounded-full py-1.5 ${role === "admin" ? "bg-laranja text-preto" : "text-creme/60"}`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setRole("gestor")}
              className={`flex-1 rounded-full py-1.5 ${role === "gestor" ? "bg-laranja text-preto" : "text-creme/60"}`}
            >
              Gestor
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto disabled:opacity-60"
          >
            {busy ? "A criar conta…" : "Criar conta"}
          </button>
        </form>

        {msg && (
          <p className={`mt-4 text-center text-xs ${msg.ok ? "text-green-400" : "text-red-400"}`}>
            {msg.text}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-creme/50">
          Já tens conta?{" "}
          <Link href="/manager/login" className="font-semibold text-laranja">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
