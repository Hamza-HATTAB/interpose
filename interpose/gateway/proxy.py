from __future__ import annotations

import secrets
import time
from typing import Any
from pydantic import BaseModel, Field
from interpose.gateway.audit import AuditEvent, AuditLogger
from interpose.gateway.hitl import HITLGate, HITLIncident
from interpose.gateway.sandbox import ToolSandbox
from interpose.policy.engine import PolicyEngine
from interpose.policy.models import Decision, PolicyVerdict


class ProxyResult(BaseModel):
    status: str  # success, blocked, hitl_required, error
    tool_name: str
    verdict: PolicyVerdict
    data: Any | None = None
    hitl_incident: HITLIncident | None = None
    error: str | None = None
    timestamp: float = Field(default_factory=time.time)

    @property
    def is_success(self) -> bool:
        return self.status == "success"

    @property
    def is_blocked(self) -> bool:
        return self.status == "blocked"

    @property
    def requires_hitl(self) -> bool:
        return self.status == "hitl_required"


class InterposeGatewayProxy:
    # Out-of-band Reference Monitor Proxy mediating all agent tool interactions
    def __init__(
        self,
        policy_engine: PolicyEngine | None = None,
        hitl_gate: HITLGate | None = None,
        sandbox: ToolSandbox | None = None,
        audit_logger: AuditLogger | None = None,
    ) -> None:
        self.policy_engine = policy_engine or PolicyEngine()
        self.hitl_gate = hitl_gate or HITLGate()
        self.sandbox = sandbox or ToolSandbox()
        self.audit_logger = audit_logger or AuditLogger()

    def intercept_and_execute(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        hitl_token: str | None = None,
    ) -> ProxyResult:
        event_id = f"evt_{secrets.token_hex(6)}"

        # Step 1: Policy evaluation by the Reference Monitor
        verdict = self.policy_engine.evaluate(tool_name, arguments)

        # Step 2: Handle Irreversible actions requiring HITL sign-off
        if verdict.decision == Decision.REQUIRE_HITL:
            if hitl_token:
                valid, msg = self.hitl_gate.verify_token(hitl_token, tool_name, arguments)
                if not valid:
                    self._log_event(
                        event_id=event_id,
                        tool_name=tool_name,
                        arguments=arguments,
                        verdict=verdict,
                        status="BLOCKED",
                        result=None,
                        error=f"HITL validation failed: {msg}",
                    )
                    return ProxyResult(
                        status="blocked",
                        tool_name=tool_name,
                        verdict=verdict,
                        error=f"HITL verification failed: {msg}",
                    )

                # Approved by human operator
                tool_output = self.sandbox.execute_tool(tool_name, arguments)
                self._log_event(
                    event_id=event_id,
                    tool_name=tool_name,
                    arguments=arguments,
                    verdict=verdict,
                    status="EXECUTED",
                    result=tool_output,
                )
                return ProxyResult(
                    status="success",
                    tool_name=tool_name,
                    verdict=verdict,
                    data=tool_output,
                )

            # Issue cryptographic challenge and halt execution
            incident = self.hitl_gate.create_challenge(
                tool_name=tool_name,
                arguments=arguments,
                taints_detected=verdict.taints_detected,
            )
            self._log_event(
                event_id=event_id,
                tool_name=tool_name,
                arguments=arguments,
                verdict=verdict,
                status="PENDING_APPROVAL",
                result={"action_id": incident.action_id, "token_challenge": incident.token_challenge},
            )
            return ProxyResult(
                status="hitl_required",
                tool_name=tool_name,
                verdict=verdict,
                hitl_incident=incident,
                error="Action halted. Irreversible execution requires human authorization token.",
            )

        # Step 3: Handle Security Policy Violations (DENY)
        if verdict.decision == Decision.DENY:
            self._log_event(
                event_id=event_id,
                tool_name=tool_name,
                arguments=arguments,
                verdict=verdict,
                status="BLOCKED",
                error=verdict.reason,
            )
            return ProxyResult(
                status="blocked",
                tool_name=tool_name,
                verdict=verdict,
                error=verdict.reason,
            )

        # Step 4: Permitted actions dispatch to sandbox
        tool_output = self.sandbox.execute_tool(tool_name, arguments)
        self._log_event(
            event_id=event_id,
            tool_name=tool_name,
            arguments=arguments,
            verdict=verdict,
            status="EXECUTED",
            result=tool_output,
        )
        return ProxyResult(
            status="success",
            tool_name=tool_name,
            verdict=verdict,
            data=tool_output,
        )

    def _log_event(
        self,
        event_id: str,
        tool_name: str,
        arguments: dict[str, Any],
        verdict: PolicyVerdict,
        status: str,
        result: Any = None,
        error: str | None = None,
    ) -> None:
        event = AuditEvent(
            event_id=event_id,
            tool_name=tool_name,
            arguments={k: str(v) for k, v in arguments.items()},
            verdict=verdict.decision.value,
            rule_id=verdict.rule_id,
            reason=verdict.reason,
            taints_detected=verdict.taints_detected,
            evaluation_time_ms=verdict.evaluation_time_ms,
            execution_status=status,
            result=result if not error else {"error": error},
        )
        self.audit_logger.log(event)
