"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SECTION_DEFAULTS } from "@/lib/queries";
import type { Product } from "@/types/database";

interface SectionState {
  title: string;
  produtos: { id: string; name: string }[];
}

const SLUGS = Object.keys(SECTION_DEFAULTS);

export default function ManagerInicioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Record<string, SectionState>>({});
  const [selectValues, setSelectValues] = useState<Record<string, string>>({});
  const [statusBySlug, setStatusBySlug] = useState<Record<string, { text: string; ok: boolean } | null>>({});

  useEffect(() => {
    (async () => {
      const [{ data: prod }, { data: secoes }, { data: itens }] = await Promise.all([
        supabase.from("products").select("*").order("name"),
        supabase.from("home_sections").select("*"),
        supabase
          .from("home_section_products")
          .select("section_slug, position, products(id, name)")
          .order("position"),
      ]);

      setProducts(prod || []);

      const state: Record<string, SectionState> = {};
      SLUGS.forEach((slug) => {
        state[slug] = { title: "", produtos: [] };
      });
      (secoes || []).forEach((s) => {
        if (state[s.slug]) state[s.slug].title = s.title || "";
      });
      (itens || []).forEach((it) => {
        const p = it.products as unknown as { id: string; name: string } | null;
        if (state[it.section_slug] && p) state[it.section_slug].produtos.push(p);
      });
      setSections(state);
    })();
  }, []);

  const addProduct = (slug: string) => {
    const id = selectValues[slug];
    if (!id) return;
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setSections((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], produtos: [...prev[slug].produtos, { id: p.id, name: p.name }] },
    }));
    setSelectValues((prev) => ({ ...prev, [slug]: "" }));
  };

  const removeProduct = (slug: string, id: string) => {
    setSections((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], produtos: prev[slug].produtos.filter((p) => p.id !== id) },
    }));
  };

  const updateTitle = (slug: string, title: string) => {
    setSections((prev) => ({ ...prev, [slug]: { ...prev[slug], title } }));
  };

  const handleSave = async (slug: string) => {
    const section = sections[slug];
    const { error: e1 } = await supabase.from("home_sections").update({ title: section.title }).eq("slug", slug);
    await supabase.from("home_section_products").delete().eq("section_slug", slug);
    let e2 = null;
    if (section.produtos.length) {
      const rows = section.produtos.map((p, i) => ({ section_slug: slug, product_id: p.id, position: i }));
      const r = await supabase.from("home_section_products").insert(rows);
      e2 = r.error;
    }
    setStatusBySlug((prev) => ({
      ...prev,
      [slug]: e1 || e2 ? { text: `Erro: ${(e1 || e2)?.message}`, ok: false } : { text: "Guardado! Já se aplica à loja.", ok: true },
    }));
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Página inicial</h1>
      <p className="mt-1 max-w-xl text-sm text-creme/50">
        Muda o nome de cada barra e escolhe à mão os produtos que aparecem nela. Sem produtos
        escolhidos, a barra continua a preencher-se sozinha.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {SLUGS.map((slug) => {
          const section = sections[slug] || { title: "", produtos: [] };
          const available = products.filter((p) => !section.produtos.some((sp) => sp.id === p.id));
          const status = statusBySlug[slug];

          return (
            <div key={slug} className="max-w-xl rounded-2xl border border-cacau/70 bg-cacau-dark p-5">
              <h3 className="font-display text-lg text-creme">{SECTION_DEFAULTS[slug].title}</h3>

              <label className="mb-1.5 mt-4 block text-xs font-semibold text-creme/60">
                Nome da barra (aparece na loja)
              </label>
              <input
                value={section.title}
                onChange={(e) => updateTitle(slug, e.target.value)}
                className="input-field"
              />

              <p className="mb-2 mt-4 text-xs font-semibold text-creme/60">Produtos desta barra</p>
              <ul className="mb-3 flex flex-col divide-y divide-creme/5">
                {section.produtos.length === 0 ? (
                  <li className="py-2 text-sm text-creme/40">
                    Nenhum escolhido — a barra preenche-se sozinha
                  </li>
                ) : (
                  section.produtos.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2 text-sm text-creme/80">
                      {p.name}
                      <button onClick={() => removeProduct(slug, p.id)} className="font-bold text-red-400">
                        ✕
                      </button>
                    </li>
                  ))
                )}
              </ul>

              <div className="mb-4 flex gap-2">
                <select
                  value={selectValues[slug] || ""}
                  onChange={(e) => setSelectValues((prev) => ({ ...prev, [slug]: e.target.value }))}
                  className="input-field flex-1"
                >
                  <option value="">Escolher produto para adicionar…</option>
                  {available.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => addProduct(slug)}
                  className="shrink-0 rounded-full border border-laranja/60 px-4 text-sm text-laranja"
                >
                  + Adicionar
                </button>
              </div>

              <button
                onClick={() => handleSave(slug)}
                className="w-full rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto"
              >
                Guardar barra
              </button>
              {status && (
                <p className={`mt-2 text-center text-xs ${status.ok ? "text-green-400" : "text-red-400"}`}>
                  {status.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
