"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Clock, Shield, CheckCircle2, ShieldAlert, Key } from "lucide-react";
import { AuditRecord } from "@/lib/types";
import { interposeClient } from "@/lib/api";

export const ForensicAuditLedger: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);

  useEffect(() => {
    setLogs(interposeClient.getAuditLogs());
    const interval = setInterval(() => {
      setLogs([...interposeClient.getAuditLogs()]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cyber-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 font-sans bg-slate-950/60">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Immutable Forensic Audit Ledger (Microsecond JSONL Stream)</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>SHA-256 Provenance Ledger</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 font-bold">{logs.length} Records</span>
        </div>
      </div>

      <div className="divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto font-sans">
        {logs.map((log) => {
          const isPermit = log.decision === "PERMIT";
          const isHitl = log.decision === "REQUIRE_HITL";
          return (
            <div
              key={log.id}
              className="p-4 hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start md:items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                    isPermit
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : isHitl
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {log.decision}
                </span>

                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white font-bold">{log.tool}()</span>
                    <span className="text-cyan-400 text-[11px]">[{log.ruleId}]</span>
                  </div>
                  <div className="text-slate-300 mt-0.5 font-sans leading-relaxed">{log.reason}</div>
                  {log.hmacSignature && (
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-500/80" />
                      <span>{log.hmacSignature}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-slate-400 self-end md:self-auto shrink-0">
                <span className="text-cyan-400 font-bold">{log.latencyMs.toFixed(3)} ms</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{log.timestamp}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
