"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/contexts/StoreContext";
import { requireAccount } from "@/lib/pending-action";
import { showToast } from "@/lib/toast";
import { formatPrice } from "@/lib/format";

export default function FavoritosPage() {
  const { favorites, toggleFavorite, addToCart, ready } = useStore();

  const remover = (id: string) => {
    const product = favorites.find((f) => f.id === id);
    if (!product) return;
    toggleFavorite(product);
    showToast("Removido dos favoritos");
  };

  const adicionar = async (id: string) => {
    const product = favorites.find((f) => f.id === id);
    if (!product) return;
    const ok = await requireAccount({ type: "add-to-cart", product });
    if (ok) {
      addToCart(product, 1);
      showToast("Adicionado ao carrinho");
    }
  };

  return (
    <main className="min-h-screen bg-cacau-darker px-6 pb-24 pt-28 lg:pt-36">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl text-creme">Os meus favoritos</h1>

        {!ready ? null : favorites.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="text-5xl">🤍</div>
            <h2 className="mt-4 font-display text-xl text-creme">Ainda não tens favoritos</h2>
            <p className="mt-2 max-w-xs text-sm text-creme/60">
              Toca no coração de um produto para o guardares aqui.
            </p>
            <Link href="/" className="mt-6 text-sm text-laranja hover:underline">
              ← Voltar à loja
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {favorites.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-cacau/70 bg-cacau-dark"
              >
                <Link href={`/produto/${p.id}`} className="relative block aspect-square bg-cacau">
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">📦</div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      remover(p.id);
                    }}
                    aria-label="Remover dos favoritos"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-preto/60 text-sm backdrop-blur-sm"
                  >
                    ❤️
                  </button>
                </Link>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-creme">{p.name}</p>
                  {p.brand && <p className="text-xs text-creme/50">{p.brand}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-laranja">{formatPrice(p.price)}</span>
                    <button
                      type="button"
                      onClick={() => adicionar(p.id)}
                      aria-label="Adicionar ao carrinho"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-laranja/60 text-sm font-bold text-laranja transition hover:bg-laranja hover:text-preto"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
