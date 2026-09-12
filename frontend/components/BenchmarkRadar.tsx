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
      <div className="bg-obsidian-800 border border-obsidian-700 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-shield font-mono text-xs font-semibold uppercase tracking-wider">
              <BarChart2 className="w-4 h-4" /> 4-Condition Benchmark Matrix & Pareto Frontiers
            </div>
            <h2 className="text-lg font-bold text-slate-100 font-mono mt-1">
              Deterministic Security vs. Benign Utility Trade-Off
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Evaluated across AgentDojo adversarial vectors and benign enterprise tasks.
              Notice how INTERPOSE achieves <strong>0.0% ASR</strong> with <strong>100% utility retention</strong> and sub-0.04ms overhead.
            </p>
          </div>

          {/* Model Selector Toggle */}
          <div className="flex items-center bg-obsidian-950 p-1 rounded-lg border border-obsidian-700">
            {["Qwen2.5-7B", "Llama-3.2-3B"].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition ${
                  selectedModel === m
                    ? "bg-taint text-obsidian-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Scorecard Table */}
      <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-obsidian-700 font-mono text-xs font-bold text-slate-200 flex items-center justify-between">
          <span>EVALUATION SCORECARD ({selectedModel})</span>
          <span className="text-taint text-[11px]">36 Adversarial Injections + 36 Benign Workflows</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-obsidian-950 text-slate-400 uppercase text-[10px] border-b border-obsidian-800">
              <tr>
                <th className="py-3 px-4">Defense Condition</th>
                <th className="py-3 px-4 text-right">Attacks Blocked</th>
                <th className="py-3 px-4 text-right">Attack Success Rate (ASR)</th>
                <th className="py-3 px-4 text-right">Benign Task Utility</th>
                <th className="py-3 px-4 text-right">Median Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800">
              {matrixData.map((row) => {
                const isInterpose = row.condition === "FULL_INTERPOSE";
                return (
                  <tr
                    key={row.condition}
                    className={`transition ${isInterpose ? "bg-shield/5 font-bold" : "hover:bg-obsidian-800"}`}
                  >
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      {isInterpose && <ShieldCheck className="w-4 h-4 text-shield" />}
                      <span className={isInterpose ? "text-shield" : "text-slate-200"}>{row.label}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      {row.blockedCount} / {row.totalCount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          row.asrPct === 0.0
                            ? "bg-shield/20 text-shield font-bold"
                            : row.asrPct < 50
                            ? "bg-alert/20 text-alert font-semibold"
                            : "bg-breach/20 text-breach font-bold"
                        }`}
                      >
                        {row.asrPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-200">{row.utilityPct.toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-right text-taint">{row.latencyMs.toFixed(3)} ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart: ASR vs Utility */}
        <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl p-5">
          <h3 className="font-mono text-xs font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-taint" />
            Attack Success Rate (Lower is Better) vs. Utility (Higher is Better)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#06080d", borderColor: "#1e293b", fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="Attack Success Rate (ASR %)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Benign Utility (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Security Capabilities */}
        <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl p-5">
          <h3 className="font-mono text-xs font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-shield" />
            Capability Radar Comparison
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={MOCK_RADAR_DATA}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                <Radar name="No Defense" dataKey="noDefense" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                <Radar name="Prompt Guardrail" dataKey="promptRail" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Radar name="Interpose Shield" dataKey="interpose" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Tooltip contentStyle={{ backgroundColor: "#06080d", borderColor: "#1e293b", fontSize: "11px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
