from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any
from pydantic import BaseModel, Field


class AuditEvent(BaseModel):
    event_id: str
    timestamp: float = Field(default_factory=time.time)
    tool_name: str
    arguments: dict[str, Any]
    verdict: str  # PERMIT, DENY, REQUIRE_HITL
    rule_id: str | None = None
    reason: str
    taints_detected: list[str] = Field(default_factory=list)
    evaluation_time_ms: float = 0.0
    execution_status: str  # EXECUTED, BLOCKED, PENDING_APPROVAL, FAILED
    result: Any | None = None


class AuditLogger:
    # Immutable JSONL forensic logger for security monitoring and audit replay
    def __init__(self, log_path: str | Path | None = None) -> None:
        self.log_path = Path(log_path or "data/audit_log.jsonl")
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self.in_memory_events: list[AuditEvent] = []

    def log(self, event: AuditEvent) -> None:
        self.in_memory_events.append(event)
        record = event.model_dump(mode="json")
        try:
            with open(self.log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(record) + "\n")
        except Exception:
            # Fallback keeps in_memory_events intact
            pass

    def get_recent(self, limit: int = 50) -> list[AuditEvent]:
        return self.in_memory_events[-limit:]
