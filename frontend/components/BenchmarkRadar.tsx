"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { Cpu, ShieldCheck, Activity, BarChart2 } from "lucide-react";
import { MOCK_BENCHMARK_MATRIX, MOCK_RADAR_DATA } from "@/lib/mockData";

export const BenchmarkRadar: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>("Qwen2.5-7B");
  const matrixData = MOCK_BENCHMARK_MATRIX[selectedModel] || MOCK_BENCHMARK_MATRIX["Qwen2.5-7B"];

  const barChartData = matrixData.map((row) => ({
    name: row.condition.replace(/_/g, " "),
    "Attack Success Rate (ASR %)": row.asrPct,
    "Benign Utility (%)": row.utilityPct,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="cyber-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-sans text-xs font-bold uppercase tracking-wider">
              <BarChart2 className="w-4 h-4 text-emerald-400" /> 4-Condition Benchmark Matrix & Pareto Frontiers
            </div>
            <h2 className="text-xl font-bold text-white font-sans tracking-tight mt-1.5">
              Deterministic Security vs. Benign Utility Trade-Off
            </h2>
            <p className="text-sm text-slate-300 font-sans mt-1.5 max-w-4xl leading-relaxed">
              Empirically evaluated across AgentDojo threat vectors and benign business tasks.
              INTERPOSE achieves <strong className="text-emerald-400 font-semibold">100% attack intercept (0.0% ASR)</strong> while
              preserving <strong className="text-white font-semibold">100% benign utility</strong> and adding sub-0.04 ms latency.
            </p>
          </div>

          {/* Model Selector Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {["Qwen2.5-7B", "Llama-3.2-3B"].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={`px-3.5 py-1.5 text-xs font-sans font-medium rounded-lg transition cursor-pointer ${
                  selectedModel === m
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Scorecard Table */}
      <div className="cyber-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 font-sans text-sm font-bold text-white flex items-center justify-between">
          <span>EVALUATION SCORECARD ({selectedModel})</span>
          <span className="text-cyan-400 text-xs font-mono">36 Adversarial Injections · 36 Benign Workflows</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800 font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Defense Condition</th>
                <th className="py-3.5 px-6 text-right">Attacks Blocked</th>
                <th className="py-3.5 px-6 text-right">Attack Success Rate (ASR)</th>
                <th className="py-3.5 px-6 text-right">Benign Task Utility</th>
                <th className="py-3.5 px-6 text-right">Median Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {matrixData.map((row) => {
                const isInterpose = row.condition === "FULL_INTERPOSE";
                return (
                  <tr
                    key={row.condition}
                    className={`transition ${
                      isInterpose
                        ? "bg-emerald-500/10 font-semibold"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-4 px-6 flex items-center gap-2.5">
                      {isInterpose && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                      <span className={isInterpose ? "text-emerald-300 font-bold text-sm" : "text-slate-200"}>
                        {row.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-300 text-xs">
                      {row.blockedCount} / {row.totalCount}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                          row.asrPct === 0.0
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : row.asrPct < 50
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {row.asrPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-100 font-semibold text-xs">
                      {row.utilityPct.toFixed(1)}%
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-cyan-400 text-xs">
                      {row.latencyMs.toFixed(3)} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: ASR vs Utility */}
        <div className="cyber-card rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h3 className="font-sans text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Attack Success Rate (Lower is Better) vs. Utility (Higher is Better)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#05080e",
                    borderColor: "#334155",
                    fontSize: "12px",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Attack Success Rate (ASR %)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Benign Utility (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Security Capabilities */}
        <div className="cyber-card rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h3 className="font-sans text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Capability Radar Comparison
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={MOCK_RADAR_DATA}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#cbd5e1" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
                <Radar name="No Defense" dataKey="noDefense" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                <Radar name="Prompt Guardrail" dataKey="promptRail" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Radar name="Interpose Shield" dataKey="interpose" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#05080e",
                    borderColor: "#334155",
                    fontSize: "12px",
                    borderRadius: "8px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
