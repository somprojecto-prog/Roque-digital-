"use client";

import { useRef, useState } from "react";
import type { Product } from "@/types/database";
import ProductCard from "./ProductCard";
import { gsap, registerGsapPlugins } from "@/lib/gsap";

const INITIAL_COUNT = 8; // 2 fileiras de 4
const BATCH_SIZE = 12; // sempre em grupos de 4 colunas (3 fileiras de 4)
const COLUMN_COUNT = 4;
const DURATION_PER_COLUMN = 0.7; // segundos, conforme especificação
const HEADER_OFFSET = 96; // espaço reservado para o header fixo

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

export default function DiverseGrid({ products }: { products: Product[] }) {
  const [visibleCount, setVisibleCount] = useState(Math.min(INITIAL_COUNT, products.length));
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const total = products.length;
  const initialProducts = products.slice(0, INITIAL_COUNT);
  const extraRows = chunk(products.slice(INITIAL_COUNT, visibleCount), COLUMN_COUNT);
  const canExpand = visibleCount < total;
  const canCollapse = visibleCount > Math.min(INITIAL_COUNT, total);

  const handleVerMais = () => {
    if (isAnimating) return;
    const previousRowCount = extraRows.length;
    const nextCount = Math.min(visibleCount + BATCH_SIZE, total);
    setVisibleCount(nextCount);

    // Entrada tipo "folhear caderno": cada fileira nova surge de baixo
    // para cima, com uma ligeira rotação 3D, uma a seguir à outra.
    // Não mexe no scroll da página — a página não se move.
    requestAnimationFrame(() => {
      const newRows = rowRefs.current.slice(previousRowCount).filter(Boolean) as HTMLDivElement[];
      if (newRows.length === 0) return;

      gsap.set(newRows, { transformPerspective: 900, transformOrigin: "top center" });

      const tl = gsap.timeline();
      newRows.forEach((rowEl, index) => {
        tl.fromTo(
          rowEl,
          { opacity: 0, y: 36, rotateX: -18 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: DURATION_PER_COLUMN * 0.75,
            ease: "power2.out",
          },
          index * (DURATION_PER_COLUMN * 0.55)
        );
      });
    });
  };

  const handleVerMenos = () => {
    if (isAnimating || extraRows.length === 0) return;
    setIsAnimating(true);
    registerGsapPlugins();

    const rowEls = rowRefs.current.slice(0, extraRows.length).filter(Boolean) as HTMLDivElement[];
    // De baixo para cima: a fileira mais abaixo desaparece primeiro.
    const orderedRows = [...rowEls].reverse();
    const totalDuration = orderedRows.length * DURATION_PER_COLUMN;

    // Alvo do scroll: o topo da secção "Diversos", com espaço para o
    // header fixo. Como as fileiras que vão desaparecer ficam sempre
    // abaixo deste ponto, a posição-alvo não muda durante a animação.
    const sectionTop =
      (sectionRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    const targetScrollY = Math.max(sectionTop - HEADER_OFFSET, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        setVisibleCount(Math.min(INITIAL_COUNT, total));
        setIsAnimating(false);
        rowRefs.current = [];
      },
    });

    // Scroll sincronizado com o mesmo timeline, começando ao mesmo tempo
    // e com a mesma duração total das colunas — sobem ao mesmo ritmo.
    tl.to(
      window,
      {
        scrollTo: { y: targetScrollY, autoKill: false },
        duration: totalDuration,
        ease: "power1.inOut",
      },
      0
    );

    orderedRows.forEach((rowEl, index) => {
      const start = index * DURATION_PER_COLUMN;
      const cards = Array.from(rowEl.children);

      tl.to(
        cards,
        {
          y: -50,
          x: 60,
          opacity: 0,
          duration: DURATION_PER_COLUMN * 0.75,
          ease: "power2.in",
        },
        start
      ).to(
        rowEl,
        {
          height: 0,
          marginTop: 0,
          opacity: 0,
          duration: DURATION_PER_COLUMN * 0.5,
          ease: "power2.inOut",
          onStart: () => {
            gsap.set(rowEl, { height: rowEl.offsetHeight, overflow: "hidden" });
          },
        },
        start + DURATION_PER_COLUMN * 0.35
      );
    });
  };

  if (total === 0) return null;

  return (
    <section
      ref={sectionRef}
      style={{ overflowAnchor: "none" }}
      className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 lg:px-10 lg:py-28"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Coluna principal: título + grid */}
        <div className="min-w-0 flex-1">
          <h2 className="mb-10 font-display text-3xl text-creme lg:text-4xl">
            Diversos
          </h2>

          {/* Fileiras iniciais (fixas) */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {initialProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sizes="(max-width: 768px) 45vw, 22vw"
              />
            ))}
          </div>

          {/* Fileiras extra — cada uma é o seu próprio elemento, para
              poder encolher de altura de forma independente ao colapsar. */}
          {extraRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
              className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:mt-5 lg:grid-cols-4 lg:gap-5"
            >
              {row.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  sizes="(max-width: 768px) 45vw, 22vw"
                />
              ))}
            </div>
          ))}

          {canCollapse && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleVerMenos}
                disabled={isAnimating}
                className="rounded-full border border-creme/25 px-6 py-2 text-sm text-creme/80 transition-colors hover:border-laranja hover:text-laranja disabled:opacity-40"
              >
                Ver menos
              </button>
            </div>
          )}
        </div>

        {/* Coluna lateral: botão "Ver mais", segue o utilizador no scroll */}
        {canExpand && (
          <div className="shrink-0 lg:sticky lg:top-24 lg:self-start">
            <button
              onClick={handleVerMais}
              disabled={isAnimating}
              className="rounded-full border border-creme/25 px-5 py-2 text-sm text-creme/80 transition-colors hover:border-laranja hover:text-laranja disabled:opacity-40"
            >
              Ver mais
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
