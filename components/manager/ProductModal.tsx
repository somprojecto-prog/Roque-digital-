"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Category, Product } from "@/types/database";

async function uploadImagem(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("imagens").upload(nome, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("imagens").getPublicUrl(nome).data.publicUrl;
}

export default function ProductModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [tag, setTag] = useState("");
  const [active, setActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setBrand(product.brand || "");
      setCategoryId(product.category_id || categories[0]?.id || "");
      setPrice(String(product.price));
      setPromoPrice(product.promo_price != null ? String(product.promo_price) : "");
      setStock(String(product.stock ?? 0));
      setTag(product.tag || "");
      setActive(product.active);
      setImages(
        product.images && product.images.length > 0
          ? product.images
          : [product.image_url, product.image_url_hover].filter((v): v is string => Boolean(v))
      );
    } else {
      setCategoryId(categories[0]?.id || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImagem(file);
      setImages((prev) => [...prev, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !price) {
      setError("Preenche pelo menos o nome e o preço.");
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      brand: brand.trim() || null,
      category_id: categoryId || null,
      price: Number(price),
      promo_price: promoPrice ? Number(promoPrice) : null,
      stock: Number(stock) || 0,
      tag: tag.trim() || null,
      images,
      image_url: images[0] || null,
      image_url_hover: images[1] || null,
      active,
    };

    const { error: saveError } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-preto/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-cacau/70 bg-cacau-darker p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg text-creme">
            {product ? "Editar produto" : "Novo produto"}
          </h3>
          <button onClick={onClose} className="text-creme/50 hover:text-creme">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-creme/60">Nome *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-creme/60">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-creme/60">Marca</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-creme/60">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-field"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-creme/60">Preço (Kz) *</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-creme/60">Preço promo</label>
              <input
                type="number"
                min={0}
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-creme/60">Stock</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-creme/60">Etiqueta</label>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="NOVO, PROMOÇÃO..."
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-creme/60">Fotos do produto</label>
            <p className="mb-2 text-[11px] text-creme/40">
              A primeira é a foto de capa; a segunda aparece ao passar o rato.
            </p>
            <div className="mb-2 grid grid-cols-4 gap-2">
              {images.map((url, i) => (
                <div key={url + i} className="relative aspect-square overflow-hidden rounded-lg border border-creme/10">
                  <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-laranja px-1.5 py-0.5 text-[9px] font-bold text-preto">
                      CAPA
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-preto/70 text-[10px] text-creme"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-creme/20 text-[11px] text-creme/40 hover:border-laranja/50">
                {uploading ? "A enviar…" : "+ Foto"}
                <input type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} disabled={uploading} />
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-creme/70">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Produto ativo (visível na loja)
          </label>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-full bg-laranja py-2.5 text-sm font-semibold text-preto disabled:opacity-60"
          >
            {saving ? "A guardar…" : "Guardar produto"}
          </button>
        </form>
      </div>
    </div>
  );
}
