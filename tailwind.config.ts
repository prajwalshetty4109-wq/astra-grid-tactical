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
          DEFAULT: "#000000",
          950: "#050505",
          900: "#0A0A0A",
          850: "#121212",
          800: "#171717",
          700: "#262626",
          600: "#404040",
          500: "#737373",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        "3d-card": "0 20px 50px rgba(0, 0, 0, 0.9), 0 1px 0 rgba(255, 255, 255, 0.15) inset, 0 -1px 0 rgba(0, 0, 0, 0.8) inset",
        "3d-card-hover": "0 30px 60px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.3) inset, 0 0 20px rgba(255, 255, 255, 0.1)",
        "3d-button": "0 4px 14px rgba(255, 255, 255, 0.25), 0 1px 0 rgba(255, 255, 255, 0.5) inset",
        "3d-subtle": "0 10px 30px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.1) inset",
      },
    },
  },
  plugins: [],
};

export default config;
