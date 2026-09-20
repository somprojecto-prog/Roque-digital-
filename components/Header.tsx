"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Category } from "@/types/database";
import { useStore } from "@/contexts/StoreContext";

export default function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { cartCount, favCount } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // ATENÇÃO FUTURA: com mais de 3 categorias, a navegação inteira
  // (incluindo desktop) passa a usar o menu hamburger + drawer lateral,
  // em vez da lista inline — mantém-se legível com um catálogo a crescer.
  const showHamburgerAlways = categories.length > 3;

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    window.location.href = `/pesquisa?q=${encodeURIComponent(searchValue.trim())}`;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-creme/10 bg-preto/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4 lg:px-10">
        {/* Logo + nome */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full border border-laranja/60 text-sm font-display text-laranja"
          >
            RD
          </span>
          <span className="hidden font-display text-lg tracking-tight text-creme sm:inline">
            Roque Digital
          </span>
        </Link>

        {/* Navegação desktop inline — apenas quando existirem 3 ou menos categorias */}
        {!showHamburgerAlways && (
          <ul className="hidden items-center gap-2 lg:flex">
            <NavPill href="/" active={pathname === "/"} label="Início" />
            {categories.map((cat) => (
              <li key={cat.id}>
                <NavPill
                  href={`/categoria/${cat.id}`}
                  active={isActive(`/categoria/${cat.id}`)}
                  label={cat.name}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {/* Pesquisa */}
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Pesquisar..."
              aria-hidden={!searchOpen}
              tabIndex={searchOpen ? 0 : -1}
              className={`h-10 rounded-full border border-creme/15 bg-preto/40 text-sm text-creme placeholder:text-creme/40 transition-all duration-300 focus:border-laranja/50 focus:outline-none ${
                searchOpen
                  ? "w-36 px-4 opacity-100 sm:w-52"
                  : "w-0 border-transparent px-0 opacity-0"
              }`}
            />
            <button
              type="button"
              aria-label={searchOpen ? "Fechar pesquisa" : "Pesquisar produtos"}
              onClick={() => setSearchOpen((prev) => !prev)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-creme/20 text-creme transition hover:border-laranja/60 hover:text-laranja"
            >
              <SearchIcon />
            </button>
          </form>

          {/* Carrinho + Favoritos */}
          <Link
            href="/favoritos"
            aria-label="Favoritos"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-creme/20 text-creme transition hover:border-laranja/60 hover:text-laranja sm:flex"
          >
            <HeartIcon />
            {favCount > 0 && <Badge count={favCount} />}
          </Link>
          <Link
            href="/carrinho"
            aria-label="Carrinho"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-creme/20 text-creme transition hover:border-laranja/60 hover:text-laranja sm:flex"
          >
            <BagIcon />
            {cartCount > 0 && <Badge count={cartCount} />}
          </Link>

          {/* Botão hamburger: sempre visível em mobile; visível também em
              desktop se o número de categorias ultrapassar 3. */}
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setDrawerOpen(true)}
            className={`flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-creme/20 transition hover:border-laranja/60 ${
              showHamburgerAlways ? "flex" : "lg:hidden"
            }`}
          >
            <span className="h-px w-4 bg-creme" />
            <span className="h-px w-4 bg-creme" />
          </button>
        </div>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
      />
    </header>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-laranja px-1 text-[10px] font-bold text-preto">
      {count}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20.5s-7.5-4.6-9.8-9.1C.7 8.2 2.2 5 5.4 4.4c2-.4 3.8.5 5 2.1a5.9 5.9 0 0 1 1.6-2c1.5-1.3 3.6-1.8 5.4-1 3 1.2 4 4.6 2.4 7.9-2.3 4.5-9.8 9.1-9.8 9.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 8.5h12l-.9 11a2 2 0 0 1-2 1.9H8.9a2 2 0 0 1-2-1.9L6 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function NavPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm transition-all duration-300 ${
        active
          ? "border border-laranja/70 text-creme shadow-[0_0_18px_-6px_rgba(217,115,26,0.7)]"
          : "border border-transparent text-creme/70 hover:text-creme"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileDrawer({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}) {
  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-preto/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-[80%] max-w-sm flex-col bg-cacau-darker px-7 py-8 shadow-2xl transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <span className="font-display text-lg text-creme">Roque Digital</span>
          <button
            aria-label="Fechar menu"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-creme/20 text-creme"
          >
            ×
          </button>
        </div>

        <Link href="/" onClick={onClose} className="border-b border-creme/10 py-4 text-creme/90">
          Início
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categoria/${cat.id}`}
            onClick={onClose}
            className="border-b border-creme/10 py-4 text-creme/90"
          >
            {cat.name}
          </Link>
        ))}
        <Link href="/favoritos" onClick={onClose} className="border-b border-creme/10 py-4 text-creme/90">
          Favoritos
        </Link>
        <Link href="/carrinho" onClick={onClose} className="border-b border-creme/10 py-4 text-creme/90">
          Carrinho
        </Link>
        <Link href="/conta" onClick={onClose} className="border-b border-creme/10 py-4 text-creme/90">
          A minha conta
        </Link>
      </aside>
    </div>
  );
}
