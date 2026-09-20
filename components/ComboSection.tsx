import Link from "next/link";
import type { Product } from "@/types/database";
import { formatPrice } from "@/lib/format";
import ProductCard from "./ProductCard";

/**
 * NOTA: o schema do teu parceiro ainda não tem um conceito de "combo"
 * (não há tabela nem campo para isso). Por agora, esta secção usa os 2
 * primeiros produtos passados via prop (tipicamente os 2 mais em
 * destaque) como par de exemplo. Quando houver um modelo de dados real
 * para combos, troca-se apenas a fonte destes 2 produtos.
 */
export default function ComboSection({ products }: { products: Product[] }) {
  const [main, secondary] = products;
  if (!main || !secondary) return null;

  const mainPrice = main.promo_price ?? main.price;
  const secondaryPrice = secondary.promo_price ?? secondary.price;
  const comboPrice = mainPrice + secondaryPrice;
  const savings = Math.round(comboPrice * 0.08);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Texto persuasivo */}
        <div className="order-2 lg:order-1">
          <p className="text-sm text-laranja">Combo exclusivo</p>
          <h2 className="mt-2 font-display text-3xl text-creme lg:text-4xl">
            Melhor juntos
          </h2>

          <div className="mt-8 flex flex-col gap-8">
            <ComboItem
              name={main.name}
              description={main.description || `Da marca ${main.brand || "Roque Digital"}.`}
              price={formatPrice(mainPrice)}
              href={`/produto/${main.id}`}
            />
            <ComboItem
              name={secondary.name}
              description={secondary.description || `Da marca ${secondary.brand || "Roque Digital"}.`}
              price={formatPrice(secondaryPrice)}
              href={`/produto/${secondary.id}`}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-baseline gap-3 border-t border-creme/10 pt-6">
            <span className="text-2xl text-creme">{formatPrice(comboPrice - savings)}</span>
            <span className="text-sm text-creme/40 line-through">{formatPrice(comboPrice)}</span>
            <span className="text-sm text-laranja">
              Poupe {formatPrice(savings)} ao levar os dois
            </span>
          </div>
        </div>

        {/* Cards de produto sobrepostos e flutuantes:
            caixinha maior mais à direita, caixinha menor mais à
            esquerda, cobrindo parcialmente a maior. */}
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto h-[360px] w-full max-w-md sm:h-[420px]">
            <div className="absolute right-0 top-2 w-[68%] shadow-[0_35px_65px_-20px_rgba(0,0,0,0.65)]">
              <ProductCard product={main} sizes="(max-width: 768px) 60vw, 320px" />
            </div>
            <div className="absolute bottom-2 left-0 w-[48%] shadow-[0_28px_55px_-16px_rgba(0,0,0,0.75)]">
              <ProductCard product={secondary} sizes="(max-width: 768px) 45vw, 220px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComboItem({
  name,
  description,
  price,
  href,
}: {
  name: string;
  description: string;
  price: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg text-creme transition-colors group-hover:text-laranja">{name}</h3>
        <span className="shrink-0 text-sm text-creme/60">{price}</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-creme/60">{description}</p>
    </Link>
  );
}
