import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#030508",
          900: "#05080e",
          850: "#0a101a",
          800: "#0f172a",
          700: "#1e293b",
          600: "#334155",
        },
        breach: "#f43f5e",   // Crimson Breach
        shield: "#10b981",   // Emerald Shield
        taint: "#06b6d4",    // Cyan Taint
        alert: "#f59e0b",    // Amber Alert
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(to right, rgba(17, 25, 39, 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 25, 39, 0.6) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
