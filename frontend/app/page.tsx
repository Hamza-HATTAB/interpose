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
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
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
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100">
      <Header
        isLive={isLive}
        onToggleLive={handleToggleLive}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingIncidentCount={pendingIncidents}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Render Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Architectural Thesis Hero */}
            <div className="relative rounded-2xl border border-obsidian-700 bg-obsidian-900/60 backdrop-blur-md p-6 lg:p-8 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-taint/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-taint/10 border border-taint/30 text-taint text-xs font-mono font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>DETERMINISTIC AGENT SAFETY THEOREM</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-slate-100">
                  Stochastic Models Cannot Self-Police. Security Must Be Enforced Outside the Model.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  When autonomous AI agents ingest untrusted emails, PDFs, and web scrapes, in-model prompt guardrails
                  inevitably succumb to adversarial jailbreaks. <strong>INTERPOSE</strong> provides a zero-trust,
                  deterministic reference monitor that intercepts every tool invocation, traces dynamic data provenance
                  via a formal <strong>Taint Lattice</strong>, validates AST parameters, and gates irreversible operations
                  with cryptographic HMAC-SHA256 tokens.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("exploit_replay")}
                    className="px-5 py-2.5 rounded-lg bg-breach hover:bg-breach/90 text-obsidian-950 font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Launch Exploit Replay</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("taint_canvas")}
                    className="px-5 py-2.5 rounded-lg border border-obsidian-700 bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 font-mono text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-taint" />
                    <span>Inspect Taint DAG</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Three Core KPI Highlight Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-xl border border-shield/40 bg-shield/5 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Attack Success Rate</span>
                  <CheckCircle2 className="w-5 h-5 text-shield" />
                </div>
                <div className="text-3xl font-bold font-mono text-shield">0.0%</div>
                <p className="text-xs text-slate-400 font-mono">
                  36 of 36 AgentDojo & PyRIT mutation attacks neutralized in benchmark sweeps.
                </p>
              </div>

              <div className="rounded-xl border border-taint/40 bg-taint/5 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Benign Task Utility</span>
                  <Activity className="w-5 h-5 text-taint" />
                </div>
                <div className="text-3xl font-bold font-mono text-taint">100.0%</div>
                <p className="text-xs text-slate-400 font-mono">
                  Zero false-positive workflow halts on legitimate business transactions.
                </p>
              </div>

              <div className="rounded-xl border border-alert/40 bg-alert/5 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Interception Latency</span>
                  <Cpu className="w-5 h-5 text-alert" />
                </div>
                <div className="text-3xl font-bold font-mono text-alert">&lt;0.038 ms</div>
                <p className="text-xs text-slate-400 font-mono">
                  Deterministic sub-millisecond evaluation with pure CPU AST parsing.
                </p>
              </div>
            </div>

            {/* Quick Interactive Exploit Playground Preview */}
            <AttackPlayground />

            {/* Live Forensic Audit Log Stream */}
            <ForensicLog />
          </div>
        )}

        {activeTab === "exploit_replay" && <AttackPlayground />}
        {activeTab === "taint_canvas" && <TaintCanvas />}
        {activeTab === "hitl_queue" && (
          <HITLQueue onIncidentUpdated={() => setIncidentRefreshCount((c) => c + 1)} />
        )}
        {activeTab === "benchmark" && <BenchmarkRadar />}
      </main>

      {/* Recruiter & Canadian AI Scale-Up Callout Footer */}
      <footer className="border-t border-obsidian-800 bg-obsidian-900 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            <div className="text-slate-200 font-bold mb-1">
              INTERPOSE: The Flagship AI Security & Governance Project
            </div>
            <p className="text-slate-400 text-[11px]">
              Built for remote AI Security Engineer, LLMOps Security, and Applied ML Safety roles in Canada
              (Armilla AI, Private AI, Cohere, Coveo, Ada).
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Hamza Riadh Hattab &copy; September 2026</span>
            <span className="text-slate-600">|</span>
            <span className="text-shield">MIT Licensed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
