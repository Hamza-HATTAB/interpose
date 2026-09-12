"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Shield, AlertTriangle, Clock } from "lucide-react";
import { AuditRecord } from "@/lib/types";
import { interposeClient } from "@/lib/api";

export const ForensicLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);

  useEffect(() => {
    setLogs(interposeClient.getAuditLogs());
    const interval = setInterval(() => {
      setLogs([...interposeClient.getAuditLogs()]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-obsidian-700 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Terminal className="w-4 h-4 text-taint" />
          <span>IMMUTABLE FORENSIC AUDIT LOG (JSONL STREAM)</span>
        </div>
        <span className="text-[10px] text-slate-400">Total Recorded: {logs.length} events</span>
      </div>

      <div className="divide-y divide-obsidian-800 max-h-[360px] overflow-y-auto font-mono text-xs">
        {logs.map((log) => {
          const isPermit = log.decision === "PERMIT";
          const isHitl = log.decision === "REQUIRE_HITL";
          return (
            <div key={log.id} className="p-3.5 hover:bg-obsidian-800/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start md:items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isPermit
                      ? "bg-shield/20 text-shield"
                      : isHitl
                      ? "bg-alert/20 text-alert"
                      : "bg-breach/20 text-breach"
                  }`}
                >
                  {log.decision}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-100 font-semibold">{log.tool}()</span>
                    <span className="text-[10px] text-slate-400 font-mono">[{log.ruleId}]</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{log.reason}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-400 self-end md:self-auto shrink-0">
                <span className="text-taint">{log.latencyMs.toFixed(3)} ms</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {log.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
