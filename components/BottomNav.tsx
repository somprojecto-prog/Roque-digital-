"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Barra fixa no fundo do ecrã, com Início / Carrinho / Favoritos / Pesquisar
 * — a mesma que existia em loja/index.html (<nav class="bottom-nav">).
 *
 * Uso: colocar <BottomNav /> uma vez, dentro do ClientProviders ou do
 * layout.tsx, fora de cada página. E adicionar padding-bottom (ex: pb-20)
 * ao contentor principal das páginas, para o conteúdo não ficar escondido
 * atrás dela.
 *
 * NOTA para o teu parceiro: os contadores do carrinho/favoritos aqui em
 * baixo leem por omissão o localStorage ("rd_cart" / "rd_favs"), para
 * funcionar já sem depender de mais nada. Se já tiveres um CartContext /
 * FavoritesContext próprio no projeto, o ideal é trocar os dois `useEffect`
 * abaixo pelos hooks reais (ex: `const { count } = useCart()`), para os
 * números ficarem sempre sincronizados ao instante.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    const lerContadores = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("rd_cart") || "[]");
        setCartCount(cart.reduce((n: number, i: { qty?: number }) => n + (i.qty || 1), 0));
      } catch {
        setCartCount(0);
      }
      try {
        const favs = JSON.parse(localStorage.getItem("rd_favs") || "[]");
        setFavCount(Array.isArray(favs) ? favs.length : 0);
      } catch {
        setFavCount(0);
      }
    };

    lerContadores();
    window.addEventListener("storage", lerContadores);
    window.addEventListener("rd:cart-updated", lerContadores);
    window.addEventListener("rd:favs-updated", lerContadores);
    return () => {
      window.removeEventListener("storage", lerContadores);
      window.removeEventListener("rd:cart-updated", lerContadores);
      window.removeEventListener("rd:favs-updated", lerContadores);
    };
  }, []);

  const abrirPesquisa = (e: React.MouseEvent) => {
    e.preventDefault();
    // Se já tiveres um componente de pesquisa (modal/overlay), troca esta
    // linha por, por exemplo, `setSearchOpen(true)` do teu contexto.
    // Por omissão, dispara um evento global que esse componente pode ouvir,
    // e também tenta navegar para /pesquisa como reserva.
    window.dispatchEvent(new CustomEvent("rd:toggle-search"));
    router.push("/pesquisa");
  };

  const itens = [
    {
      href: "/",
      label: "Início",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 9.5V20a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5" />
        </svg>
      ),
      badge: null as number | null,
    },
    {
      href: "/carrinho",
      label: "Carrinho",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M3 3h2l2.4 12.4A2 2 0 0 0 9.36 17H18a2 2 0 0 0 1.98-1.7L21 8H6" />
          <circle cx="9.5" cy="20.5" r="1.5" />
          <circle cx="17.5" cy="20.5" r="1.5" />
        </svg>
      ),
      badge: cartCount,
    },
    {
      href: "/favoritos",
      label: "Favoritos",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2.3 4 6.3 4c2 0 3.6 1.2 5.7 3.6C14.1 5.2 15.7 4 17.7 4c4 0 5.9 4 4.3 7.7-2.5 4.7-10 9.3-10 9.3z" />
        </svg>
      ),
      badge: favCount,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t border-cacau bg-cacau-darker pb-[env(safe-area-inset-bottom)] text-creme/60">
      {itens.map((item) => {
        const ativo = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
              ativo ? "text-laranja" : "hover:text-creme"
            }`}
          >
            {item.icon}
            {item.label}
            {item.badge != null && item.badge > 0 && (
              <span className="absolute right-[22%] top-1 min-w-[16px] rounded-full bg-laranja px-1 text-center text-[10px] font-bold leading-4 text-preto">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
      <button
        onClick={abrirPesquisa}
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors hover:text-creme"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Pesquisar
      </button>
    </nav>
  );
}
