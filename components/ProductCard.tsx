"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/types/database";
import { formatPrice } from "@/lib/format";
import { toStoredProduct } from "@/lib/cart-favorites";
import { useStore } from "@/contexts/StoreContext";
import { requireAccount } from "@/lib/pending-action";
import { showToast } from "@/lib/toast";

export default function ProductCard({
  product,
  className = "",
  sizes = "(max-width: 768px) 40vw, 20vw",
}: {
  product: Product;
  className?: string;
  sizes?: string;
}) {
  const router = useRouter();
  const { toggleFavorite, isFavorite, addToCart } = useStore();
  const [favBusy, setFavBusy] = useState(false);

  const hasHoverImage = Boolean(product.image_url_hover);
  const price = product.promo_price ?? product.price;
  const hasPromo = product.promo_price != null && product.promo_price < product.price;
  const favorited = isFavorite(product.id);

  const goToProduct = () => router.push(`/produto/${product.id}`);

  const handleToggleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favBusy) return;
    setFavBusy(true);
    const stored = toStoredProduct(product);
    const ok = await requireAccount({ type: "toggle-fav", product: stored });
    if (ok) {
      const nowFav = toggleFavorite(stored);
      showToast(nowFav ? "Adicionado aos favoritos" : "Removido dos favoritos");
    }
    setFavBusy(false);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const stored = toStoredProduct(product);
    const ok = await requireAccount({ type: "add-to-cart", product: stored });
    if (ok) {
      addToCart(stored, 1);
      showToast("Adicionado ao carrinho");
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToProduct}
      onKeyDown={(e) => e.key === "Enter" && goToProduct()}
      className={`group relative block cursor-pointer overflow-hidden rounded-2xl border border-cacau/70 bg-cacau-dark transition-shadow duration-500 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-cacau">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes={sizes}
            className={`object-cover transition-opacity duration-500 ${
              hasHoverImage ? "group-hover:opacity-0" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">📦</div>
        )}

        {hasHoverImage && (
          <Image
            src={product.image_url_hover as string}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full border border-laranja/60 bg-preto/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-laranja">
            {product.tag}
          </span>
        )}

        {/* Favorito — ação rápida, sem sair do card */}
        <button
          type="button"
          onClick={handleToggleFav}
          aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-preto/55 text-sm text-creme backdrop-blur-sm transition hover:bg-preto/75"
        >
          {favorited ? "❤️" : "♡"}
        </button>

        {/* Sombra inferior para legibilidade do preço/nome */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-preto/85 to-transparent" />

        {/* Nome + preço, canto inferior esquerdo/direito + adicionar rápido */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-medium text-creme">{product.name}</p>
            <div className="flex items-baseline gap-1.5">
              {hasPromo && (
                <span className="text-[10px] text-creme/40 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              <p className="text-xs text-laranja">{formatPrice(price)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label="Adicionar ao carrinho"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-laranja/60 bg-preto/55 text-sm font-bold text-laranja backdrop-blur-sm transition hover:bg-laranja hover:text-preto"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
