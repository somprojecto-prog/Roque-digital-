"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  products: { name: string } | null;
  customers: { full_name: string | null } | null;
}

export default function ManagerAvaliacoesPage() {
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("product_reviews")
      .select("id, rating, comment, created_at, products(name), customers(full_name)")
      .order("created_at", { ascending: false });
    setReviews((data as unknown as ReviewRow[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleHighlight = async (r: ReviewRow) => {
    const { error } = await supabase.from("testimonials").insert({
      author: r.customers?.full_name || "Cliente",
      location: null,
      stars: r.rating,
      text: r.comment,
    });
    if (!error) alert("Avaliação destacada como depoimento!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apagar esta avaliação definitivamente?")) return;
    await supabase.from("product_reviews").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Avaliações</h1>
      <p className="mt-1 max-w-xl text-sm text-creme/50">
        Avaliações deixadas pelos clientes em cada produto. Só aqui é possível apagar uma, ou
        destacá-la como depoimento na página inicial.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal">Produto</th>
              <th className="p-3 font-normal">Cliente</th>
              <th className="p-3 font-normal">Estrelas</th>
              <th className="p-3 font-normal">Comentário</th>
              <th className="p-3 font-normal">Data</th>
              <th className="p-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {reviews === null ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-creme/40">
                  Ainda não há avaliações.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="border-t border-creme/5 text-creme/80">
                  <td className="p-3">{r.products?.name || "—"}</td>
                  <td className="p-3">{r.customers?.full_name || "Cliente"}</td>
                  <td className="p-3 whitespace-nowrap text-laranja">
                    {"★".repeat(r.rating)}
                    <span className="text-creme/20">{"★".repeat(5 - r.rating)}</span>
                  </td>
                  <td className="max-w-[260px] p-3 text-creme/60">
                    {r.comment || <span className="text-creme/30">— sem comentário —</span>}
                  </td>
                  <td className="whitespace-nowrap p-3 text-creme/50">
                    {new Date(r.created_at).toLocaleDateString("pt-PT")}
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    {r.comment && (
                      <button onClick={() => handleHighlight(r)} className="mr-3 text-xs text-laranja">
                        Destacar
                      </button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-red-400">
                      Apagar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
