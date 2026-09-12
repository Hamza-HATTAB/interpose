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
    <header className="border-b border-obsidian-700 bg-obsidian-900/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Banner: Recruiter Context & Portfolio Ribbon */}
      <div className="bg-obsidian-950 px-4 py-1.5 border-b border-obsidian-800 text-xs flex flex-wrap items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-shield animate-pulse" />
          <span className="font-mono text-slate-200">PORTFOLIO PROJECT 3:</span>
          <span className="text-slate-300 font-medium">Break It On Purpose (Autonomous Agent Reference Monitor)</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">Targeting Canadian AI Security & Safety Roles (Toronto / Montreal)</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-slate-400">
            Author: <strong className="text-slate-200">Hamza HATTAB</strong> (USTHB AI Eng)
          </span>
          <a
            href="https://github.com/Hamza-HATTAB/interpose"
            target="_blank"
            rel="noreferrer"
            className="text-taint hover:underline flex items-center gap-1"
          >
            GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main HUD Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-taint/10 border border-taint/30 flex items-center justify-center text-taint shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider text-slate-100 font-mono">
                INTERPOSE
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-taint/20 text-taint border border-taint/40">
                SENTINEL HUD v0.1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic Security Reference Monitor & Dynamic Taint Lattice
            </p>
          </div>
        </div>

        {/* Global Security Metrics Cards */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden sm:flex flex-col px-3 py-1.5 rounded bg-obsidian-800 border border-obsidian-700">
            <span className="text-slate-400 text-[10px]">DEFENSE STATE</span>
            <span className="text-shield font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-shield" /> ZERO TRUST (ACTIVE)
            </span>
          </div>
          <div className="hidden sm:flex flex-col px-3 py-1.5 rounded bg-obsidian-800 border border-obsidian-700">
            <span className="text-slate-400 text-[10px]">ATTACK SUCCESS (ASR)</span>
            <span className="text-shield font-semibold">0.0% (36/36 BLOCKED)</span>
          </div>
          <div className="hidden md:flex flex-col px-3 py-1.5 rounded bg-obsidian-800 border border-obsidian-700">
            <span className="text-slate-400 text-[10px]">MEDIAN LATENCY</span>
            <span className="text-taint font-semibold">&lt;0.038 ms</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-obsidian-950 p-1 rounded-lg border border-obsidian-700">
            <button
              onClick={() => onToggleLive(false)}
              className={`px-3 py-1 text-xs font-mono rounded-md transition ${
                !isLive
                  ? "bg-taint text-obsidian-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Simulator Mode
            </button>
            <button
              onClick={() => onToggleLive(true)}
              className={`px-3 py-1 text-xs font-mono rounded-md transition flex items-center gap-1.5 ${
                isLive
                  ? "bg-alert text-obsidian-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3 h-3" /> Live GPU
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-obsidian-800">
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
          { id: "benchmark", label: "Pareto & Radar Metrics", icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-mono border-b-2 transition whitespace-nowrap ${
                isActive
                  ? "border-taint text-taint bg-taint/5 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-obsidian-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-alert text-obsidian-950 text-[10px] font-bold">
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
