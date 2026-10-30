import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#07090E",
          950: "#040508",
          900: "#07090E",
          850: "#0B0E17",
          800: "#0F1420",
          700: "#182030",
          600: "#243048",
        },
        slate: {
          850: "#131B2E",
          950: "#090D16",
        },
        tactical: {
          cyan: "#00F0FF",
          "cyan-dim": "#00A8B3",
          amber: "#F59E0B",
          crimson: "#EF4444",
          emerald: "#10B981",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      backgroundImage: {
        "tactical-grid": "radial-gradient(circle, rgba(0, 240, 255, 0.05) 1px, transparent 1px)",
        "radar-sweep": "conic-gradient(from 0deg at 50% 50%, rgba(0, 240, 255, 0.15) 0deg, transparent 60deg, transparent 360deg)",
      },
      boxShadow: {
        "cyan-glow": "0 0 15px rgba(0, 240, 255, 0.25)",
        "amber-glow": "0 0 15px rgba(245, 158, 11, 0.25)",
        "crimson-glow": "0 0 15px rgba(239, 68, 68, 0.35)",
        "emerald-glow": "0 0 15px rgba(16, 185, 129, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
