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
          900: "#06080d",
          800: "#0b1019",
          700: "#111927",
          600: "#1e293b",
        },
        breach: "#f43f5e",   // Crimson Breach
        shield: "#10b981",   // Emerald Shield
        taint: "#06b6d4",    // Cyan Taint
        alert: "#f59e0b",    // Amber Alert
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Courier New", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(to right, #111927 1px, transparent 1px), linear-gradient(to bottom, #111927 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
