"use client";

import React, { useState } from "react";
import { ArrowRight, ShieldCheck, ShieldAlert, Cpu, Database, Eye, Terminal, Info, Zap } from "lucide-react";
import { DAGNode } from "@/lib/types";
import { INITIAL_DAG_NODES } from "@/lib/mockData";

export const TaintCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<DAGNode[]>(INITIAL_DAG_NODES);
  const [selectedNode, setSelectedNode] = useState<DAGNode>(INITIAL_DAG_NODES[2]);

  const getNodeIcon = (type: DAGNode["type"]) => {
    switch (type) {
      case "source":
        return <Terminal className="w-5 h-5 text-breach" />;
      case "context":
        return <Cpu className="w-5 h-5 text-taint" />;
      case "lattice":
        return <Zap className="w-5 h-5 text-taint" />;
      case "policy":
        return <ShieldAlert className="w-5 h-5 text-alert" />;
      case "sink":
        return <ShieldCheck className="w-5 h-5 text-shield" />;
    }
  };

  const getNodeColorClass = (node: DAGNode) => {
    if (node.status === "blocked") return "border-breach/60 bg-breach/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
    if (node.status === "tainted") return "border-taint/60 bg-taint/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]";
    if (node.status === "hitl") return "border-alert/60 bg-alert/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
    return "border-shield/60 bg-shield/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
  };

  return (
    <div className="space-y-6">
      {/* Top Description Card */}
      <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-taint font-mono text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Information Flow Control (IFC) Lineage Canvas
            </div>
            <h2 className="text-lg font-bold text-slate-100 font-mono mt-1">
              Dynamic Taint Propagation DAG & Lattice Proof
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Every token ingested by the autonomous agent carries a provenance tag across substring slicing,
              JSON parsing, and formatting. The reference monitor evaluates whether tainted data flows to sensitive sinks.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-taint/10 text-taint border border-taint/30">
              Lattice: lub(Trusted, Untrusted) = Untrusted
            </span>
          </div>
        </div>
      </div>

      {/* Visual DAG Flow Diagram */}
      <div className="bg-obsidian-950 border border-obsidian-700 rounded-xl p-6 relative overflow-x-auto">
        <div className="text-[11px] font-mono text-slate-400 mb-6 flex items-center justify-between">
          <span>PIPELINE FLOW: INGESTION ➔ CONTEXT ➔ PROPAGATION ➔ REFERENCE MONITOR ➔ SANDBOX</span>
          <span className="text-taint">Click any node to inspect forensic provenance tag</span>
        </div>

        <div className="flex items-center justify-between gap-3 min-w-[850px] py-4">
          {nodes.map((node, index) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <React.Fragment key={node.id}>
                <button
                  onClick={() => setSelectedNode(node)}
                  className={`flex-1 p-4 rounded-xl border text-left transition relative cursor-pointer ${
                    getNodeColorClass(node)
                  } ${isSelected ? "ring-2 ring-taint scale-[1.03]" : "hover:scale-[1.01]"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-obsidian-900 border border-obsidian-700">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-700 text-slate-300">
                      Step 0{index + 1}
                    </span>
                  </div>

                  <h3 className="font-mono text-xs font-bold text-slate-100 line-clamp-1">{node.label}</h3>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                    <span
                      className={`font-semibold ${
                        node.taintLevel === "TOOL_UNTRUSTED_WEB"
                          ? "text-taint"
                          : node.taintLevel === "CRITICAL_SECRET"
                          ? "text-breach"
                          : "text-shield"
                      }`}
                    >
                      {node.taintLevel}
                    </span>
                    <span className="text-slate-400 capitalize">{node.status}</span>
                  </div>
                </button>

                {index < nodes.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-1">
                    <ArrowRight className="w-5 h-5 text-taint/70 animate-pulse" />
                    <span className="text-[9px] font-mono text-slate-400 mt-1">IFC</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Inspector Drawer for Selected Node */}
      <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-obsidian-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-taint/10 border border-taint/30 text-taint">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
                Forensic Provenance Inspector: <span className="text-taint">{selectedNode.label}</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Node ID: {selectedNode.id} // Stage: {selectedNode.type.toUpperCase()}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded bg-obsidian-900 border border-obsidian-700 text-xs font-mono text-slate-200">
            Status: <strong className="text-taint">{selectedNode.status.toUpperCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-obsidian-900 border border-obsidian-700">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Lattice Security Level</span>
            <div className="mt-1 font-mono text-sm font-bold text-taint">
              {selectedNode.taintLevel}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Ordering: SANITIZED (0) &lt; USER_TRUSTED (1) &lt; TOOL_UNTRUSTED_WEB (2) &lt; CRITICAL_SECRET (3)
            </p>
          </div>

          <div className="p-4 rounded-lg bg-obsidian-900 border border-obsidian-700">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Dynamic Invariant Rule</span>
            <div className="mt-1 font-mono text-sm font-bold text-alert">
              Deterministic Barrier
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Values carrying TOOL_UNTRUSTED_WEB cannot flow to sensitive sinks without authenticated sanitization.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-obsidian-900 border border-obsidian-700">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Evaluation Latency</span>
            <div className="mt-1 font-mono text-sm font-bold text-shield">
              0.038 ms (Mean)
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Pure CPU deterministic evaluation with zero stochastic API roundtrips.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-obsidian-950 border border-obsidian-700 font-mono text-xs text-slate-300">
          <div className="text-[10px] text-slate-400 uppercase mb-1">State Explanation & Provenance Lineage:</div>
          {selectedNode.details}
        </div>
      </div>
    </div>
  );
};
