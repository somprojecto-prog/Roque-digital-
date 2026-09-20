"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/database";

const STATUS_LABELS: Record<OrderStatus, string> = {
  recebido: "Recebido",
  confirmado: "Confirmado",
  em_preparacao: "Em preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

type OrderWithCustomer = Order & { customers: { full_name: string | null } | null };

export default function ManagerDashboardPage() {
  const [orders, setOrders] = useState<OrderWithCustomer[] | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ data: ordersData }, { data: productsData }] = await Promise.all([
        supabase
          .from("orders")
          .select("*, customers(full_name)")
          .order("created_at", { ascending: false }),
        supabase.from("products").select("stock"),
      ]);
      setOrders(ordersData || []);
      setLowStockCount((productsData || []).filter((p) => (p.stock ?? 0) <= 5).length);
    })();
  }, []);

  const validOrders = (orders || []).filter((o) => o.status !== "cancelado");
  const totalSold = validOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const uniqueCustomers = new Set((orders || []).map((o) => o.customer_id)).size;

  const kpis = [
    { label: "💰 Total vendido", value: formatPrice(totalSold) },
    { label: "🧾 Encomendas", value: String((orders || []).length) },
    { label: "👥 Clientes", value: String(uniqueCustomers) },
    { label: "📦 Stock baixo", value: String(lowStockCount) },
  ];

  const latest = (orders || []).slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Bom dia 👋</h1>
      <p className="mt-1 text-sm text-creme/50">Aqui está o que está a acontecer na tua loja.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-cacau/70 bg-cacau-dark p-5">
            <p className="text-xs text-creme/50">{k.label}</p>
            <p className="mt-2 font-display text-xl text-creme">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-cacau/70 bg-cacau-dark p-5">
        <h2 className="mb-4 text-sm font-semibold text-creme">Últimas encomendas</h2>
        {orders === null ? (
          <p className="py-6 text-center text-sm text-creme/40">A carregar…</p>
        ) : latest.length === 0 ? (
          <p className="py-6 text-center text-sm text-creme/40">Ainda não há encomendas.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-creme/40">
                <th className="pb-2 font-normal">Pedido</th>
                <th className="pb-2 font-normal">Cliente</th>
                <th className="pb-2 font-normal">Valor</th>
                <th className="pb-2 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((o) => (
                <tr key={o.id} className="border-t border-creme/5 text-creme/80">
                  <td className="py-2">#RD{o.order_number}</td>
                  <td className="py-2">{o.customers?.full_name || "—"}</td>
                  <td className="py-2">{formatPrice(o.total)}</td>
                  <td className="py-2">
                    <span className="rounded-full border border-laranja/40 px-2 py-0.5 text-xs text-laranja">
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
