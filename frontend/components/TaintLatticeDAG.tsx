"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Database,
  Mail,
  DollarSign,
  Lock,
  Zap,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";
import { TaintLevel } from "@/lib/types";

interface TaintLatticeDAGProps {
  activeTaintViolation?: boolean;
  violatedRule?: string;
  violatedSink?: string;
  onSelectSink?: (sink: string) => void;
}

export const TaintLatticeDAG: React.FC<TaintLatticeDAGProps> = ({
  activeTaintViolation = true,
  violatedRule = "RULE_TAINT_BARRIER_VIOLATION: TOOL_UNTRUSTED_WEB prohibited in sensitive sink",
  violatedSink = "execute_bash",
}) => {
  const [selectedTier, setSelectedTier] = useState<TaintLevel>("TOOL_UNTRUSTED_WEB");
  const [selectedSink, setSelectedSink] = useState<string>(violatedSink);

  const tiers: { level: TaintLevel; rank: number; label: string; color: string; desc: string }[] = [
    {
      level: "SANITIZED",
      rank: 0,
      label: "SANITIZED (L0)",
      color: "border-emerald-500/50 text-emerald-300 bg-emerald-950/20",
      desc: "Cryptographically verified, escaped, or AST-sanitized values safe for arbitrary execution sinks.",
    },
    {
      level: "USER_TRUSTED",
      rank: 1,
      label: "USER_TRUSTED (L1)",
      color: "border-cyan-500/50 text-cyan-300 bg-cyan-950/20",
      desc: "Direct inputs authored by verified operator in authenticated terminal or active session.",
    },
    {
      level: "TOOL_UNTRUSTED_WEB",
      rank: 2,
      label: "TOOL_UNTRUSTED_WEB (L2)",
      color: "border-amber-500/50 text-amber-300 bg-amber-950/20",
      desc: "Untrusted strings ingested from web scrapes, PDF invoices, customer emails, and third-party tools.",
    },
    {
      level: "CRITICAL_SECRET",
      rank: 3,
      label: "CRITICAL_SECRET (L3)",
      color: "border-rose-500/50 text-rose-300 bg-rose-950/20",
      desc: "System environment variables, AWS tokens, DB passwords, and private signing keys.",
    },
  ];

  const sinks = [
    {
      id: "execute_bash",
      name: "execute_bash.cmd",
      icon: Terminal,
      rule: "RULE_AST_SHELL_PIPELINE_INJECTION",
      ceiling: "USER_TRUSTED",
      desc: "Subshell command execution. Tainted streams strictly forbidden from piping to sh/bash.",
    },
    {
      id: "database_query",
      name: "database.query",
      icon: Database,
      rule: "RULE_AST_SQL_SAFETY",
      ceiling: "USER_TRUSTED",
      desc: "Relational DB operations. Only parameterized SELECT queries permitted; DDL drops blocked.",
    },
    {
      id: "send_email",
      name: "send_email.recipient",
      icon: Mail,
      rule: "RULE_DATA_EXFILTRATION_BEACON",
      ceiling: "USER_TRUSTED",
      desc: "Outbound communication. Zero CRITICAL_SECRET or untrusted recipient redirects permitted.",
    },
    {
      id: "wire_transfer",
      name: "wire_transfer.payout",
      icon: DollarSign,
      rule: "RULE_IRREVERSIBLE_ACTION_GATE",
      ceiling: "SANITIZED",
      desc: "Irreversible treasury wire transfer. Requires cryptographic HMAC-SHA256 human signature.",
    },
  ];

  return (
    <div className="cyber-card rounded-2xl p-6 lg:p-7 border border-slate-800 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-sans text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Formal Dynamic Taint Lattice Engine (IFC)</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans tracking-tight mt-1">
            Information Flow Control & Capability Sinks
          </h2>
          <p className="text-xs text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
            Anderson Reference Monitor theorem: <code className="text-cyan-300 font-mono text-[11px]">lub(Clean, Tainted) = Tainted</code>.
            Tainted tokens cannot flow into sensitive sinks without explicit sanitization barriers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>L0 &lt; L1 &lt; L2 &lt; L3</span>
        </div>
      </div>

      {/* 4 Taint Tiers Ordering Rail */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiers.map((t, idx) => {
          const isSelected = selectedTier === t.level;
          return (
            <button
              key={t.level}
              onClick={() => setSelectedTier(t.level)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${t.color} ${
                isSelected ? "ring-2 ring-cyan-400 shadow-lg scale-[1.02]" : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                <span>{t.label}</span>
                <span className="text-slate-400">0{idx}</span>
              </div>
              <p className="text-[11px] font-sans text-slate-300 line-clamp-2 leading-relaxed">
                {t.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Magic UI Style Animated Beam SVG DAG */}
      <div className="relative rounded-2xl bg-black/60 border border-slate-800/90 p-6 overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-cyber-grid bg-[size:32px_32px] opacity-20 pointer-events-none" />

        {/* Animated Light Beam SVG */}
        <svg className="w-full h-[180px] lg:h-[200px]" viewBox="0 0 800 200" fill="none">
          <defs>
            {/* Animated Cyan Gradient Beam */}
            <linearGradient id="beamCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>

            {/* Animated Crimson Threat Beam */}
            <linearGradient id="beamThreat" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
              <stop offset="50%" stopColor="#fb7185" stopOpacity="1" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Static Track Lines */}
          <path d="M 120 40 C 260 40, 280 100, 400 100" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 120 160 C 260 160, 280 100, 400 100" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 400 100 C 520 100, 540 40, 680 40" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 400 100 C 520 100, 540 160, 680 160" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />

          {/* Animated Flowing Pulse Beams */}
          <path
            d="M 120 40 C 260 40, 280 100, 400 100"
            stroke="url(#beamThreat)"
            strokeWidth="3.5"
            strokeDasharray="40 160"
            className="animate-pulse"
          >
            <animate attributeName="stroke-dashoffset" from="200" to="0" dur="2s" repeatCount="indefinite" />
          </path>

          <path
            d="M 120 160 C 260 160, 280 100, 400 100"
            stroke="url(#beamCyan)"
            strokeWidth="3.5"
            strokeDasharray="40 160"
          >
            <animate attributeName="stroke-dashoffset" from="200" to="0" dur="2.5s" repeatCount="indefinite" />
          </path>

          <path
            d="M 400 100 C 520 100, 540 40, 680 40"
            stroke="url(#beamThreat)"
            strokeWidth="3.5"
            strokeDasharray="40 160"
          >
            <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.8s" repeatCount="indefinite" />
          </path>

          <path
            d="M 400 100 C 520 100, 540 160, 680 160"
            stroke="url(#beamCyan)"
            strokeWidth="3.5"
            strokeDasharray="40 160"
          >
            <animate attributeName="stroke-dashoffset" from="200" to="0" dur="2.2s" repeatCount="indefinite" />
          </path>

          {/* Ingestion Node (Untrusted Ingest) */}
          <circle cx="120" cy="40" r="16" fill="#0f172a" stroke="#f43f5e" strokeWidth="2.5" />
          <text x="120" y="44" textAnchor="middle" fill="#f43f5e" fontSize="10" fontFamily="sans-serif" fontWeight="bold">L2</text>
          <text x="120" y="16" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Untrusted Web Ingest</text>

          {/* User Session Node (Trusted User) */}
          <circle cx="120" cy="160" r="16" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
          <text x="120" y="164" textAnchor="middle" fill="#06b6d4" fontSize="10" fontFamily="sans-serif" fontWeight="bold">L1</text>
          <text x="120" y="190" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">User Session</text>

          {/* Central Reference Monitor Boundary */}
          <circle cx="400" cy="100" r="28" fill="#030712" stroke="#22d3ee" strokeWidth="3" />
          <circle cx="400" cy="100" r="36" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate" from="0 400 100" to="360 400 100" dur="8s" repeatCount="indefinite" />
          </circle>
          <text x="400" y="96" textAnchor="middle" fill="#22d3ee" fontSize="10" fontFamily="sans-serif" fontWeight="bold">INTERPOSE</text>
          <text x="400" y="110" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">&lt;0.038ms</text>

          {/* Upper Sink: Sensitive Shell Execution (Blocked / Crimson Lock) */}
          <circle cx="680" cy="40" r="18" fill="#450a0a" stroke="#f43f5e" strokeWidth="2.5" />
          <text x="680" y="44" textAnchor="middle" fill="#f43f5e" fontSize="11" fontFamily="sans-serif" fontWeight="bold">DENY</text>
          <text x="680" y="16" textAnchor="middle" fill="#f43f5e" fontSize="11" fontFamily="sans-serif" fontWeight="bold">execute_bash.cmd [LOCKED]</text>

          {/* Lower Sink: Parameterized Read-Only Query (Permitted / Emerald) */}
          <circle cx="680" cy="160" r="18" fill="#022c22" stroke="#10b981" strokeWidth="2.5" />
          <text x="680" y="164" textAnchor="middle" fill="#10b981" fontSize="11" fontFamily="sans-serif" fontWeight="bold">PERMIT</text>
          <text x="680" y="192" textAnchor="middle" fill="#10b981" fontSize="11" fontFamily="sans-serif" fontWeight="bold">database.query (Clean)</text>
        </svg>

        {/* Real-time Dynamic Violation Alert Banner */}
        {activeTaintViolation && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-xs font-sans">
            <div className="flex items-center gap-2.5 text-rose-300 font-semibold">
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>DYNAMIC BARRIER ENGAGED: <code className="text-white font-mono text-[11px]">{violatedRule}</code></span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold shrink-0">
              0.034 ms
            </span>
          </div>
        )}
      </div>

      {/* Sensitive Sinks Capability Grid */}
      <div className="space-y-3">
        <div className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Capability Sinks & Lattice Enforcement Rules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {sinks.map((s) => {
            const Icon = s.icon;
            const isTarget = s.id === selectedSink;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSink(s.id)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer cyber-card-hover ${
                  isTarget
                    ? "border-cyan-500/50 bg-cyan-950/20 shadow-lg"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                    Ceiling: {s.ceiling}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-white mb-1">{s.name}</div>
                <p className="text-[11px] font-sans text-slate-400 line-clamp-2 leading-relaxed">
                  {s.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
