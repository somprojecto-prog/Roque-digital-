"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { consumePendingAction } from "@/lib/pending-action";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/database";

const STATUS_LABELS: Record<OrderStatus, string> = {
  recebido: "Recebido",
  confirmado: "Pagamento confirmado",
  em_preparacao: "Em preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export default function ContaPage() {
  return (
    <Suspense fallback={null}>
      <ContaContent />
    </Suspense>
  );
}

function ContaContent() {
  const { session, customer, loading, signInWithPassword, signUpWithPassword, signInWithGoogle, signOut } =
    useAuth();
  const { addToCart, toggleFavorite } = useStore();
  const searchParams = useSearchParams();
  const pendingHandled = useRef(false);

  // Assim que a conta estiver disponível, conclui a ação que a pessoa
  // queria fazer antes de ser mandada para aqui (adicionar ao carrinho,
  // guardar favorito) e devolve-a à página onde estava.
  useEffect(() => {
    if (!customer || pendingHandled.current) return;
    pendingHandled.current = true;

    const pending = consumePendingAction();
    if (pending?.product) {
      if (pending.type === "add-to-cart") addToCart(pending.product, 1);
      if (pending.type === "toggle-fav") toggleFavorite(pending.product);
    }

    const next = searchParams.get("next");
    if (next) window.location.href = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cacau-darker pt-24">
        <p className="text-creme/50">A carregar…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cacau-darker px-6 pb-24 pt-28 lg:pt-36">
      <div className="mx-auto max-w-md">
        {!session ? (
          <AuthForms
            onLogin={signInWithPassword}
            onSignup={signUpWithPassword}
            onGoogle={signInWithGoogle}
          />
        ) : (
          <ProfileView onSignOut={signOut} />
        )}
      </div>
    </main>
  );
}

function AuthForms({
  onLogin,
  onSignup,
  onGoogle,
}: {
  onLogin: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  onGoogle: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  const handleLogin = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = await onLogin(loginEmail, loginPassword);
    setBusy(false);
    if (error) setMsg({ text: error, ok: false });
    else setMsg({ text: "Sessão iniciada!", ok: true });
  };

  const handleSignup = async () => {
    if (!suName || !suEmail || suPassword.length < 6) {
      setMsg({ text: "Preenche todos os campos (palavra-passe com 6+ caracteres).", ok: false });
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error, needsConfirmation } = await onSignup(suName, suEmail, suPassword);
    setBusy(false);
    if (error) {
      setMsg({ text: error, ok: false });
      return;
    }
    setMsg({
      text: needsConfirmation ? "Conta criada! Verifica o teu email para confirmar." : "Conta criada! A entrar...",
      ok: true,
    });
  };

  return (
    <div className="rounded-2xl border border-cacau/70 bg-cacau-dark p-8">
      <h1 className="text-center font-display text-2xl text-creme">Painel do Cliente</h1>
      <p className="mt-1 text-center text-sm text-creme/50">
        Entra ou cria conta para comprar, favoritar e avaliar produtos
      </p>

      <button
        onClick={onGoogle}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-creme/20 py-2.5 text-sm text-creme transition hover:border-laranja/60"
      >
        Continuar com Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-creme/30">
        <span className="h-px flex-1 bg-creme/10" />
        ou
        <span className="h-px flex-1 bg-creme/10" />
      </div>

      <div className="mb-5 flex rounded-full border border-creme/10 p-1 text-sm">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full py-1.5 ${mode === "login" ? "bg-laranja text-preto" : "text-creme/60"}`}
        >
          Entrar
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-1.5 ${mode === "signup" ? "bg-laranja text-preto" : "text-creme/60"}`}
        >
          Criar conta
        </button>
      </div>

      {mode === "login" ? (
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Palavra-passe"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="input-field"
          />
          <button
            onClick={handleLogin}
            disabled={busy}
            className="mt-1 rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto disabled:opacity-60"
          >
            {busy ? "A entrar…" : "Entrar"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="O teu nome"
            value={suName}
            onChange={(e) => setSuName(e.target.value)}
            className="input-field"
          />
          <input
            type="email"
            placeholder="Email"
            value={suEmail}
            onChange={(e) => setSuEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Palavra-passe (6+ caracteres)"
            value={suPassword}
            onChange={(e) => setSuPassword(e.target.value)}
            className="input-field"
          />
          <button
            onClick={handleSignup}
            disabled={busy}
            className="mt-1 rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto disabled:opacity-60"
          >
            {busy ? "A criar conta…" : "Criar conta"}
          </button>
        </div>
      )}

      {msg && (
        <p className={`mt-4 text-center text-xs ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>
      )}
    </div>
  );
}

function ProfileView({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const { customer, updateCustomer } = useAuth();
  const { favorites } = useStore();
  const [tab, setTab] = useState<"perfil" | "encomendas" | "favoritos">("perfil");
  const [name, setName] = useState(customer?.full_name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [savingMsg, setSavingMsg] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    setName(customer?.full_name || "");
    setPhone(customer?.phone || "");
    setAddress(customer?.address || "");
  }, [customer]);

  useEffect(() => {
    if (tab !== "encomendas" || !customer || orders) return;
    supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, [tab, customer, orders]);

  const handleSave = async () => {
    const { error } = await updateCustomer({ full_name: name, phone, address });
    setSavingMsg(error ? `Erro ao guardar: ${error}` : "Dados guardados com sucesso!");
    setTimeout(() => setSavingMsg(null), 2500);
  };

  return (
    <div className="rounded-2xl border border-cacau/70 bg-cacau-dark p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg text-creme">{customer?.full_name || "A tua conta"}</p>
          <p className="text-xs text-creme/50">{customer?.email}</p>
        </div>
        <button onClick={onSignOut} className="text-xs text-creme/50 hover:text-laranja">
          Terminar sessão
        </button>
      </div>

      <div className="mt-6 flex rounded-full border border-creme/10 p-1 text-xs">
        {(["perfil", "encomendas", "favoritos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-1.5 capitalize ${
              tab === t ? "bg-laranja text-preto" : "text-creme/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "perfil" && (
        <div className="mt-6 flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="input-field" />
          <input value={customer?.email || ""} disabled className="input-field opacity-50" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefone"
            className="input-field"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Morada"
            className="input-field"
          />
          <button
            onClick={handleSave}
            className="mt-1 rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto"
          >
            Guardar
          </button>
          {savingMsg && <p className="text-center text-xs text-creme/60">{savingMsg}</p>}
        </div>
      )}

      {tab === "encomendas" && (
        <div className="mt-6 flex flex-col gap-3">
          {!orders || orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-creme/50">
              {orders === null ? "A carregar…" : "Ainda não tens encomendas"}
            </p>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="rounded-xl border border-creme/10 p-4">
                <p className="text-sm font-medium text-creme">Pedido #RD{o.order_number}</p>
                <p className="mt-1 text-xs text-creme/50">
                  {new Date(o.created_at).toLocaleDateString("pt-PT")} · {formatPrice(o.total)}
                </p>
                <span className="mt-2 inline-block rounded-full border border-laranja/50 px-2.5 py-0.5 text-[11px] text-laranja">
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "favoritos" && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {favorites.length === 0 ? (
            <p className="col-span-2 py-10 text-center text-sm text-creme/50">
              Ainda não tens favoritos
            </p>
          ) : (
            favorites.map((p) => (
              <Link
                key={p.id}
                href={`/produto/${p.id}`}
                className="overflow-hidden rounded-xl border border-creme/10"
              >
                <div className="relative aspect-square bg-cacau">
                  {p.image && <Image src={p.image} alt={p.name} fill sizes="150px" className="object-cover" />}
                </div>
                <div className="p-2">
                  <p className="truncate text-xs text-creme">{p.name}</p>
                  <p className="text-xs text-laranja">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
