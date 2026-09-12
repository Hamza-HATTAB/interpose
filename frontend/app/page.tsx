"use client";

import React, { useState } from "react";
import { Header, CockpitTab } from "@/components/Header";
import { SentinelChamber } from "@/components/SentinelChamber";
import { TaintLatticeDAG } from "@/components/TaintLatticeDAG";
import { AdversarySimulator } from "@/components/AdversarySimulator";
import { HITLQuarantineVault } from "@/components/HITLQuarantineVault";
import { SpotlightScorecard } from "@/components/SpotlightScorecard";
import { ForensicAuditLedger } from "@/components/ForensicAuditLedger";
import {
  Shield,
  ShieldAlert,
  Zap,
  Cpu,
  Activity,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { interposeClient } from "@/lib/api";
import { Scenario, SimulationResult } from "@/lib/types";

export default function Home() {
  const [isLive, setIsLive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<CockpitTab>("cockpit");
  const [incidentRefreshCount, setIncidentRefreshCount] = useState<number>(0);

  // Cross-panel reactive state
  const [activeSimulationResult, setActiveSimulationResult] = useState<SimulationResult | null>(null);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [deflectionCounter, setDeflectionCounter] = useState<number>(18);

  const handleToggleLive = (live: boolean) => {
    setIsLive(live);
    interposeClient.setLiveMode(live);
  };

  const handleSimulationRun = (scenario: Scenario, result: SimulationResult) => {
    setActiveScenario(scenario);
    setActiveSimulationResult(result);
    setDeflectionCounter((c) => c + 1);
  };

  const pendingIncidents = interposeClient
    .getIncidents()
    .filter((i) => i.status === "PENDING").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#02050b] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Upper Cockpit Telemetry Header */}
      <Header
        isLive={isLive}
        onToggleLive={handleToggleLive}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingIncidentCount={pendingIncidents}
      />

      {/* Main Command Stage */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto px-5 lg:px-8 py-7 space-y-7">
        {/* Tab 1: Sentinel Cockpit (Integrated 3D Hero + Multi-Panel Console) */}
        {activeTab === "cockpit" && (
          <div className="space-y-7 animate-in fade-in duration-200">
            {/* 3D Cyber Sentinel WebGL Radar Chamber (Expansive Hero Stage) */}
            <section aria-label="3D Sentinel Stage">
              <SentinelChamber
                onTriggerSimulate={() => setDeflectionCounter((c) => c + 1)}
                attackCount={deflectionCounter}
              />
            </section>

            {/* Split Cockpit Console: Adversary Simulator (Left) + Taint Lattice DAG (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 items-start">
              {/* Left Panel: Adversary Trigger & AST Diff Inspector */}
              <section aria-label="Adversary Simulator Console">
                <AdversarySimulator onSimulationRun={handleSimulationRun} />
              </section>

              {/* Right Panel: Live Taint Lattice Flow DAG */}
              <section aria-label="Taint Lattice DAG Console">
                <TaintLatticeDAG
                  activeTaintViolation={true}
                  violatedRule={
                    activeSimulationResult?.interposeResult.ruleId ||
                    "RULE_AST_SHELL_PIPELINE_INJECTION"
                  }
                  violatedSink={activeScenario?.targetTool || "execute_bash"}
                />
              </section>
            </div>

            {/* Bottom Panel: Forensic Audit Ledger */}
            <section aria-label="Forensic Audit Stream">
              <ForensicAuditLedger />
            </section>
          </div>
        )}

        {/* Tab 2: 36-Vector Exploit Matrix Deep-Dive */}
        {activeTab === "adversary" && (
          <div className="space-y-7 animate-in fade-in duration-200">
            <AdversarySimulator onSimulationRun={handleSimulationRun} />
          </div>
        )}

        {/* Tab 3: Dynamic Taint Lattice Studio (Full DAG) */}
        {activeTab === "lattice" && (
          <div className="space-y-7 animate-in fade-in duration-200">
            <TaintLatticeDAG
              activeTaintViolation={true}
              violatedRule={
                activeSimulationResult?.interposeResult.ruleId ||
                "RULE_TAINT_BARRIER_VIOLATION"
              }
              violatedSink={activeScenario?.targetTool || "execute_bash"}
            />
          </div>
        )}

        {/* Tab 4: HITL Quarantine Vault */}
        {activeTab === "hitl" && (
          <div className="space-y-7 animate-in fade-in duration-200">
            <HITLQuarantineVault
              onIncidentUpdated={() => setIncidentRefreshCount((c) => c + 1)}
            />
          </div>
        )}

        {/* Tab 5: Spotlight Benchmarks & Pareto Matrix */}
        {activeTab === "benchmarks" && (
          <div className="space-y-7 animate-in fade-in duration-200">
            <SpotlightScorecard />
          </div>
        )}

        {/* Tab 6: Forensic Audit Ledger */}
        {activeTab === "ledger" && (
          <div className="space-y-7 animate-in fade-in duration-200">
            <ForensicAuditLedger />
          </div>
        )}
      </main>

      {/* Cybernetic Technical Defense Footer */}
      <footer className="border-t border-slate-800/80 bg-[#010307] py-8 px-6 lg:px-8 mt-12">
        <div className="max-w-[1560px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-400">
          <div>
            <div className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>INTERPOSE // Autonomous Agent Security Reference Monitor</span>
            </div>
            <p className="text-slate-400 text-xs">
              Complete Mediation · Formal Dynamic Taint Lattice · Cryptographic HITL Quarantine · Engineered by <strong className="text-slate-200">Hamza Hattab</strong>.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Hamza Hattab &copy; September 2026</span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-semibold">Zero-Bypass Theorem</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400 font-semibold">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
