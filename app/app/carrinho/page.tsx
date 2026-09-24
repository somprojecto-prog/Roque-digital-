"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/contexts/StoreContext";
import { formatPrice } from "@/lib/format";
import { showToast } from "@/lib/toast";
import type { PaymentMethod } from "@/types/database";

// Reserva caso a tabela payment_methods ainda esteja vazia — os mesmos
// dois métodos que estavam fixos no carrinho.html original.
const FALLBACK_METHODS: PaymentMethod[] = [
  {
    id: "fallback-mcx",
    name: "Multicaixa Express",
    instructions:
      "Referência Multicaixa Express será enviada por WhatsApp assim que confirmares o pedido.",
    proof_mode: "none",
    proof_label: null,
    active: true,
    created_at: "",
  },
  {
    id: "fallback-transferencia",
    name: "Transferência bancária",
    instructions:
      "IBAN: AO06 0000 0000 0000 0000 0000 0 — Banco de Roque Digital. Envia o comprovativo abaixo.",
    proof_mode: "required",
    proof_label: null,
    active: true,
    created_at: "",
  },
];

export default function CarrinhoPage() {
  const { cart, setQty, removeFromCart, cartTotal, clearCart, ready } = useStore();
  const [deliveryFee, setDeliveryFee] = useState(2000);
  const [methods, setMethods] = useState<PaymentMethod[]>(FALLBACK_METHODS);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(FALLBACK_METHODS[0]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const checkoutRef = useRef<HTMLDivElement | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const emailjsConfig = useRef<{ service: string; template: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("taxa_entrega, emailjs_public_key, emailjs_service_id, emailjs_template_id")
        .eq("id", 1)
        .single();

      if (data?.taxa_entrega != null) setDeliveryFee(Number(data.taxa_entrega));
      if (data?.emailjs_public_key && data?.emailjs_service_id && data?.emailjs_template_id) {
        emailjs.init({ publicKey: data.emailjs_public_key });
        emailjsConfig.current = {
          service: data.emailjs_service_id,
          template: data.emailjs_template_id,
        };
      }
    })().catch(() => {});

    (async () => {
      const { data } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });
      if (data && data.length > 0) {
        setMethods(data);
        setSelectedMethod(data[0]);
      }
    })().catch(() => {});
  }, []);

  const total = cartTotal + deliveryFee;

  const handleContinuar = () => {
    setCheckoutOpen(true);
    requestAnimationFrame(() => checkoutRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const enviarEmailNovaEncomenda = (dados: Record<string, string>) => {
    if (!emailjsConfig.current) return;
    emailjs
      .send(emailjsConfig.current.service, emailjsConfig.current.template, dados)
      .catch((err) => console.warn("Não foi possível enviar o e-mail da encomenda.", err));
  };

  const handleFinalizar = async () => {
    if (!name.trim() || !phone.trim() || !city.trim()) {
      showToast("Preenche nome, telefone e cidade");
      return;
    }
    if (selectedMethod.proof_mode === "required" && !proofInputRef.current?.files?.[0]) {
      showToast("Anexa o comprovativo de pagamento para continuar");
      proofInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    let finalOrderNumber = "RD" + Math.floor(1000 + Math.random() * 9000);

    try {
      let customerId: string | null = null;
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: existing } = await supabase
          .from("customers")
          .select("id")
          .eq("auth_user_id", session.user.id)
          .single();
        if (existing) customerId = existing.id;
      }

      if (!customerId) {
        const { data: customer } = await supabase
          .from("customers")
          .insert({
            full_name: name,
            phone,
            address: `${city} — ${address}`,
            auth_user_id: session ? session.user.id : null,
          })
          .select()
          .single();
        customerId = customer ? customer.id : null;
      }

      let proofUrl: string | null = null;
      const file = proofInputRef.current?.files?.[0];
      if (selectedMethod.proof_mode !== "none" && file) {
        try {
          const fileName = `comprovativos/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}.${file.name.split(".").pop() || "jpg"}`;
          const { error: upErr } = await supabase.storage.from("imagens").upload(fileName, file);
          if (!upErr) {
            proofUrl = supabase.storage.from("imagens").getPublicUrl(fileName).data.publicUrl;
          }
        } catch (upErr) {
          console.warn("Não foi possível enviar o comprovativo agora.", upErr);
        }
      }

      const { data: order } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          status: "recebido",
          total,
          delivery_fee: deliveryFee,
          payment_method: selectedMethod.name,
          payment_proof_url: proofUrl,
        })
        .select()
        .single();

      if (order) {
        finalOrderNumber = "RD" + order.order_number;
        const items = cart.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          quantity: i.qty,
          unit_price: i.price,
        }));
        if (items.length) await supabase.from("order_items").insert(items);
      }
    } catch (e) {
      console.log("Pedido guardado apenas localmente (Supabase indisponível ou tabela incompleta).", e);
    }

    const listaItens = cart
      .map((i) => `• ${i.name} — ${i.qty}x — ${formatPrice(i.price * i.qty)}`)
      .join("\n");

    enviarEmailNovaEncomenda({
      order_number: finalOrderNumber,
      customer_name: name,
      customer_phone: phone,
      customer_city: city,
      customer_address: address || "—",
      payment_method: selectedMethod.name,
      items_list: listaItens,
      delivery_fee: formatPrice(deliveryFee),
      total: formatPrice(total),
    });

    setOrderNumber(finalOrderNumber);
    clearCart();
    setSubmitting(false);
  };

  if (!ready) return null;

  if (orderNumber) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-cacau-darker px-6 pt-24 text-center">
        <div className="text-5xl">✅</div>
        <h1 className="mt-4 font-display text-2xl text-creme">Pedido recebido!</h1>
        <p className="mt-2 max-w-xs text-sm text-creme/60">
          Vamos entrar em contacto para confirmar o pagamento e a entrega.
        </p>
        <div className="mt-6 rounded-xl border border-dashed border-laranja/60 bg-cacau-dark px-6 py-3 font-semibold tracking-wide text-laranja">
          #{orderNumber}
        </div>
        <Link
          href="/"
          className="mt-8 rounded-full bg-laranja px-6 py-3 text-sm font-semibold text-preto"
        >
          Voltar à loja
        </Link>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-cacau-darker px-6 pt-24 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="mt-4 font-display text-2xl text-creme">O teu carrinho está vazio</h1>
        <p className="mt-2 text-sm text-creme/60">Adiciona produtos para veres aqui.</p>
        <Link href="/" className="mt-6 text-sm text-laranja hover:underline">
          ← Voltar à loja
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cacau-darker px-6 pb-24 pt-28 lg:pt-36">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl text-creme">O meu carrinho</h1>

        <div className="mt-8 flex flex-col gap-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-cacau/70 bg-cacau-dark p-3"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cacau">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-creme">{item.name}</p>
                  {item.brand && <p className="text-xs text-creme/50">{item.brand}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-creme/15 px-2 py-1">
                    <button
                      onClick={() => (item.qty <= 1 ? removeFromCart(item.id) : setQty(item.id, item.qty - 1))}
                      className="text-creme/70 hover:text-laranja"
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <span className="text-sm text-creme">{item.qty}</span>
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      className="text-creme/70 hover:text-laranja"
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-laranja">{formatPrice(item.price * item.qty)}</span>
                </div>
                <button
                  onClick={() => {
                    removeFromCart(item.id);
                    showToast("Produto removido");
                  }}
                  className="mt-1 self-start text-xs text-creme/40 hover:text-laranja"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-creme/10 pt-6 text-sm">
          <div className="flex justify-between text-creme/70">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-creme/70">
            <span>Entrega</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-medium text-creme">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {!checkoutOpen && (
          <button
            onClick={handleContinuar}
            className="mt-6 w-full rounded-full bg-laranja py-3 text-sm font-semibold text-preto"
          >
            Continuar para entrega →
          </button>
        )}

        {checkoutOpen && (
          <div ref={checkoutRef} className="mt-10 border-t border-creme/10 pt-8">
            <h2 className="font-display text-xl text-creme">Dados de entrega</h2>

            <div className="mt-5 flex flex-col gap-4">
              <Field label="Nome completo">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="O teu nome"
                  className="input-field"
                />
              </Field>
              <Field label="Telefone">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9XX XXX XXX"
                  className="input-field"
                />
              </Field>
              <Field label="Província / Município">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Luanda, Talatona"
                  className="input-field"
                />
              </Field>
              <Field label="Morada / Referência">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, bairro, ponto de referência"
                  className="input-field"
                />
              </Field>
            </div>

            <p className="mb-2 mt-6 text-xs font-semibold text-creme/60">Método de pagamento</p>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m)}
                  className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold transition ${
                    selectedMethod.id === m.id
                      ? "border-laranja bg-cacau-dark text-creme"
                      : "border-creme/15 text-creme/60 hover:border-creme/30"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {selectedMethod.instructions && (
              <p className="mt-3 rounded-xl border border-creme/10 bg-cacau-dark px-4 py-3 text-xs text-creme/60">
                {selectedMethod.instructions}
              </p>
            )}

            {selectedMethod.proof_mode !== "none" && (
              <Field
                label={
                  selectedMethod.proof_label ||
                  (selectedMethod.proof_mode === "required"
                    ? "Comprovativo de pagamento (obrigatório)"
                    : "Comprovativo de pagamento (opcional agora, podes enviar depois por WhatsApp)")
                }
              >
                <input ref={proofInputRef} type="file" accept="image/*" className="input-field" />
              </Field>
            )}

            <button
              onClick={handleFinalizar}
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-laranja py-3 text-sm font-semibold text-preto disabled:opacity-60"
            >
              {submitting ? "A enviar..." : "Finalizar pedido"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-creme/60">{label}</label>
      {children}
    </div>
  );
}
