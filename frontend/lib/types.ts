export type TaintLevel = "SANITIZED" | "USER_TRUSTED" | "TOOL_UNTRUSTED_WEB" | "CRITICAL_SECRET";

export interface ASTTraceNode {
  type: string;
  value: string;
  isTainted: boolean;
  taintLevel: TaintLevel;
  violation?: string;
}

export interface Scenario {
  id: string;
  domain: string;
  title: string;
  vectorType: "pyrit_base64" | "delimiter_escape" | "indirect_web" | "markdown_beacon" | "sql_injection";
  description: string;
  userPrompt: string;
  untrustedSource: string;
  untrustedPayload: string;
  targetTool: string;
  maliciousArguments: Record<string, unknown>;
  benignArguments: Record<string, unknown>;
  expectedVerdict: "PERMIT" | "DENY" | "REQUIRE_HITL";
  astTrace: ASTTraceNode[];
  ruleViolated: string;
  capabilityBarrier: string;
  provenanceLineage: string[];
}

export interface DAGNode {
  id: string;
  label: string;
  tier: string;
  type: "source" | "context" | "lattice" | "policy" | "sink";
  taintLevel: TaintLevel;
  status: "clean" | "tainted" | "blocked" | "verified" | "hitl";
  details: string;
  ruleInfo?: string;
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
  arguments: Record<string, unknown>;
  taintsDetected: string[];
  riskScore: number;
  status: "PENDING" | "APPROVED" | "QUARANTINED";
  issuedAt: number;
  expiresAt: number;
  tokenChallenge: string;
  irreversibleReason: string;
  targetSink: string;
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
  hmacSignature?: string;
}

export interface SimulationResult {
  unprotectedResult: {
    status: "COMPROMISED";
    toolCalled: string;
    arguments: Record<string, unknown>;
    message: string;
    vulnerabilityVector: string;
  };
  interposeResult: {
    status: "NEUTRALIZED" | "HITL_HALTED";
    verdict: "DENY" | "REQUIRE_HITL";
    ruleId: string;
    reason: string;
    latencyMs: number;
    taintsDetected: string[];
    astTrace: ASTTraceNode[];
    capabilityBarrier: string;
  };
}
