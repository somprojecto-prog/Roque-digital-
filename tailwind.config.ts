import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta obrigatória da marca Roque Digital
        cacau: {
          DEFAULT: "#3C1C05", // principal escura
          light: "#5A2C0C",
          lighter: "#7A3D14",
          dark: "#2A1403",
          darker: "#170A02",
        },
        creme: {
          DEFAULT: "#EBCBA9", // bege/creme
          light: "#F4E1CB",
          dark: "#D6B58E",
        },
        laranja: {
          DEFAULT: "#D9731A", // laranja destaque
          light: "#EB8B3A",
          dark: "#B25A12",
        },
        preto: "#000000",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "film-grain": "radial-gradient(circle at 1px 1px, rgba(235,203,169,0.04) 1px, transparent 0)",
      },
      keyframes: {
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-down": "fade-in-down 0.35s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
