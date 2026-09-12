"use client";

import React from "react";
import {
  Shield,
  ShieldAlert,
  Cpu,
  Activity,
  Zap,
  ExternalLink,
  Layers,
  Terminal,
  Lock,
} from "lucide-react";

export type CockpitTab =
  | "cockpit"
  | "adversary"
  | "lattice"
  | "hitl"
  | "benchmarks"
  | "ledger";

interface HeaderProps {
  isLive: boolean;
  onToggleLive: (live: boolean) => void;
  activeTab: CockpitTab;
  setActiveTab: (tab: CockpitTab) => void;
  pendingIncidentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isLive,
  onToggleLive,
  activeTab,
  setActiveTab,
  pendingIncidentCount,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#02050b]/90 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
      {/* Upper Telemetry Bar */}
      <div className="max-w-[1560px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-5">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
                INTERPOSE
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                v0.1.0-DEFENSE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Deterministic Security Reference Monitor · Dynamic Taint Tracking for Autonomous Agents
            </p>
          </div>
        </div>

        {/* Real-time Defense Telemetry Badges & Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-bold tracking-wider">
              DEFENSE POSTURE
            </span>
            <span className="text-emerald-400 font-sans font-bold text-xs flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              COMPLETE MEDIATION
            </span>
          </div>

          <div className="hidden md:flex flex-col px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-bold tracking-wider">
              AGENTDOJO DEFENSE
            </span>
            <span className="text-emerald-400 font-mono font-bold text-xs mt-0.5">
              0.0% ASR (36/36)
            </span>
          </div>

          <div className="hidden lg:flex flex-col px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-bold tracking-wider">
              AST INTERPOSITION
            </span>
            <span className="text-cyan-400 font-mono font-bold text-xs mt-0.5">
              &lt;0.038 ms
            </span>
          </div>

          {/* Simulator / Live Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onToggleLive(false)}
              className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-lg transition cursor-pointer ${
                !isLive
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Zero-Auth Simulator
            </button>
            <button
              onClick={() => onToggleLive(true)}
              className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                isLive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Live Engine</span>
            </button>
          </div>

          <a
            href="https://github.com/Hamza-HATTAB/interpose"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-sans text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="max-w-[1560px] mx-auto px-6 flex items-center gap-1.5 overflow-x-auto border-t border-slate-800/80">
        {[
          { id: "cockpit", label: "Sentinel Cockpit (3D Stage)", icon: Shield },
          { id: "adversary", label: "36-Vector Exploit Matrix", icon: ShieldAlert },
          { id: "lattice", label: "Dynamic Taint Lattice (DAG)", icon: Zap },
          {
            id: "hitl",
            label: "HITL Quarantine Vault",
            icon: Lock,
            badge: pendingIncidentCount > 0 ? pendingIncidentCount : undefined,
          },
          { id: "benchmarks", label: "Spotlight Benchmarks", icon: Activity },
          { id: "ledger", label: "Forensic Audit Ledger", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CockpitTab)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-sans font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
