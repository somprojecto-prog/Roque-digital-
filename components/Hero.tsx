"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Product, SiteSettings } from "@/types/database";
import { gsap } from "@/lib/gsap";

const ROTATION_INTERVAL_MS = 4000;
const CROSSFADE_DURATION_S = 0.4;

const FALLBACK_BACKGROUND =
  "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=2400&q=80";

export default function Hero({
  siteSettings,
  rotatorProducts,
}: {
  siteSettings: SiteSettings | null;
  rotatorProducts: Product[];
}) {
  const backgrounds =
    siteSettings?.hero_images && siteSettings.hero_images.length > 0
      ? siteSettings.hero_images
      : [siteSettings?.hero_url || FALLBACK_BACKGROUND];

  const [bgIndex, setBgIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef({ startX: 0, startY: 0, baseX: 0, baseY: 0, dragging: false });

  // Carrossel de fundo do hero (imagens reais de site_settings.hero_images).
  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgrounds.length]);

  useEffect(() => {
    bgRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, { opacity: i === bgIndex ? 1 : 0, duration: 1, ease: "power1.inOut" });
    });
  }, [bgIndex]);

  // Widget flutuante — mostra produtos reais (destaques), com crossfade.
  useEffect(() => {
    if (rotatorProducts.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % rotatorProducts.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [rotatorProducts.length]);

  useEffect(() => {
    imageRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        opacity: i === activeIndex ? 1 : 0,
        duration: CROSSFADE_DURATION_S,
        ease: "power1.inOut",
      });
    });
  }, [activeIndex]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: dragOffset.x,
      baseY: dragOffset.y,
      dragging: true,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setDragOffset({ x: dragState.current.baseX + dx, y: dragState.current.baseY + dy });
  };

  const onPointerUp = () => {
    dragState.current.dragging = false;
  };

  return (
    <section className="relative flex h-[100svh] w-full items-end overflow-hidden bg-preto">
      {/* Fundo cinematográfico — imagens reais do site_settings */}
      {backgrounds.map((src, i) => (
        <div
          key={src + i}
          ref={(el) => {
            bgRefs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-preto via-preto/50 to-cacau-darker/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-preto/60 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-28 pt-40 lg:px-10 lg:pb-32">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl leading-[1.1] text-creme sm:text-5xl lg:text-6xl">
            {siteSettings?.hero_titulo || "Tecnologia, moda e beleza, com a mesma atenção ao detalhe."}
          </h1>
          <p className="mt-5 max-w-md text-base text-creme/70 lg:text-lg">
            {siteSettings?.hero_descricao ||
              "Uma seleção cuidada de peças e dispositivos, escolhidos para durar e para fazer bem à vista."}
          </p>
        </div>
      </div>

      {/* Widget rotativo — produtos em destaque reais, flutuante e arrastável */}
      {rotatorProducts.length > 0 && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            touchAction: "none",
          }}
          className="absolute bottom-8 right-6 z-10 flex cursor-grab flex-col items-center gap-3 active:cursor-grabbing lg:bottom-14 lg:right-14"
        >
          <div className="animate-float flex flex-col items-center gap-3">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-creme/20 shadow-[0_25px_55px_-12px_rgba(0,0,0,0.85)] sm:h-36 sm:w-36 lg:h-44 lg:w-44">
              {rotatorProducts.map((product, i) => (
                <div
                  key={product.id}
                  ref={(el) => {
                    imageRefs.current[i] = el;
                  }}
                  className="absolute inset-0"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      draggable={false}
                      className="object-cover"
                      sizes="176px"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-preto/80 to-transparent px-3 py-2">
                    <p className="truncate text-[11px] text-creme/90">{product.name}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {rotatorProducts.map((product, i) => (
                <button
                  key={product.id}
                  aria-label={`Mostrar ${product.name}`}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex ? "w-5 bg-laranja" : "w-1.5 bg-creme/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
