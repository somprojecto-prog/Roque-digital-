"use client";

import { useRef, useState } from "react";
import type { SiteSettings } from "@/types/database";
import { formatPrice } from "@/lib/format";

// Usado apenas se site_settings.destaque_video_url ainda não estiver definido.
const FALLBACK_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export default function HighlightSection({
  siteSettings,
}: {
  siteSettings: SiteSettings | null;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  const videoUrl = siteSettings?.destaque_video_url || FALLBACK_VIDEO_URL;
  const titulo = siteSettings?.destaque_titulo || "Produto em destaque";
  const descricao =
    siteSettings?.destaque_descricao ||
    "Em breve, um novo produto em destaque, escolhido pela equipa Roque Digital.";
  const preco = siteSettings?.destaque_preco;

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <p className="text-sm text-laranja">Destaque</p>

      <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        {/* Vídeo cinematográfico */}
        <div className="group relative aspect-video w-full overflow-hidden rounded-[2rem] bg-preto shadow-[0_30px_70px_-25px_rgba(0,0,0,0.7)]">
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-preto/40 via-transparent to-transparent" />

          <button
            onClick={toggleSound}
            aria-label={muted ? "Ativar som" : "Silenciar vídeo"}
            className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-preto/50 text-creme opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
          >
            {muted ? <IconMuted /> : <IconSound />}
          </button>
        </div>

        {/* Informação do produto */}
        <div>
          <h2 className="font-display text-4xl font-semibold text-creme lg:text-5xl">{titulo}</h2>
          <p className="mt-4 text-base leading-relaxed text-creme/65 lg:text-lg">{descricao}</p>
          {preco != null && (
            <p className="mt-6 text-xl text-laranja">{formatPrice(preco)}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function IconMuted() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
      <path
        d="M16.5 8.5 21 13m0-4.5L16.5 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSound() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
      <path
        d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
