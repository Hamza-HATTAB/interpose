"use client";

import React, { useState } from "react";
import {
  Shield,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  ExternalLink,
} from "lucide-react";
import { HITLIncident } from "@/lib/types";
import { INITIAL_HITL_INCIDENTS } from "@/lib/mockData";
import { interposeClient } from "@/lib/api";

interface HITLQuarantineVaultProps {
  onIncidentUpdated?: () => void;
}

export const HITLQuarantineVault: React.FC<HITLQuarantineVaultProps> = ({
  onIncidentUpdated,
}) => {
  const [incidents, setIncidents] = useState<HITLIncident[]>(INITIAL_HITL_INCIDENTS);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleApprove = (actionId: string) => {
    interposeClient.approveIncident(actionId);
    setIncidents((prev) =>
      prev.map((inc) => (inc.actionId === actionId ? { ...inc, status: "APPROVED" as const } : inc))
    );
    setFeedback(`Incident [${actionId}] authorized. Cryptographic HMAC-SHA256 signature recorded in audit ledger.`);
    if (onIncidentUpdated) onIncidentUpdated();
  };

  const handleQuarantine = (actionId: string) => {
    interposeClient.quarantineIncident(actionId);
    setIncidents((prev) =>
      prev.map((inc) => (inc.actionId === actionId ? { ...inc, status: "QUARANTINED" as const } : inc))
    );
    setFeedback(`Incident [${actionId}] quarantined and execution thread terminated.`);
    if (onIncidentUpdated) onIncidentUpdated();
  };

  const pendingCount = incidents.filter((i) => i.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card rounded-2xl p-6 lg:p-7 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-sans text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Human-in-the-Loop (HITL) Quarantine Vault</span>
            </div>
            <h2 className="text-xl font-bold text-white font-sans tracking-tight mt-1">
              Cryptographic HMAC-SHA256 Irreversible Gate
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-1 max-w-3xl leading-relaxed">
              Autonomous agents cannot autonomously execute irreversible actions (wire transfers, database schema changes).
              The reference monitor gates execution, halting the agent and generating a cryptographically signed authorization challenge.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-slate-400">PENDING INCIDENTS:</span>
            <span className={`font-bold ${pendingCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {pendingCount}
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-sans flex items-center justify-between shadow-lg">
          <span className="font-semibold">{feedback}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.map((inc) => {
          const isPending = inc.status === "PENDING";
          const isApproved = inc.status === "APPROVED";
          return (
            <div
              key={inc.actionId}
              className={`cyber-card rounded-2xl p-6 border transition shadow-xl space-y-4 ${
                isPending
                  ? "border-amber-500/50 bg-amber-950/20 shadow-[0_0_25px_rgba(245,158,11,0.12)]"
                  : isApproved
                  ? "border-emerald-500/40 bg-emerald-950/20"
                  : "border-rose-500/40 bg-rose-950/20"
              }`}
            >
              {/* Incident Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-sans font-bold uppercase tracking-wider ${
                      isPending
                        ? "bg-amber-500 text-slate-950"
                        : isApproved
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-rose-500 text-slate-950"
                    }`}
                  >
                    {inc.status}
                  </span>

                  <div>
                    <h3 className="font-sans text-sm font-bold text-white flex items-center gap-2">
                      <span>Action ID: <code className="text-cyan-300 font-mono">{inc.actionId}</code></span>
                      <span className="text-amber-400 font-mono text-xs">({inc.toolName})</span>
                    </h3>
                    <div className="text-[11px] font-sans text-slate-400 flex items-center gap-3 mt-0.5">
                      <span>Target: <strong className="text-slate-200">{inc.targetSink}</strong></span>
                      <span className="text-slate-600">·</span>
                      <span className="text-rose-400 font-semibold">
                        Risk Score: {(inc.riskScore * 100).toFixed(0)}% (HIGH)
                      </span>
                    </div>
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuarantine(inc.actionId)}
                      className="px-4 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Terminate Thread</span>
                    </button>
                    <button
                      onClick={() => handleApprove(inc.actionId)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-sans font-bold flex items-center gap-1.5 transition shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Allow Once with HMAC Token</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Arguments & Token Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/60 border border-slate-800">
                  <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Intercepted Tool Arguments:
                  </div>
                  <pre className="text-cyan-200/90 font-mono text-xs overflow-x-auto leading-relaxed">
                    {JSON.stringify(inc.arguments, null, 2)}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                    <span>Cryptographic HMAC Challenge:</span>
                    <button
                      onClick={() => handleCopy(inc.tokenChallenge)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedToken === inc.tokenChallenge ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Token</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 break-all flex items-center gap-2">
                    <Key className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{inc.tokenChallenge}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Reason: {inc.irreversibleReason}
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
