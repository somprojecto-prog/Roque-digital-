"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/database";
import ProductCard from "./ProductCard";
import { gsap } from "@/lib/gsap";

const STEP_PX = 190; // distância horizontal entre posições — espaçamento visível
const DEPTH_STEP = 90; // profundidade (Z) entre cada posição sucessiva
const AUTO_ADVANCE_MS = 4500;
const TRANSITION_DURATION = 0.9; // segundos — deslize cinematográfico

/**
 * Calcula a distância circular (com sinal) entre `index` e `center`,
 * dentro de um total de `total` posições — ex: com total=9, o índice
 * imediatamente antes do 0 tem offset -1, não +8.
 */
function getCircularOffset(index: number, center: number, total: number) {
  let diff = (index - center) % total;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

type CardPath =
  | { wraps: false; from: number; to: number }
  | { wraps: true; from: number; exitEdge: number; entryEdge: number; to: number };

export default function FeaturedCarousel({
  products,
  title = "🔥 Produtos em destaque",
  eyebrow = "Destaques",
}: {
  products: Product[];
  title?: string;
  eyebrow?: string;
}) {
  const TOTAL = products.length;
  const MAX_OFFSET = Math.max(1, Math.floor(TOTAL / 2));
  const step = Math.min(2, MAX_OFFSET);

  const [centerIndex, setCenterIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const centerIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const computeCardStyle = (offset: number) => {
    const abs = Math.min(Math.abs(offset), MAX_OFFSET);
    const translateZ = -(MAX_OFFSET - abs) * DEPTH_STEP;
    const translateX = offset * STEP_PX;
    const rotateY = offset * -8;
    const scale = 0.76 + (abs / MAX_OFFSET) * 0.26;
    const opacity = 0.6 + (abs / MAX_OFFSET) * 0.4;
    const zIndex = 50 + abs * 10;
    return { translateX, translateZ, rotateY, scale, opacity, zIndex };
  };

  const applyCardStyle = (el: HTMLDivElement, offset: number, opacityMultiplier: number) => {
    const s = computeCardStyle(offset);
    el.style.transform = `translate(-50%, -50%) translate3d(${s.translateX}px, 0px, ${s.translateZ}px) rotateY(${s.rotateY}deg) scale(${s.scale})`;
    el.style.opacity = String(s.opacity * opacityMultiplier);
    el.style.zIndex = String(Math.round(s.zIndex));
  };

  useEffect(() => {
    centerIndexRef.current = centerIndex;
  }, [centerIndex]);

  useEffect(() => {
    if (paused || TOTAL < 2) return;
    const id = setInterval(() => advance(1, 1), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, TOTAL]);

  const advance = (direction: 1 | -1, stepSize: number) => {
    if (isAnimatingRef.current || TOTAL < 2) return;

    const oldCenter = centerIndexRef.current;
    const newCenter = (oldCenter + direction * stepSize + TOTAL * stepSize) % TOTAL;
    const stepDelta = -direction * stepSize;

    const paths: CardPath[] = products.map((_, i) => {
      const from = getCircularOffset(i, oldCenter, TOTAL);
      const to = getCircularOffset(i, newCenter, TOTAL);
      const rawTarget = from + stepDelta;

      if (rawTarget >= -MAX_OFFSET && rawTarget <= MAX_OFFSET) {
        return { wraps: false, from, to };
      }

      const exitEdge = rawTarget < -MAX_OFFSET ? -MAX_OFFSET : MAX_OFFSET;
      const entryEdge = rawTarget < -MAX_OFFSET ? MAX_OFFSET : -MAX_OFFSET;
      return { wraps: true, from, exitEdge, entryEdge, to };
    });

    isAnimatingRef.current = true;
    const proxy = { t: 0 };

    gsap.to(proxy, {
      t: 1,
      duration: TRANSITION_DURATION,
      ease: "power3.inOut",
      onUpdate: () => {
        const t = proxy.t;
        paths.forEach((path, i) => {
          const el = cardRefs.current[i];
          if (!el) return;

          if (!path.wraps) {
            const offset = path.from + (path.to - path.from) * t;
            applyCardStyle(el, offset, 1);
            return;
          }

          if (t < 0.5) {
            const localT = t / 0.5;
            const offset = path.from + (path.exitEdge - path.from) * localT;
            applyCardStyle(el, offset, 1 - localT);
          } else {
            const localT = (t - 0.5) / 0.5;
            const offset = path.entryEdge + (path.to - path.entryEdge) * localT;
            applyCardStyle(el, offset, localT);
          }
        });
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        setCenterIndex(newCenter);
      },
    });
  };

  if (TOTAL === 0) return null;

  return (
    <section className="relative overflow-hidden bg-cacau-darker py-20 lg:py-28">
      <div className="mx-auto mb-10 max-w-7xl px-6 lg:px-10">
        <p className="text-sm text-laranja">{eyebrow}</p>
        <h2 className="mt-1 font-display text-3xl text-creme lg:text-4xl">{title}</h2>
      </div>

      <div
        className="relative mx-auto flex h-[380px] max-w-7xl items-center justify-center [perspective:1400px] sm:h-[440px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {products.map((product, i) => {
          const offset = getCircularOffset(i, centerIndex, TOTAL);
          const s = computeCardStyle(offset);

          return (
            <div
              key={product.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 w-[168px] sm:w-[200px] lg:w-[220px]"
              style={{
                transform: `translate(-50%, -50%) translate3d(${s.translateX}px, 0px, ${s.translateZ}px) rotateY(${s.rotateY}deg) scale(${s.scale})`,
                opacity: s.opacity,
                zIndex: s.zIndex,
                willChange: "transform, opacity",
              }}
            >
              <ProductCard product={product} sizes="220px" />
            </div>
          );
        })}

        {TOTAL > 1 && (
          <>
            <button
              type="button"
              aria-label="Produtos anteriores"
              onClick={() => advance(-1, step)}
              className="absolute left-3 top-1/2 z-[200] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-creme/15 bg-cacau/40 text-creme backdrop-blur-md transition hover:border-laranja/50 hover:text-laranja sm:left-6"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Próximos produtos"
              onClick={() => advance(1, step)}
              className="absolute right-3 top-1/2 z-[200] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-creme/15 bg-cacau/40 text-creme backdrop-blur-md transition hover:border-laranja/50 hover:text-laranja sm:right-6"
            >
              <ArrowIcon direction="right" />
            </button>
          </>
        )}
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
