"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import type { OrderStatus, OrderStatusHistory } from "@/types/database";

const STATUS_LABELS: Record<OrderStatus, string> = {
  recebido: "Recebido",
  confirmado: "Confirmado",
  em_preparacao: "Em preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export interface OrderDetail {
  id: string;
  order_number: number;
  total: number;
  delivery_fee: number;
  payment_method: string | null;
  payment_proof_url: string | null;
  customers: { full_name: string | null; phone: string | null; address: string | null } | null;
  order_items: { quantity: number; unit_price: number; products: { name: string } | null }[];
}

export default function OrderDetailModal({
  order,
  onClose,
}: {
  order: OrderDetail;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<OrderStatusHistory[] | null>(null);

  useEffect(() => {
    supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", order.id)
      .order("changed_at", { ascending: true })
      .then(({ data }) => setHistory(data || []));
  }, [order.id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-preto/70 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-cacau/70 bg-cacau-darker p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-creme">Pedido #RD{order.order_number}</h3>
          <button onClick={onClose} className="text-creme/50 hover:text-creme">
            ✕
          </button>
        </div>

        <p className="font-medium text-creme">{order.customers?.full_name || "Cliente"}</p>
        <p className="mt-1 text-sm text-creme/50">
          📞 {order.customers?.phone || "—"}
          <br />📍 {order.customers?.address || "—"}
        </p>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-creme/10 pt-4">
          {order.order_items.length === 0 ? (
            <p className="text-sm text-creme/40">Sem itens registados.</p>
          ) : (
            order.order_items.map((i, idx) => (
              <p key={idx} className="text-sm text-creme/70">
                {i.quantity}x {i.products?.name || "Produto"} — {formatPrice(i.unit_price * i.quantity)}
              </p>
            ))
          )}
        </div>

        <p className="mt-3 text-sm text-creme/50">Taxa de entrega: {formatPrice(order.delivery_fee || 0)}</p>
        <p className="mt-1 font-medium text-creme">Total: {formatPrice(order.total)}</p>

        <p className="mt-4 border-t border-creme/10 pt-4 text-sm text-creme/70">
          💳 Método: {order.payment_method || "—"}
        </p>
        <p className="mt-1.5">
          {order.payment_proof_url ? (
            <a
              href={order.payment_proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-laranja"
            >
              📎 Ver comprovativo enviado
            </a>
          ) : (
            <span className="text-sm text-creme/40">Sem comprovativo enviado</span>
          )}
        </p>

        <div className="mt-4 border-t border-creme/10 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-creme/40">Histórico</p>
          {history === null ? (
            <p className="text-sm text-creme/40">A carregar…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-creme/40">Sem histórico registado.</p>
          ) : (
            history.map((h) => (
              <p key={h.id} className="text-xs text-creme/60">
                • {STATUS_LABELS[h.status] || h.status} —{" "}
                {new Date(h.changed_at).toLocaleString("pt-PT")}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
