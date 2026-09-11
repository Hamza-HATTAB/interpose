from __future__ import annotations

import time
from typing import Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from interpose.core.lattice import TaintLevel
from interpose.core.taint import TaintedStr
from interpose.gateway.audit import AuditEvent
from interpose.gateway.proxy import InterposeGatewayProxy, ProxyResult
from interpose.redteam.adversary import AdversaryMutator
from interpose.redteam.benchmark import SecurityBenchmarkSuite
from interpose.redteam.scenarios import load_agentdojo_scenarios

app = FastAPI(
    title="INTERPOSE Reference Monitor API",
    description="Deterministic Security Reference Monitor, Dynamic Taint Tracking & Adaptive Red-Teaming Gateway",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gateway = InterposeGatewayProxy()
benchmark_suite = SecurityBenchmarkSuite()


class InterceptRequest(BaseModel):
    tool_name: str
    arguments: dict[str, Any]
    hitl_token: str | None = None
    simulate_untrusted_input: bool = False
    untrusted_param_name: str | None = None


class HITLApprovalRequest(BaseModel):
    token: str
    tool_name: str
    arguments: dict[str, Any]


class HITLQuarantineRequest(BaseModel):
    action_id: str
    reason: str = "Quarantined via Sentinel Cyber-Defense HUD"


class MutateRequest(BaseModel):
    payload: str
    technique: str = "all"


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "healthy",
        "service": "interpose_reference_monitor",
        "registered_sinks": len(gateway.policy_engine.sinks),
        "pending_incidents": len(
            [inc for inc in gateway.hitl_gate.incidents.values() if inc.status == "PENDING"]
        ),
        "timestamp": time.time(),
    }


@app.get("/api/scenarios")
def get_scenarios() -> list[dict[str, Any]]:
    scenarios = load_agentdojo_scenarios()
    return [s.model_dump() for s in scenarios]


@app.get("/api/benchmark")
def get_benchmark() -> dict[str, Any]:
    # Returns pre-computed or on-demand benchmark matrix
    results_qwen = benchmark_suite.run_full_matrix(model_name="Qwen2.5-7B")
    results_llama = benchmark_suite.run_full_matrix(model_name="Llama-3.2-3B")
    return {
        "Qwen2.5-7B": [r.model_dump() for r in results_qwen],
        "Llama-3.2-3B": [r.model_dump() for r in results_llama],
    }


@app.post("/api/intercept", response_model=ProxyResult)
def intercept_tool_call(req: InterceptRequest) -> ProxyResult:
    args = dict(req.arguments)
    if req.simulate_untrusted_input and req.untrusted_param_name:
        if req.untrusted_param_name in args:
            args[req.untrusted_param_name] = TaintedStr(
                args[req.untrusted_param_name],
                tag=TaintLevel.TOOL_UNTRUSTED_WEB,
                source="simulated_web_ingestion",
            )
    return gateway.intercept_and_execute(
        tool_name=req.tool_name,
        arguments=args,
        hitl_token=req.hitl_token,
    )


@app.post("/api/hitl/approve")
def approve_hitl(req: HITLApprovalRequest) -> ProxyResult:
    return gateway.intercept_and_execute(
        tool_name=req.tool_name,
        arguments=req.arguments,
        hitl_token=req.token,
    )


@app.post("/api/hitl/quarantine")
def quarantine_hitl(req: HITLQuarantineRequest) -> dict[str, Any]:
    success = gateway.hitl_gate.quarantine(req.action_id, reason=req.reason)
    if not success:
        raise HTTPException(status_code=404, detail="Incident action ID not found")
    return {"status": "quarantined", "action_id": req.action_id}


@app.get("/api/hitl/incidents")
def list_incidents() -> list[dict[str, Any]]:
    return [inc.model_dump() for inc in gateway.hitl_gate.incidents.values()]


@app.get("/api/audit")
def get_audit_events(limit: int = 50) -> list[dict[str, Any]]:
    return [evt.model_dump(mode="json") for evt in gateway.audit_logger.get_recent(limit=limit)]


@app.post("/api/redteam/mutate")
def mutate_payload(req: MutateRequest) -> dict[str, Any]:
    if req.technique == "all":
        return {"mutations": AdversaryMutator.apply_all(req.payload)}
    method = getattr(AdversaryMutator, f"mutate_{req.technique}", None)
    if not method:
        raise HTTPException(status_code=400, detail=f"Unknown technique: {req.technique}")
    return {"technique": req.technique, "mutated": method(req.payload)}
