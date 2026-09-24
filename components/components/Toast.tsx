"use client";

import { useEffect, useRef, useState } from "react";

export default function Toast() {
  const [state, setState] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, duration } = (e as CustomEvent<{ message: string; duration: number }>).detail;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setState({ message, visible: true });
      hideTimer.current = setTimeout(() => setState((s) => ({ ...s, visible: false })), duration);
    };

    window.addEventListener("rd-toast", handler);
    return () => {
      window.removeEventListener("rd-toast", handler);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[999] flex justify-center px-6 transition-all duration-300 ${
        state.visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="rounded-full bg-preto/90 px-5 py-2.5 text-center text-sm text-creme shadow-lg backdrop-blur-sm">
        {state.message}
      </div>
    </div>
  );
}
