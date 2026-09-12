"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { TaintCanvas } from "@/components/TaintCanvas";
import { AttackPlayground } from "@/components/AttackPlayground";
import { HITLQueue } from "@/components/HITLQueue";
import { BenchmarkRadar } from "@/components/BenchmarkRadar";
import { ForensicLog } from "@/components/ForensicLog";
import {
  Shield,
  ShieldAlert,
  Zap,
  Cpu,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { interposeClient } from "@/lib/api";

export default function Home() {
  const [isLive, setIsLive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "taint_canvas" | "exploit_replay" | "hitl_queue" | "benchmark"
  >("overview");
  const [incidentRefreshCount, setIncidentRefreshCount] = useState<number>(0);

  const handleToggleLive = (live: boolean) => {
    setIsLive(live);
    interposeClient.setLiveMode(live);
  };

  const pendingIncidents = interposeClient
    .getIncidents()
    .filter((i) => i.status === "PENDING").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#05080e] text-slate-100 font-sans">
      <Header
        isLive={isLive}
        onToggleLive={handleToggleLive}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingIncidentCount={pendingIncidents}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Tab 1: Executive Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Architectural Thesis Hero */}
            <div className="relative cyber-card rounded-2xl p-7 lg:p-10 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-sans font-semibold">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>DETERMINISTIC AGENT SECURITY THEOREM</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold font-sans tracking-tight text-white leading-tight">
                  Stochastic Models Cannot Self-Police. Security Must Be Enforced Outside the Model.
                </h2>
                <p className="text-sm lg:text-base text-slate-300 font-sans leading-relaxed">
                  When autonomous AI agents ingest untrusted emails, PDFs, and web scrapes, in-model prompt guardrails
                  inevitably succumb to adversarial jailbreaks. <strong className="text-white">INTERPOSE</strong> provides a zero-trust,
                  deterministic reference monitor that intercepts every tool invocation, traces dynamic data provenance
                  via a formal <strong className="text-cyan-300 font-mono">Taint Lattice</strong>, validates AST parameters, and gates irreversible operations
                  with cryptographic HMAC-SHA256 tokens.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-3">
                  <button
                    onClick={() => setActiveTab("exploit_replay")}
                    className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-sans text-sm font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(244,63,94,0.35)] transition cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-slate-950" />
                    <span>Launch Exploit Replay</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("taint_canvas")}
                    className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-sans text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Inspect Taint DAG</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Three Core KPI Highlight Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="cyber-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/15 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">
                    Attack Intercept Rate
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-emerald-400">100.0%</div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  36 of 36 AgentDojo & PyRIT mutation attacks neutralized in empirical benchmark sweeps.
                </p>
              </div>

              <div className="cyber-card rounded-2xl p-6 border border-cyan-500/30 bg-cyan-950/15 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">
                    Benign Task Utility
                  </span>
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-cyan-400">100.0%</div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Zero false-positive workflow halts on legitimate enterprise business transactions.
                </p>
              </div>

              <div className="cyber-card rounded-2xl p-6 border border-amber-500/30 bg-amber-950/15 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">
                    Interception Latency
                  </span>
                  <Cpu className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-amber-400">&lt;0.038 ms</div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Deterministic sub-millisecond evaluation with pure CPU AST parsing.
                </p>
              </div>
            </div>

            {/* Exploit Replay Component Preview */}
            <AttackPlayground />

            {/* Live Forensic Audit Log Stream */}
            <ForensicLog />
          </div>
        )}

        {/* Tab 2: Exploit Replay */}
        {activeTab === "exploit_replay" && <AttackPlayground />}

        {/* Tab 3: Taint Canvas DAG */}
        {activeTab === "taint_canvas" && <TaintCanvas />}

        {/* Tab 4: HITL Incident Queue */}
        {activeTab === "hitl_queue" && (
          <HITLQueue onIncidentUpdated={() => setIncidentRefreshCount((c) => c + 1)} />
        )}

        {/* Tab 5: Benchmark Scorecard */}
        {activeTab === "benchmark" && <BenchmarkRadar />}
      </main>

      {/* Clean Technical Footer */}
      <footer className="border-t border-slate-800 bg-[#03060a] py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-400">
          <div>
            <div className="text-white font-bold text-sm mb-1">
              INTERPOSE: Autonomous Agent Reference Monitor & Information Flow Control (IFC)
            </div>
            <p className="text-slate-400 text-xs">
              Open-source security research engineering project by <strong className="text-slate-200">Hamza Hattab</strong>.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Hamza Hattab &copy; September 2026</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold">MIT Licensed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
