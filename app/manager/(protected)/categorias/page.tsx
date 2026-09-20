"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/types/database";

export default function ManagerCategoriasPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("imagens").upload(fileName, file);
      if (error) throw error;
      setImageUrl(supabase.storage.from("imagens").getPublicUrl(fileName).data.publicUrl);
    } catch (err) {
      setStatus({ text: err instanceof Error ? err.message : "Erro ao enviar imagem.", ok: false });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setStatus({ text: "Escreve o nome da categoria.", ok: false });
      return;
    }
    const { error } = await supabase.from("categories").insert({ name: name.trim(), image_url: imageUrl });
    if (error) {
      setStatus({ text: error.message, ok: false });
      return;
    }
    setStatus({ text: "Categoria adicionada!", ok: true });
    setName("");
    setImageUrl(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apagar esta categoria? Os produtos ligados a ela ficam sem categoria.")) return;
    await supabase.from("categories").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Categorias</h1>
      <p className="mt-1 max-w-xl text-sm text-creme/50">
        Estas categorias aparecem no menu da loja e nas páginas de produto.
      </p>

      <div className="mt-6 max-w-md rounded-2xl border border-cacau/70 bg-cacau-dark p-5">
        <label className="mb-1.5 block text-xs font-semibold text-creme/60">Nome da categoria</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Ténis"
          className="input-field"
        />

        <label className="mb-1.5 mt-4 block text-xs font-semibold text-creme/60">Imagem</label>
        <label className="flex h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-creme/20 text-xs text-creme/40 hover:border-laranja/50">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : uploading ? (
            "A enviar…"
          ) : (
            "Toque para escolher uma imagem"
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>

        <button
          onClick={handleAdd}
          className="mt-4 w-full rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto"
        >
          + Adicionar categoria
        </button>
        {status && (
          <p className={`mt-3 text-center text-xs ${status.ok ? "text-green-400" : "text-red-400"}`}>
            {status.text}
          </p>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cacau/70 bg-cacau-dark">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-creme/40">
              <th className="p-3 font-normal"></th>
              <th className="p-3 font-normal">Categoria</th>
              <th className="p-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {categories === null ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-creme/40">
                  A carregar…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-creme/40">
                  Sem categorias.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-t border-creme/5 text-creme/80">
                  <td className="p-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-cacau">
                      {c.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400">
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
