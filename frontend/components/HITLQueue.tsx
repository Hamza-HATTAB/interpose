"use client";

import React, { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, Key, Clock, DollarSign } from "lucide-react";
import { HITLIncident } from "@/lib/types";
import { INITIAL_HITL_INCIDENTS } from "@/lib/mockData";
import { interposeClient } from "@/lib/api";

interface HITLQueueProps {
  onIncidentUpdated?: () => void;
}

export const HITLQueue: React.FC<HITLQueueProps> = ({ onIncidentUpdated }) => {
  const [incidents, setIncidents] = useState<HITLIncident[]>(INITIAL_HITL_INCIDENTS);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

  const handleApprove = (actionId: string) => {
    interposeClient.approveIncident(actionId);
    setIncidents((prev) =>
      prev.map((i) => (i.actionId === actionId ? { ...i, status: "APPROVED" as const } : i))
    );
    setActiveFeedback(`Incident ${actionId} approved with cryptographic HMAC-SHA256 sign-off.`);
    if (onIncidentUpdated) onIncidentUpdated();
  };

  const handleQuarantine = (actionId: string) => {
    interposeClient.quarantineIncident(actionId);
    setIncidents((prev) =>
      prev.map((i) => (i.actionId === actionId ? { ...i, status: "QUARANTINED" as const } : i))
    );
    setActiveFeedback(`Incident ${actionId} quarantined and terminated by security operator.`);
    if (onIncidentUpdated) onIncidentUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl p-5">
        <div className="flex items-center gap-2 text-alert font-mono text-xs font-semibold uppercase tracking-wider">
          <Shield className="w-4 h-4" /> Human-in-the-Loop (HITL) Authorization Queue
        </div>
        <h2 className="text-lg font-bold text-slate-100 font-mono mt-1">
          Cryptographic HMAC-SHA256 Irreversible Gate
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          High-liability enterprise actions (wire disbursements, database drops, root filesystem changes) immediately
          halt agent execution and generate a signed HMAC-SHA256 challenge token requiring explicit human sign-off.
        </p>
      </div>

      {activeFeedback && (
        <div className="p-3.5 rounded-lg bg-shield/10 border border-shield/40 text-shield text-xs font-mono flex items-center justify-between">
          <span>{activeFeedback}</span>
          <button onClick={() => setActiveFeedback(null)} className="text-slate-400 hover:text-slate-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Incident List */}
      <div className="space-y-4">
        {incidents.map((inc) => {
          const isPending = inc.status === "PENDING";
          return (
            <div
              key={inc.actionId}
              className={`rounded-xl border p-5 transition ${
                isPending
                  ? "border-alert/50 bg-alert/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  : inc.status === "APPROVED"
                  ? "border-shield/40 bg-shield/5"
                  : "border-breach/40 bg-breach/5"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-obsidian-700">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                      isPending
                        ? "bg-alert text-obsidian-950"
                        : inc.status === "APPROVED"
                        ? "bg-shield text-obsidian-950"
                        : "bg-breach text-obsidian-950"
                    }`}
                  >
                    {inc.status}
                  </span>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>Action ID: {inc.actionId}</span>
                      <span className="text-taint">({inc.toolName})</span>
                    </h3>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> TTL: 300s
                      </span>
                      <span className="text-breach font-bold">
                        Risk Score: {(inc.riskScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuarantine(inc.actionId)}
                      className="px-3 py-1.5 rounded-lg border border-breach/40 bg-breach/10 hover:bg-breach/20 text-breach text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Quarantine</span>
                    </button>
                    <button
                      onClick={() => handleApprove(inc.actionId)}
                      className="px-4 py-1.5 rounded-lg bg-shield hover:bg-shield/90 text-obsidian-950 text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve with HMAC Token</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Intercepted Parameters */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-obsidian-950 border border-obsidian-800 font-mono text-xs">
                  <div className="text-[10px] text-slate-400 uppercase mb-2">Proposed Tool Arguments:</div>
                  <pre className="text-slate-300 text-[11px] overflow-x-auto">
                    {JSON.stringify(inc.arguments, null, 2)}
                  </pre>
                </div>

                <div className="p-3.5 rounded-lg bg-obsidian-950 border border-obsidian-800 font-mono text-xs space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase">Cryptographic Token Challenge:</div>
                  <div className="p-2 rounded bg-obsidian-900 border border-obsidian-700 text-[10px] text-taint break-all flex items-center gap-2">
                    <Key className="w-4 h-4 shrink-0 text-alert" />
                    <span>{inc.tokenChallenge}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Signature: SHA-256 HMAC over <code className="text-slate-200">action_id:tool:args_hash:expires_at</code>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
