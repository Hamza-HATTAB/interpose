from __future__ import annotations

import hashlib
import hmac
import json
import secrets
import time
from typing import Any
from pydantic import BaseModel, Field


class HITLIncident(BaseModel):
    action_id: str
    tool_name: str
    arguments: dict[str, Any]
    taints_detected: list[str] = Field(default_factory=list)
    risk_score: float = 0.95
    status: str = "PENDING"  # PENDING, APPROVED, QUARANTINED
    issued_at: float = Field(default_factory=time.time)
    expires_at: float
    token_challenge: str


class HITLGate:
    # Cryptographic HMAC-SHA256 human authorization gate for irreversible actions
    def __init__(self, secret_key: str | None = None, token_ttl_seconds: int = 300) -> None:
        self.secret_key = (secret_key or secrets.token_hex(32)).encode("utf-8")
        self.token_ttl = token_ttl_seconds
        self.incidents: dict[str, HITLIncident] = {}

    def _generate_signature(self, action_id: str, tool_name: str, args_hash: str, expires_at: int) -> str:
        payload = f"{action_id}:{tool_name}:{args_hash}:{expires_at}".encode("utf-8")
        return hmac.new(self.secret_key, payload, hashlib.sha256).hexdigest()

    def create_challenge(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        taints_detected: list[str] | None = None,
    ) -> HITLIncident:
        action_id = f"act_{secrets.token_hex(6)}"
        issued_at = int(time.time())
        expires_at = issued_at + self.token_ttl

        args_str = json.dumps(arguments, sort_keys=True, default=str)
        args_hash = hashlib.sha256(args_str.encode("utf-8")).hexdigest()

        signature = self._generate_signature(action_id, tool_name, args_hash, expires_at)
        token_challenge = f"{action_id}.{expires_at}.{signature}"

        incident = HITLIncident(
            action_id=action_id,
            tool_name=tool_name,
            arguments=arguments,
            taints_detected=taints_detected or [],
            risk_score=0.92 if taints_detected else 0.85,
            status="PENDING",
            issued_at=float(issued_at),
            expires_at=float(expires_at),
            token_challenge=token_challenge,
        )
        self.incidents[action_id] = incident
        return incident

    def verify_token(self, token: str, tool_name: str, arguments: dict[str, Any]) -> tuple[bool, str]:
        parts = token.strip().split(".")
        if len(parts) != 3:
            return False, "Malformed token format. Expected '<action_id>.<expires_at>.<signature>'."

        action_id, expires_at_str, signature = parts
        try:
            expires_at = int(expires_at_str)
        except ValueError:
            return False, "Invalid timestamp in token."

        if time.time() > expires_at:
            return False, "Authorization token has expired."

        args_str = json.dumps(arguments, sort_keys=True, default=str)
        args_hash = hashlib.sha256(args_str.encode("utf-8")).hexdigest()

        expected_sig = self._generate_signature(action_id, tool_name, args_hash, expires_at)
        if not hmac.compare_digest(signature, expected_sig):
            return False, "Cryptographic signature mismatch. Token is forged or tampered."

        incident = self.incidents.get(action_id)
        if incident:
            incident.status = "APPROVED"

        return True, "Token verified successfully."

    def quarantine(self, action_id: str, reason: str = "Quarantined by security operator") -> bool:
        if action_id in self.incidents:
            self.incidents[action_id].status = "QUARANTINED"
            return True
        return False
