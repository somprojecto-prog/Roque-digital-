"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Ecrã de "A carregar…" que aparece por instantes quando o site abre —
 * o mesmo efeito que existia em loja/index.html (#loading-overlay).
 *
 * Uso: colocar <LoadingOverlay /> logo no início do <body>, dentro do
 * ClientProviders (ou diretamente no layout.tsx), antes do resto do
 * conteúdo. Ele próprio trata de aparecer e desaparecer sozinho.
 */
export default function LoadingOverlay() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Tempo mínimo visível (para não "piscar" em ligações rápidas) e um
    // máximo de segurança, para nunca ficar preso caso algo demore demais.
    const minTimer = setTimeout(() => setHidden(true), 500);
    const safetyTimer = setTimeout(() => setHidden(true), 6000);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-[18px] bg-cacau-darker"
        >
          <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-laranja">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-full"
            >
              <Image src="/logo.png" alt="Roque Digital" width={96} height={96} className="h-full w-full object-cover" />
            </motion.div>
          </div>
          <motion.p
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="text-xs uppercase tracking-[.14em] text-creme/60"
          >
            A carregar…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
