"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS: { label: string | null; items: { href: string; label: string }[] }[] = [
  { label: null, items: [{ href: "/manager", label: "Dashboard" }] },
  {
    label: "Catálogo",
    items: [
      { href: "/manager/produtos", label: "Produtos" },
      { href: "/manager/categorias", label: "Categorias" },
      { href: "/manager/inventario", label: "Inventário" },
      { href: "/manager/avaliacoes", label: "Avaliações" },
      { href: "/manager/depoimentos", label: "Depoimentos" },
    ],
  },
  {
    label: "Vendas",
    items: [
      { href: "/manager/encomendas", label: "Encomendas" },
      { href: "/manager/clientes", label: "Clientes" },
      { href: "/manager/pagamentos", label: "Pagamentos" },
    ],
  },
  {
    label: "Conteúdo da loja",
    items: [
      { href: "/manager/inicio", label: "Início" },
      { href: "/manager/conteudo", label: "Textos do site" },
      { href: "/manager/imagens", label: "Imagens" },
    ],
  },
  { label: "Sistema", items: [{ href: "/manager/equipa", label: "Equipa" }] },
];

export default function ManagerSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-preto/60 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 shrink-0 overflow-y-auto border-r border-creme/10 bg-cacau-darker px-4 py-6 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/manager" className="mb-8 flex items-center gap-3 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-laranja/60 text-sm font-display text-laranja">
            RD
          </span>
          <span className="font-display text-sm leading-tight text-creme">
            Roque Digital
            <span className="block text-[10px] uppercase tracking-wide text-creme/40">
              Painel de gestão
            </span>
          </span>
        </Link>

        <nav className="flex flex-col gap-6">
          {NAV_GROUPS.map((group, i) => (
            <div key={i}>
              {group.label && (
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-creme/30">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-laranja/15 text-laranja"
                          : "text-creme/70 hover:bg-creme/5 hover:text-creme"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
