"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Product } from "@/types/database";
import ProductCard from "./ProductCard";

export default function ProductRow({
  eyebrow,
  title,
  viewAllHref,
  products,
}: {
  eyebrow: string;
  title: string;
  viewAllHref: string;
  products: Product[];
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  if (products.length === 0) return null;

  const scrollBy = (amount: number) => {
    trackRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm text-laranja">{eyebrow}</p>
          <h2 className="mt-1 font-display text-2xl text-creme lg:text-3xl">{title}</h2>
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 text-sm text-creme/60 transition-colors hover:text-laranja"
        >
          Ver tudo →
        </Link>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[45vw] shrink-0 snap-start sm:w-[220px]">
              <ProductCard product={product} sizes="220px" />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Recuar"
          onClick={() => scrollBy(-460)}
          className="absolute -left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-creme/15 bg-cacau/40 text-creme backdrop-blur-md transition hover:border-laranja/50 hover:text-laranja sm:flex"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          aria-label="Avançar"
          onClick={() => scrollBy(460)}
          className="absolute -right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-creme/15 bg-cacau/40 text-creme backdrop-blur-md transition hover:border-laranja/50 hover:text-laranja sm:flex"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </section>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
