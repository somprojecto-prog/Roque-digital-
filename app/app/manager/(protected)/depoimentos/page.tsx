"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Testimonial } from "@/types/database";

export default function ManagerDepoimentosPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    setTestimonials(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!author.trim() || !text.trim()) {
      setStatus({ text: "Preenche pelo menos o nome e o texto.", ok: false });
      return;
    }
    const { error } = await supabase
      .from("testimonials")
      .insert({ author: author.trim(), location: location.trim() || null, stars, text: text.trim() });
    if (error) {
      setStatus({ text: error.message, ok: false });
      return;
    }
    setStatus({ text: "Depoimento adicionado!", ok: true });
    setAuthor("");
    setLocation("");
    setText("");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apagar este depoimento?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Depoimentos</h1>
      <p className="mt-1 max-w-xl text-sm text-creme/50">
        Aparecem na secção "O que dizem os nossos clientes" da página inicial. Escreve um à mão
        ou destaca uma avaliação real no separador Avaliações.
      </p>

      <div className="mt-6 max-w-md rounded-2xl border border-cacau/70 bg-cacau-dark p-5">
        <div className="flex flex-col gap-3">
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nome" className="input-field" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Localidade (opcional)"
            className="input-field"
          />
          <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="input-field">
            <option value={5}>★★★★★ (5)</option>
            <option value={4}>★★★★☆ (4)</option>
            <option value={3}>★★★☆☆ (3)</option>
            <option value={2}>★★☆☆☆ (2)</option>
            <option value={1}>★☆☆☆☆ (1)</option>
          </select>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="O que o cliente disse..."
            className="input-field"
          />
          <button onClick={handleAdd} className="rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto">
            + Adicionar depoimento
          </button>
          {status && (
            <p className={`text-center text-xs ${status.ok ? "text-green-400" : "text-red-400"}`}>
              {status.text}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal">Nome</th>
              <th className="p-3 font-normal">Estrelas</th>
              <th className="p-3 font-normal">Texto</th>
              <th className="p-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {testimonials === null ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : testimonials.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-creme/40">
                  Ainda não há depoimentos — a página inicial não mostra a secção.
                </td>
              </tr>
            ) : (
              testimonials.map((t) => (
                <tr key={t.id} className="border-t border-creme/5 text-creme/80">
                  <td className="p-3">{t.location ? `${t.author}, ${t.location}` : t.author}</td>
                  <td className="whitespace-nowrap p-3 text-laranja">
                    {"★".repeat(t.stars)}
                    <span className="text-creme/20">{"★".repeat(5 - t.stars)}</span>
                  </td>
                  <td className="max-w-[320px] p-3 text-creme/60">{t.text}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400">
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
