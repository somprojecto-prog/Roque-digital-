"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Customer } from "@/types/database";

export default function ManagerClientesPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const [{ data: cust }, { data: orders }] = await Promise.all([
        supabase.from("customers").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("customer_id"),
      ]);
      setCustomers(cust || []);
      const counts: Record<string, number> = {};
      (orders || []).forEach((o) => {
        if (!o.customer_id) return;
        counts[o.customer_id] = (counts[o.customer_id] || 0) + 1;
      });
      setOrderCounts(counts);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Clientes</h1>
      <p className="mt-1 text-sm text-creme/50">Pessoas que já fizeram encomendas na loja.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal">Nome</th>
              <th className="p-3 font-normal">Telefone</th>
              <th className="p-3 font-normal">Morada</th>
              <th className="p-3 font-normal">Encomendas</th>
            </tr>
          </thead>
          <tbody>
            {customers === null ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-creme/40">
                  Ainda não há clientes.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-t border-creme/5 text-creme/80">
                  <td className="p-3">{c.full_name || "—"}</td>
                  <td className="p-3">{c.phone || "—"}</td>
                  <td className="p-3 text-creme/50">{c.address || "—"}</td>
                  <td className="p-3">{orderCounts[c.id] || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
