"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/types/database";
import OrderDetailModal, { type OrderDetail } from "@/components/manager/OrderDetailModal";

const STATUSES: OrderStatus[] = [
  "recebido",
  "confirmado",
  "em_preparacao",
  "enviado",
  "entregue",
  "cancelado",
];
const STATUS_LABELS: Record<OrderStatus, string> = {
  recebido: "Recebido",
  confirmado: "Confirmado",
  em_preparacao: "Em preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

type OrderRow = OrderDetail & { status: OrderStatus; created_at: string };

export default function ManagerEncomendasPage() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<OrderRow | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, customers(full_name, phone, address), order_items(*, products(name))")
      .order("created_at", { ascending: false });
    setOrders((data as unknown as OrderRow[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev && prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const filtered = (orders || []).filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search) {
      const haystack = `${o.customers?.full_name || ""} ${o.order_number}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Encomendas</h1>
      <p className="mt-1 text-sm text-creme/50">Acompanha e atualiza o estado de cada pedido.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou nº do pedido..."
          className="input-field max-w-xs flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[200px]"
        >
          <option value="">Todos os estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal">Pedido</th>
              <th className="p-3 font-normal">Cliente</th>
              <th className="p-3 font-normal">Data</th>
              <th className="p-3 font-normal">Valor</th>
              <th className="p-3 font-normal">Estado</th>
              <th className="p-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {orders === null ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-creme/40">
                  Sem encomendas.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-t border-creme/5 text-creme/80">
                  <td className="p-3">#RD{o.order_number}</td>
                  <td className="p-3">{o.customers?.full_name || "—"}</td>
                  <td className="whitespace-nowrap p-3 text-creme/50">
                    {new Date(o.created_at).toLocaleDateString("pt-PT")}
                  </td>
                  <td className="p-3">{formatPrice(o.total)}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-creme/15 bg-cacau-darker px-2 py-1 text-xs text-creme"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setSelected(o)} className="text-xs text-laranja">
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
