"use client";

import React from "react";
import { Shield, ShieldAlert, Cpu, Activity, Zap, ExternalLink } from "lucide-react";

interface HeaderProps {
  isLive: boolean;
  onToggleLive: (live: boolean) => void;
  activeTab: "overview" | "taint_canvas" | "exploit_replay" | "hitl_queue" | "benchmark";
  setActiveTab: (tab: "overview" | "taint_canvas" | "exploit_replay" | "hitl_queue" | "benchmark") => void;
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
    <header className="border-b border-slate-800 bg-[#05080e]/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
      {/* Main HUD Bar */}
      <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
                INTERPOSE
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                v0.1.0
              </span>
            </div>
            <p className="text-sm text-slate-300 font-sans font-normal mt-0.5">
              Deterministic Security Reference Monitor & Dynamic Taint Tracking
            </p>
          </div>
        </div>

        {/* Global Security Metrics Badges & Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 text-[11px] uppercase font-sans font-semibold tracking-wider">DEFENSE POSTURE</span>
            <span className="text-emerald-400 font-sans font-bold text-sm flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> ZERO TRUST (ACTIVE)
            </span>
          </div>

          <div className="hidden md:flex flex-col px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 text-[11px] uppercase font-sans font-semibold tracking-wider">AGENTDOJO BENCHMARK</span>
            <span className="text-emerald-400 font-mono font-bold text-sm mt-0.5">
              100% Intercept
            </span>
          </div>

          <div className="hidden lg:flex flex-col px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 text-[11px] uppercase font-sans font-semibold tracking-wider">EVALUATION LATENCY</span>
            <span className="text-cyan-400 font-mono font-bold text-sm mt-0.5">&lt;0.038 ms</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => onToggleLive(false)}
              className={`px-3.5 py-1.5 text-xs font-sans font-semibold rounded-lg transition cursor-pointer ${
                !isLive
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Simulator Mode
            </button>
            <button
              onClick={() => onToggleLive(true)}
              className={`px-3.5 py-1.5 text-xs font-sans font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                isLive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Live GPU
            </button>
          </div>

          <a
            href="https://github.com/Hamza-HATTAB/interpose"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-sans text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-[1440px] mx-auto px-6 flex items-center gap-2 overflow-x-auto border-t border-slate-800/80">
        {[
          { id: "overview", label: "Executive Overview", icon: Activity },
          { id: "exploit_replay", label: "Exploit Replay & Attacks", icon: ShieldAlert },
          { id: "taint_canvas", label: "Taint Lineage Canvas (DAG)", icon: Zap },
          {
            id: "hitl_queue",
            label: "HITL Incident Queue",
            icon: Shield,
            badge: pendingIncidentCount > 0 ? pendingIncidentCount : undefined,
          },
          { id: "benchmark", label: "Benchmark Scorecard & Radar", icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-sans font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? "border-cyan-400 text-cyan-300 bg-cyan-500/10 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
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
