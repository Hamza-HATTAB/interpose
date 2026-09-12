"use client";

import React, { useState } from "react";
import { ArrowRight, ShieldCheck, ShieldAlert, Cpu, Eye, Terminal, Zap } from "lucide-react";
import { DAGNode } from "@/lib/types";
import { INITIAL_DAG_NODES } from "@/lib/mockData";

export const TaintCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<DAGNode[]>(INITIAL_DAG_NODES);
  const [selectedNode, setSelectedNode] = useState<DAGNode>(INITIAL_DAG_NODES[2]);

  const getNodeIcon = (type: DAGNode["type"]) => {
    switch (type) {
      case "source":
        return <Terminal className="w-5 h-5 text-rose-400" />;
      case "context":
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case "lattice":
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case "policy":
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case "sink":
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getNodeColorClass = (node: DAGNode) => {
    if (node.status === "blocked")
      return "border-rose-500/50 bg-rose-950/25 shadow-[0_0_20px_rgba(244,63,94,0.15)]";
    if (node.status === "tainted")
      return "border-cyan-500/50 bg-cyan-950/25 shadow-[0_0_20px_rgba(6,182,212,0.15)]";
    if (node.status === "hitl")
      return "border-amber-500/50 bg-amber-950/25 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
    return "border-emerald-500/50 bg-emerald-950/25 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
  };

  return (
    <div className="space-y-6">
      {/* Top Description Card */}
      <div className="cyber-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-sans text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-cyan-400" /> Information Flow Control (IFC) Lineage Canvas
            </div>
            <h2 className="text-xl font-bold text-white font-sans tracking-tight mt-1.5">
              Dynamic Taint Propagation DAG & Lattice Proof
            </h2>
            <p className="text-sm text-slate-300 font-sans mt-1.5 max-w-4xl leading-relaxed">
              Every token ingested by the autonomous agent carries a cryptographic provenance tag across substring slicing,
              JSON parsing, and formatting. The reference monitor evaluates whether tainted data flows to sensitive sinks.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
              Lattice: lub(Trusted, Untrusted) = Untrusted
            </span>
          </div>
        </div>
      </div>

      {/* Visual DAG Flow Diagram */}
      <div className="cyber-card rounded-2xl p-6 border border-slate-800 relative overflow-x-auto">
        <div className="text-xs font-sans font-medium text-slate-400 mb-6 flex items-center justify-between">
          <span>PIPELINE: INGESTION ➔ CONTEXT ➔ TAINT LATTICE ➔ REFERENCE MONITOR ➔ SANDBOX</span>
          <span className="text-cyan-400 font-semibold">Click any node to inspect provenance metadata</span>
        </div>

        <div className="flex items-center justify-between gap-4 min-w-[900px] py-4">
          {nodes.map((node, index) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <React.Fragment key={node.id}>
                <button
                  onClick={() => setSelectedNode(node)}
                  className={`flex-1 p-4 rounded-xl border text-left transition relative cursor-pointer cyber-card-hover ${
                    getNodeColorClass(node)
                  } ${isSelected ? "ring-2 ring-cyan-400 scale-[1.02]" : ""}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 font-semibold">
                      Step 0{index + 1}
                    </span>
                  </div>

                  <h3 className="font-sans text-sm font-bold text-white line-clamp-1">{node.label}</h3>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span
                      className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                        node.taintLevel === "TOOL_UNTRUSTED_WEB"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : node.taintLevel === "CRITICAL_SECRET"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {node.taintLevel}
                    </span>
                    <span className="text-slate-400 font-sans capitalize text-xs">{node.status}</span>
                  </div>
                </button>

                {index < nodes.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-1">
                    <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-400 mt-1">IFC</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Inspector Drawer for Selected Node */}
      <div className="cyber-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-base font-bold text-white flex items-center gap-2">
                Provenance Tag Inspector: <span className="text-cyan-400">{selectedNode.label}</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Node ID: <code className="text-slate-300 font-mono">{selectedNode.id}</code> · Stage: <strong className="text-slate-300 font-sans uppercase">{selectedNode.type}</strong>
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-sans text-slate-200">
            Node Status: <strong className="text-cyan-400 font-bold ml-1">{selectedNode.status.toUpperCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-xl bg-black/50 border border-slate-800">
            <span className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">Lattice Security Level</span>
            <div className="mt-1.5 font-mono text-sm font-bold text-cyan-300">
              {selectedNode.taintLevel}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
              Ordering: SANITIZED (0) &lt; USER_TRUSTED (1) &lt; TOOL_UNTRUSTED_WEB (2) &lt; CRITICAL_SECRET (3)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-slate-800">
            <span className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">Dynamic Invariant Rule</span>
            <div className="mt-1.5 font-sans text-sm font-bold text-amber-300">
              Deterministic Barrier
            </div>
            <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
              Values carrying TOOL_UNTRUSTED_WEB cannot flow into sensitive sinks without verified sanitization.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-slate-800">
            <span className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">Evaluation Latency</span>
            <div className="mt-1.5 font-mono text-sm font-bold text-emerald-400">
              0.038 ms (Mean)
            </div>
            <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
              Pure deterministic CPU evaluation with zero stochastic API roundtrips.
            </p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-black/60 border border-slate-800/90 font-sans text-sm text-slate-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">State Explanation & Provenance Lineage:</div>
          <p className="leading-relaxed">{selectedNode.details}</p>
        </div>
      </div>
    </div>
  );
};
