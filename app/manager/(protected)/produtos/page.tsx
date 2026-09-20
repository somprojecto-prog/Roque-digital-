"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/types/database";
import ProductModal from "@/components/manager/ProductModal";

type Filter = "todos" | "ativos" | "baixo";

export default function ManagerProdutosPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const load = async () => {
    const [{ data: prod }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setProducts(prod || []);
    setCategories(cats || []);
  };

  useEffect(() => {
    load();
  }, []);

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || "—";

  const filtered = (products || []).filter((p) => {
    if (filter === "ativos") return p.active;
    if (filter === "baixo") return (p.stock ?? 0) <= 5;
    return true;
  });

  const toggleActive = async (product: Product) => {
    await supabase.from("products").update({ active: !product.active }).eq("id", product.id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apagar este produto definitivamente?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setModalOpen(true);
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Produtos</h1>
      <p className="mt-1 text-sm text-creme/50">
        Gere o catálogo — nome, descrição, imagens, preço e stock.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["todos", "ativos", "baixo"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition ${
              filter === f
                ? "border-laranja bg-laranja/10 text-laranja"
                : "border-creme/15 text-creme/60 hover:border-creme/30"
            }`}
          >
            {f === "baixo" ? "Stock baixo" : f}
          </button>
        ))}
        <button
          onClick={openNew}
          className="ml-auto rounded-full bg-laranja px-4 py-1.5 text-xs font-semibold text-preto"
        >
          + Adicionar produto
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal"></th>
              <th className="p-3 font-normal">Produto</th>
              <th className="p-3 font-normal">Categoria</th>
              <th className="p-3 font-normal">Stock</th>
              <th className="p-3 font-normal">Preço</th>
              <th className="p-3 font-normal">Estado</th>
              <th className="p-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {products === null ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-creme/40">
                  Sem produtos.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-t border-creme/5 text-creme/80">
                  <td className="p-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-cacau">
                      {p.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-creme/50">{categoryName(p.category_id)}</td>
                  <td className="p-3">{p.stock ?? 0}</td>
                  <td className="p-3">
                    {p.promo_price ? (
                      <>
                        <span className="mr-1.5 text-creme/40 line-through">{formatPrice(p.price)}</span>
                        {formatPrice(p.promo_price)}
                      </>
                    ) : (
                      formatPrice(p.price)
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        p.active
                          ? "bg-green-500/15 text-green-400"
                          : "bg-creme/10 text-creme/40"
                      }`}
                    >
                      {p.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(p)} className="mr-3 text-xs text-laranja">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400">
                      Apagar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ProductModal
          product={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
