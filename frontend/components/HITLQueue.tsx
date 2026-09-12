"use client";

import React, { useState } from "react";
import { Shield, CheckCircle, XCircle, Key, Clock } from "lucide-react";
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
      <div className="cyber-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 font-sans text-xs font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Human-in-the-Loop (HITL) Authorization Queue</span>
        </div>
        <h2 className="text-xl font-bold text-white font-sans tracking-tight mt-1.5">
          Cryptographic HMAC-SHA256 Irreversible Gate
        </h2>
        <p className="text-sm text-slate-300 font-sans mt-1.5 max-w-4xl leading-relaxed">
          High-liability enterprise actions (wire disbursements, database drops, root filesystem changes) immediately
          halt agent execution and generate a signed HMAC-SHA256 challenge token requiring explicit human sign-off.
        </p>
      </div>

      {activeFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm font-sans flex items-center justify-between shadow-lg">
          <span className="font-medium">{activeFeedback}</span>
          <button
            onClick={() => setActiveFeedback(null)}
            className="text-slate-400 hover:text-white font-medium text-xs px-2 py-1"
          >
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
              className={`cyber-card rounded-2xl p-6 border transition shadow-xl ${
                isPending
                  ? "border-amber-500/50 bg-amber-950/20 shadow-[0_0_25px_rgba(245,158,11,0.12)]"
                  : inc.status === "APPROVED"
                  ? "border-emerald-500/40 bg-emerald-950/20"
                  : "border-rose-500/40 bg-rose-950/20"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-sans font-bold uppercase tracking-wider ${
                      isPending
                        ? "bg-amber-500 text-slate-950"
                        : inc.status === "APPROVED"
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-rose-500 text-slate-950"
                    }`}
                  >
                    {inc.status}
                  </span>
                  <div>
                    <h3 className="font-sans text-base font-bold text-white flex items-center gap-2">
                      <span>Action ID: <code className="text-cyan-300 font-mono">{inc.actionId}</code></span>
                      <span className="text-amber-400 font-mono text-sm">({inc.toolName})</span>
                    </h3>
                    <div className="text-xs font-sans text-slate-400 flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> TTL: 300s
                      </span>
                      <span className="text-rose-400 font-semibold">
                        Risk Score: {(inc.riskScore * 100).toFixed(0)}% (CRITICAL)
                      </span>
                    </div>
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleQuarantine(inc.actionId)}
                      className="px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Quarantine</span>
                    </button>
                    <button
                      onClick={() => handleApprove(inc.actionId)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-sans font-bold flex items-center gap-1.5 transition shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve with HMAC Token</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Intercepted Parameters */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl bg-black/60 border border-slate-800">
                  <div className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Proposed Tool Arguments:
                  </div>
                  <pre className="text-cyan-200/90 font-mono text-xs overflow-x-auto leading-relaxed">
                    {JSON.stringify(inc.arguments, null, 2)}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">
                    Cryptographic Token Challenge:
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 break-all flex items-center gap-2.5">
                    <Key className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{inc.tokenChallenge}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-sans mt-2">
                    Signature: SHA-256 HMAC over <code className="text-slate-200 font-mono text-[11px]">action_id:tool:args_hash:expires_at</code>
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
