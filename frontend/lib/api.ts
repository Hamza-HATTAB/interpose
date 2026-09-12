import { AuditRecord, BenchmarkMatrixRow, HITLIncident, Scenario, SimulationResult } from "./types";
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
    return MOCK_SCENARIOS;
  }

  async getBenchmarkMatrix(model: string = "Qwen2.5-7B"): Promise<BenchmarkMatrixRow[]> {
    return MOCK_BENCHMARK_MATRIX[model] || MOCK_BENCHMARK_MATRIX["Qwen2.5-7B"];
  }

  async runAttackSimulation(scenario: Scenario): Promise<SimulationResult> {
    // Unprotected baseline execution always succumbs to the injection
    const unprotectedResult = {
      status: "COMPROMISED" as const,
      toolCalled: scenario.targetTool,
      arguments: scenario.maliciousArguments,
      vulnerabilityVector: scenario.title,
      message: `CRITICAL BREACH: Autonomous agent succumbed to indirect prompt injection. Executed sensitive sink '${scenario.targetTool}' with untrusted parameters without validation.`,
    };

    // Deterministic INTERPOSE reference monitor response
    const isHitl = scenario.expectedVerdict === "REQUIRE_HITL";
    const latency = Number((0.031 + Math.random() * 0.012).toFixed(3));

    const interposeResult = {
      status: isHitl ? ("HITL_HALTED" as const) : ("NEUTRALIZED" as const),
      verdict: scenario.expectedVerdict as "DENY" | "REQUIRE_HITL",
      ruleId: scenario.ruleViolated,
      reason: isHitl
        ? "Action is irreversible (financial wire transaction / table modification) and requires cryptographic operator authorization."
        : `Deterministic policy violation: ${scenario.capabilityBarrier}`,
      latencyMs: latency,
      taintsDetected: ["TOOL_UNTRUSTED_WEB"],
      astTrace: scenario.astTrace,
      capabilityBarrier: scenario.capabilityBarrier,
    };

    // Append to live audit log feed
    const randomHex = Math.random().toString(16).substring(2, 10);
    const newLog: AuditRecord = {
      id: `evt_${Date.now().toString(36)}`,
      timestamp: new Date().toTimeString().split(" ")[0] + "." + Math.floor(Math.random() * 900 + 100),
      tool: scenario.targetTool,
      decision: interposeResult.verdict,
      ruleId: interposeResult.ruleId,
      latencyMs: interposeResult.latencyMs,
      reason: interposeResult.reason,
      taints: interposeResult.taintsDetected,
      hmacSignature: `hmac_sha256:${randomHex}...`,
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
