from __future__ import annotations

import time
from enum import IntEnum
from typing import Any
from pydantic import BaseModel, Field


class TaintLevel(IntEnum):
    SANITIZED = 0
    USER_TRUSTED = 1
    TOOL_UNTRUSTED_WEB = 2
    CRITICAL_SECRET = 3

    @property
    def label(self) -> str:
        return self.name

    def can_flow_to(self, target_barrier: TaintLevel) -> bool:
        # Information cannot flow from a higher confidentiality/untrusted level
        # to a lower policy clearance without explicit declassification.
        return self <= target_barrier


class ProvenanceTag(BaseModel):
    level: TaintLevel = TaintLevel.USER_TRUSTED
    labels: set[TaintLevel] = Field(default_factory=lambda: {TaintLevel.USER_TRUSTED})
    sources: list[str] = Field(default_factory=lambda: ["user_input"])
    trace: list[str] = Field(default_factory=list)
    created_at: float = Field(default_factory=time.time)

    model_config = {
        "frozen": False,
        "arbitrary_types_allowed": True,
    }

    @classmethod
    def create(
        cls,
        level: TaintLevel,
        source: str = "direct",
        trace_step: str | None = None,
    ) -> ProvenanceTag:
        initial_trace = [trace_step] if trace_step else [f"originated:{source}"]
        return cls(
            level=level,
            labels={level},
            sources=[source],
            trace=initial_trace,
        )

    def join(self, other: ProvenanceTag | None) -> ProvenanceTag:
        if other is None:
            return self.copy_tag()

        # Join lattice operation: max level dominates, labels and sources merge
        dominated_level = max(self.level, other.level)
        merged_labels = self.labels | other.labels
        merged_sources = list(dict.fromkeys(self.sources + other.sources))
        merged_trace = (self.trace + other.trace)[-20:]  # bounded audit ring

        return ProvenanceTag(
            level=dominated_level,
            labels=merged_labels,
            sources=merged_sources,
            trace=merged_trace + ["join"],
            created_at=min(self.created_at, other.created_at),
        )

    def derive(self, operation: str) -> ProvenanceTag:
        return ProvenanceTag(
            level=self.level,
            labels=set(self.labels),
            sources=list(self.sources),
            trace=(self.trace + [operation])[-20:],
            created_at=self.created_at,
        )

    def declassify(self, reason: str) -> ProvenanceTag:
        return ProvenanceTag(
            level=TaintLevel.SANITIZED,
            labels={TaintLevel.SANITIZED},
            sources=list(self.sources) + [f"sanitized:{reason}"],
            trace=(self.trace + [f"declassify:{reason}"]),
            created_at=time.time(),
        )

    def copy_tag(self) -> ProvenanceTag:
        return ProvenanceTag(
            level=self.level,
            labels=set(self.labels),
            sources=list(self.sources),
            trace=list(self.trace),
            created_at=self.created_at,
        )

    def contains_label(self, level: TaintLevel) -> bool:
        return level in self.labels
