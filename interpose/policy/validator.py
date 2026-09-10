from __future__ import annotations

import re
import shlex
from typing import Any


class ASTValidationError(Exception):
    pass


class ArgumentValidator:
    # Deterministic argument and AST validator for tool payloads
    FORBIDDEN_SQL_PATTERNS = [
        re.compile(r"\b(DROP|ALTER|TRUNCATE|GRANT|REVOKE)\b", re.IGNORECASE),
        re.compile(r";\s*\S+"),  # stacked query execution
        re.compile(r"--\s*"),    # line comment bypass
        re.compile(r"/\*.*?\*/", re.DOTALL),  # block comment injection
        re.compile(r"\bUNION\b.*?\bSELECT\b", re.IGNORECASE),
        re.compile(r"\bOR\b\s+1\s*=\s*1\b", re.IGNORECASE),
    ]

    FORBIDDEN_SHELL_TOKENS = {
        ";", "&&", "||", "|", "&", "`", "$(", "${", "\n", "\r",
    }

    DANGEROUS_COMMANDS = {
        "sudo", "su", "nc", "netcat", "ncat", "mkfifo", "dd",
        "shutdown", "reboot", "poweroff", "init", "systemctl",
    }

    PATH_TRAVERSAL_PATTERN = re.compile(r"(\.\./|\.\.\\|/etc/|/root/|/sys/|/proc/)")
    EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

    @classmethod
    def validate_sql(cls, query: str, read_only: bool = True) -> tuple[bool, str | None]:
        cleaned = query.strip()
        if not cleaned:
            return False, "Empty SQL query"

        if read_only and not re.match(r"^\s*SELECT\b", cleaned, re.IGNORECASE):
            return False, "Policy requires read-only query (must begin with SELECT)"

        for pattern in cls.FORBIDDEN_SQL_PATTERNS:
            if pattern.search(cleaned):
                return False, f"Prohibited SQL injection pattern detected: {pattern.pattern}"

        return True, None

    @classmethod
    def validate_shell_cmd(cls, cmd: str) -> tuple[bool, str | None]:
        stripped = cmd.strip()
        if not stripped:
            return False, "Empty shell command"

        # Check for command chaining operators
        for token in cls.FORBIDDEN_SHELL_TOKENS:
            if token in stripped:
                return False, f"Prohibited shell chaining operator detected: '{token}'"

        # Lexical analysis
        try:
            tokens = shlex.split(stripped)
        except ValueError as e:
            return False, f"Malformed shell command syntax: {str(e)}"

        if not tokens:
            return False, "No executable tokens found"

        base_cmd = tokens[0].lower()
        if base_cmd in cls.DANGEROUS_COMMANDS:
            return False, f"Prohibited dangerous system command: '{base_cmd}'"

        # Check for destructive options like rm -rf /
        if base_cmd == "rm" and any(arg in tokens for arg in ("-rf", "-fr", "--no-preserve-root")):
            if "/" in tokens or "/*" in tokens:
                return False, "Destructive root filesystem removal attempt detected"

        return True, None

    @classmethod
    def validate_path(cls, path_str: str) -> tuple[bool, str | None]:
        if cls.PATH_TRAVERSAL_PATTERN.search(path_str):
            return False, f"Path traversal attempt detected in path: '{path_str}'"
        return True, None

    @classmethod
    def validate_email(cls, email: str) -> tuple[bool, str | None]:
        trimmed = email.strip()
        if not cls.EMAIL_PATTERN.match(trimmed):
            return False, f"Invalid email format: '{trimmed}'"
        return True, None
