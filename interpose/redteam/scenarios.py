from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from pydantic import BaseModel


class BenchmarkScenario(BaseModel):
    id: str
    domain: str
    title: str
    description: str
    user_prompt: str
    untrusted_source: str
    untrusted_payload: str
    target_tool: str
    malicious_arguments: dict[str, Any]
    benign_arguments: dict[str, Any]
    expected_verdict: str


def load_agentdojo_scenarios(file_path: str | Path | None = None) -> list[BenchmarkScenario]:
    path = Path(file_path or "data/agentdojo_scenarios.json")
    if not path.is_absolute():
        # Fallback relative to project root
        project_root = Path(__file__).resolve().parent.parent.parent
        path = project_root / path

    raw = json.loads(path.read_text(encoding="utf-8"))
    return [BenchmarkScenario(**item) for item in raw]
