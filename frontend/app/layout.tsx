import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INTERPOSE // Sentinel Cyber-Defense HUD",
  description: "Deterministic Security Reference Monitor, Dynamic Taint Tracking & Adaptive Red-Teaming for Tool-Calling AI Agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans bg-obsidian-950 text-slate-100 selection:bg-taint/30 selection:text-taint">
        {children}
      </body>
    </html>
  );
}
