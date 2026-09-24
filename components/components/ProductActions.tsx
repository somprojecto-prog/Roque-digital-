"use client";

import { useState } from "react";
import type { Product } from "@/types/database";
import { toStoredProduct } from "@/lib/cart-favorites";
import { useStore } from "@/contexts/StoreContext";
import { requireAccount } from "@/lib/pending-action";
import { showToast } from "@/lib/toast";

export default function ProductActions({ product }: { product: Product }) {
  const { toggleFavorite, isFavorite, addToCart } = useStore();
  const [busy, setBusy] = useState(false);
  const favorited = isFavorite(product.id);
  const inStock = (product.stock ?? 0) > 0;

  const handleAddToCart = async () => {
    if (busy || !inStock) return;
    setBusy(true);
    const stored = toStoredProduct(product);
    const ok = await requireAccount({ type: "add-to-cart", product: stored });
    if (ok) {
      addToCart(stored, 1);
      showToast("Adicionado ao carrinho");
    }
    setBusy(false);
  };

  const handleToggleFav = async () => {
    if (busy) return;
    setBusy(true);
    const stored = toStoredProduct(product);
    const ok = await requireAccount({ type: "toggle-fav", product: stored });
    if (ok) {
      const nowFav = toggleFavorite(stored);
      showToast(nowFav ? "Adicionado aos favoritos" : "Removido dos favoritos");
    }
    setBusy(false);
  };

  return (
    <div className="mt-8 flex gap-3">
      <button
        onClick={handleAddToCart}
        disabled={busy || !inStock}
        className="flex-1 rounded-full bg-laranja px-6 py-3 text-sm font-semibold text-preto transition hover:bg-laranja-light disabled:opacity-50"
      >
        {inStock ? "Adicionar ao carrinho" : "Sem stock"}
      </button>
      <button
        onClick={handleToggleFav}
        disabled={busy}
        aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-creme/20 text-creme transition hover:border-laranja/60 hover:text-laranja disabled:opacity-50"
      >
        {favorited ? "❤️" : "♡"}
      </button>
    </div>
  );
}
