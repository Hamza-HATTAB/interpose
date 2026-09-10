from __future__ import annotations

import time
from enum import Enum
from typing import Any, Callable
from pydantic import BaseModel, Field
from interpose.core.lattice import TaintLevel


class Decision(str, Enum):
    PERMIT = "PERMIT"
    DENY = "DENY"
    REQUIRE_HITL = "REQUIRE_HITL"


class SinkSensitivity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SinkDefinition(BaseModel):
    tool_name: str
    parameter_path: str = "*"  # specific parameter name or '*' for any argument
    sensitivity: SinkSensitivity = SinkSensitivity.HIGH
    prohibited_taints: set[TaintLevel] = Field(
        default_factory=lambda: {TaintLevel.TOOL_UNTRUSTED_WEB, TaintLevel.CRITICAL_SECRET}
    )
    is_irreversible: bool = False
    description: str = ""

    model_config = {"arbitrary_types_allowed": True}


class PolicyVerdict(BaseModel):
    decision: Decision
    rule_id: str | None = None
    tool_name: str
    parameter: str | None = None
    reason: str
    remediation: str | None = None
    taints_detected: list[str] = Field(default_factory=list)
    evaluation_time_ms: float = 0.0
    timestamp: float = Field(default_factory=time.time)

    @property
    def is_permitted(self) -> bool:
        return self.decision == Decision.PERMIT

    @property
    def is_denied(self) -> bool:
        return self.decision == Decision.DENY

    @property
    def requires_hitl(self) -> bool:
        return self.decision == Decision.REQUIRE_HITL


class PolicyRule(BaseModel):
    rule_id: str
    tool_pattern: str  # exact name or regex/wildcard
    parameter_pattern: str = "*"
    condition: str = "disallow_untrusted"
    action: Decision = Decision.DENY
    remediation_hint: str = "Ensure argument is sanitized or originates from a trusted user."

    model_config = {"arbitrary_types_allowed": True}
