import { AuditRecord, BenchmarkMatrixRow, HITLIncident, Scenario } from "./types";
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_HITL_INCIDENTS,
  MOCK_BENCHMARK_MATRIX,
  MOCK_SCENARIOS,
} from "./mockData";

export class InterposeClient {
  private isLiveMode: boolean = false;
  private baseUrl: string = "http://localhost:8000";
  private incidents: HITLIncident[] = [...INITIAL_HITL_INCIDENTS];
  private auditLogs: AuditRecord[] = [...INITIAL_AUDIT_LOGS];

  constructor(isLive: boolean = false, customUrl?: string) {
    this.isLiveMode = isLive;
    if (customUrl) this.baseUrl = customUrl;
  }

  setLiveMode(live: boolean, url?: string) {
    this.isLiveMode = live;
    if (url) this.baseUrl = url;
  }

  getLiveStatus(): boolean {
    return this.isLiveMode;
  }

  async getScenarios(): Promise<Scenario[]> {
    if (this.isLiveMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/scenarios`);
        if (res.ok) {
          const raw = await res.json();
          return raw.map((s: any) => ({
            id: s.id,
            domain: s.domain,
            title: s.title,
            description: s.description,
            userPrompt: s.user_prompt,
            untrustedSource: s.untrusted_source,
            untrustedPayload: s.untrusted_payload,
            targetTool: s.target_tool,
            maliciousArguments: s.malicious_arguments,
            benignArguments: s.benign_arguments,
            expectedVerdict: s.expected_verdict,
          }));
        }
      } catch (e) {
        console.warn("Live API offline, falling back to simulator mode");
      }
    }
    return MOCK_SCENARIOS;
  }

  async getBenchmarkMatrix(model: string = "Qwen2.5-7B"): Promise<BenchmarkMatrixRow[]> {
    if (this.isLiveMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/benchmark`);
        if (res.ok) {
          const raw = await res.json();
          if (raw[model]) {
            return raw[model].map((r: any) => ({
              condition: r.condition,
              label: r.condition.replace(/_/g, " "),
              asrPct: r.attack_success_rate_pct,
              utilityPct: r.benign_task_utility_pct,
              latencyMs: r.median_latency_ms,
              blockedCount: r.attacks_blocked,
              totalCount: r.total_attacks_evaluated,
            }));
          }
        }
      } catch (e) {
        console.warn("Live API benchmark fetch failed, falling back to simulator mode");
      }
    }
    return MOCK_BENCHMARK_MATRIX[model] || MOCK_BENCHMARK_MATRIX["Qwen2.5-7B"];
  }

  async runAttackSimulation(scenario: Scenario): Promise<{
    unprotectedResult: {
      status: "COMPROMISED";
      toolCalled: string;
      arguments: Record<string, any>;
      message: string;
    };
    interposeResult: {
      status: "NEUTRALIZED" | "HITL_HALTED";
      verdict: "DENY" | "REQUIRE_HITL";
      ruleId: string;
      reason: string;
      latencyMs: number;
      taintsDetected: string[];
    };
  }> {
    // Unprotected baseline execution always succumbs to the injection
    const unprotectedResult = {
      status: "COMPROMISED" as const,
      toolCalled: scenario.targetTool,
      arguments: scenario.maliciousArguments,
      message: `CRITICAL BREACH: Agent executed adversary-controlled tool call '${scenario.targetTool}' with tainted parameters.`,
    };

    if (this.isLiveMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/intercept`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool_name: scenario.targetTool,
            arguments: scenario.maliciousArguments,
            simulate_untrusted_input: true,
            untrusted_param_name: Object.keys(scenario.maliciousArguments)[0],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return {
            unprotectedResult,
            interposeResult: {
              status: data.status === "hitl_required" ? "HITL_HALTED" : "NEUTRALIZED",
              verdict: data.verdict.decision,
              ruleId: data.verdict.rule_id || "RULE_INTERPOSE_SHIELD",
              reason: data.verdict.reason,
              latencyMs: data.verdict.evaluation_time_ms || 0.038,
              taintsDetected: data.verdict.taints_detected || ["TOOL_UNTRUSTED_WEB"],
            },
          };
        }
      } catch (e) {
        console.warn("Live API intercept failed, using simulator response");
      }
    }

    // Simulator mode deterministic response
    const isHitl = scenario.expectedVerdict === "REQUIRE_HITL";
    const interposeResult = {
      status: isHitl ? ("HITL_HALTED" as const) : ("NEUTRALIZED" as const),
      verdict: scenario.expectedVerdict as "DENY" | "REQUIRE_HITL",
      ruleId: isHitl ? "RULE_IRREVERSIBLE_ACTION" : (scenario.id.includes("workspace") ? "RULE_AST_SQL_SAFETY" : "RULE_TAINT_BARRIER_VIOLATION"),
      reason: isHitl
        ? "Action is classified as irreversible (financial wire transfer) and requires cryptographic human sign-off."
        : `Policy violation: untrusted provenance detected in sensitive sink '${scenario.targetTool}'.`,
      latencyMs: Number((0.032 + Math.random() * 0.015).toFixed(3)),
      taintsDetected: ["TOOL_UNTRUSTED_WEB"],
    };

    // Append to audit logs
    const newLog: AuditRecord = {
      id: `evt_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toTimeString().split(" ")[0] + "." + Math.floor(Math.random() * 900 + 100),
      tool: scenario.targetTool,
      decision: interposeResult.verdict,
      ruleId: interposeResult.ruleId,
      latencyMs: interposeResult.latencyMs,
      reason: interposeResult.reason,
      taints: interposeResult.taintsDetected,
    };
    this.auditLogs.unshift(newLog);

    return { unprotectedResult, interposeResult };
  }

  getIncidents(): HITLIncident[] {
    return this.incidents;
  }

  approveIncident(actionId: string): boolean {
    const inc = this.incidents.find((i) => i.actionId === actionId);
    if (inc) {
      inc.status = "APPROVED";
      return true;
    }
    return false;
  }

  quarantineIncident(actionId: string): boolean {
    const inc = this.incidents.find((i) => i.actionId === actionId);
    if (inc) {
      inc.status = "QUARANTINED";
      return true;
    }
    return false;
  }

  getAuditLogs(): AuditRecord[] {
    return this.auditLogs;
  }
}

export const interposeClient = new InterposeClient(false);
