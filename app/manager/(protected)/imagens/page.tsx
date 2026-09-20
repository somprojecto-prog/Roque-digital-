"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

async function uploadImagem(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("imagens").upload(nome, file);
  if (error) throw error;
  return supabase.storage.from("imagens").getPublicUrl(nome).data.publicUrl;
}

export default function ManagerImagensPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroUploading, setHeroUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("logo_url, hero_images")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        setLogoUrl(data?.logo_url || null);
        setHeroImages(Array.isArray(data?.hero_images) ? data.hero_images : []);
      });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadImagem(file);
      const { error } = await supabase.from("site_settings").update({ logo_url: url }).eq("id", 1);
      if (error) throw error;
      setLogoUrl(url);
      setStatus("Logótipo guardado e já aplicado ao site.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleAddHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroUploading(true);
    try {
      const url = await uploadImagem(file);
      const next = [...heroImages, url];
      const { error } = await supabase.from("site_settings").update({ hero_images: next }).eq("id", 1);
      if (error) throw error;
      setHeroImages(next);
      setStatus("Foto adicionada ao carrossel.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setHeroUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveHeroImage = async (index: number) => {
    if (!confirm("Remover esta foto do carrossel?")) return;
    const next = heroImages.filter((_, i) => i !== index);
    setHeroImages(next);
    await supabase.from("site_settings").update({ hero_images: next }).eq("id", 1);
    setStatus("Foto removida.");
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-creme">Imagens</h1>
      <p className="mt-1 text-sm text-creme/50">
        Substitui o logótipo e as imagens de fundo da página inicial.
      </p>

      <div className="mt-6 max-w-md rounded-2xl border border-cacau/70 bg-cacau-dark p-5">
        <p className="mb-2 text-xs font-semibold text-creme/60">Logótipo</p>
        <label className="flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-creme/20 text-xs text-creme/40 hover:border-laranja/50">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : logoUploading ? (
            "A enviar…"
          ) : (
            "Toque para escolher uma imagem"
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
        </label>
      </div>

      <div className="mt-6 max-w-md rounded-2xl border border-cacau/70 bg-cacau-dark p-5">
        <p className="text-xs font-semibold text-creme/60">Fotos do carrossel principal</p>
        <p className="mb-3 mt-1 text-[11px] text-creme/40">
          Adiciona quantas quiseres — passam automaticamente na loja.
        </p>
        <div className="mb-3 grid grid-cols-3 gap-2">
          {heroImages.map((url, i) => (
            <div key={url + i} className="relative aspect-square overflow-hidden rounded-lg border border-creme/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleRemoveHeroImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-preto/70 text-[10px] text-creme"
              >
                ✕
              </button>
            </div>
          ))}
          <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-creme/20 text-[11px] text-creme/40 hover:border-laranja/50">
            {heroUploading ? "A enviar…" : "+ Foto"}
            <input type="file" accept="image/*" className="hidden" onChange={handleAddHeroImage} disabled={heroUploading} />
          </label>
        </div>
        {heroImages.length === 0 && (
          <p className="text-xs text-creme/40">Ainda não há fotos no carrossel.</p>
        )}
      </div>

      {status && <p className="mt-4 text-xs text-creme/50">{status}</p>}
    </div>
  );
}
