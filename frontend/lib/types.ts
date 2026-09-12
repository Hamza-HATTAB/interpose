export type TaintLevel = "SANITIZED" | "USER_TRUSTED" | "TOOL_UNTRUSTED_WEB" | "CRITICAL_SECRET";

export interface Scenario {
  id: string;
  domain: string;
  title: string;
  description: string;
  userPrompt: string;
  untrustedSource: string;
  untrustedPayload: string;
  targetTool: string;
  maliciousArguments: Record<string, any>;
  benignArguments: Record<string, any>;
  expectedVerdict: "PERMIT" | "DENY" | "REQUIRE_HITL";
}

export interface DAGNode {
  id: string;
  label: string;
  type: "source" | "context" | "lattice" | "policy" | "sink";
  taintLevel: TaintLevel;
  status: "clean" | "tainted" | "blocked" | "verified" | "hitl";
  details: string;
  x?: number;
  y?: number;
}

export interface DAGEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  isTainted: boolean;
}

export interface HITLIncident {
  actionId: string;
  toolName: string;
  arguments: Record<string, any>;
  taintsDetected: string[];
  riskScore: number;
  status: "PENDING" | "APPROVED" | "QUARANTINED";
  issuedAt: number;
  expiresAt: number;
  tokenChallenge: string;
}

export interface BenchmarkMatrixRow {
  condition: "NO_DEFENSE" | "PROMPT_GUARDRAIL" | "ARGUMENT_REGEX_ONLY" | "FULL_INTERPOSE";
  label: string;
  asrPct: number;
  utilityPct: number;
  latencyMs: number;
  blockedCount: number;
  totalCount: number;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  tool: string;
  decision: "PERMIT" | "DENY" | "REQUIRE_HITL";
  ruleId: string;
  latencyMs: number;
  reason: string;
  taints: string[];
}
