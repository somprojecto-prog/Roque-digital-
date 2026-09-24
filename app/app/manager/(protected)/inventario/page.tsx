"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/database";

export default function ManagerInventarioPage() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => {
        setProducts([...(data || [])].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)));
      });
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Inventário</h1>
      <p className="mt-1 text-sm text-creme/50">
        Produtos ordenados por stock — os mais críticos aparecem primeiro.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal">Produto</th>
              <th className="p-3 font-normal">Stock</th>
              <th className="p-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {products === null ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-creme/40">
                  Sem produtos.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const critico = (p.stock ?? 0) <= 5;
                return (
                  <tr key={p.id} className="border-t border-creme/5 text-creme/80">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.stock ?? 0}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          critico ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"
                        }`}
                      >
                        {critico ? "Crítico" : "Normal"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
