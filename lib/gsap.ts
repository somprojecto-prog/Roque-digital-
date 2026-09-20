"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

let registered = false;

/**
 * Regista os plugins GSAP apenas uma vez, do lado do cliente.
 * Chamar no topo de qualquer componente que use ScrollTrigger/Flip/ScrollTo.
 */
export function registerGsapPlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, Flip, ScrollToPlugin);
  registered = true;
}

export { gsap, ScrollTrigger, Flip, ScrollToPlugin };
