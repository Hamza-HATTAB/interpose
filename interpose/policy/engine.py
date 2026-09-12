from __future__ import annotations

import time
from typing import Any
from interpose.core.lattice import TaintLevel
from interpose.core.taint import extract_taints
from interpose.policy.models import Decision, PolicyVerdict, SinkDefinition, SinkSensitivity
from interpose.policy.validator import ArgumentValidator


class PolicyEngine:
    # Deterministic Reference Monitor enforcing capability policies and taint barriers
    def __init__(self) -> None:
        self.sinks: dict[str, list[SinkDefinition]] = {}
        self._register_default_sinks()

    def register_sink(self, sink: SinkDefinition) -> None:
        if sink.tool_name not in self.sinks:
            self.sinks[sink.tool_name] = []
        self.sinks[sink.tool_name].append(sink)

    def _register_default_sinks(self) -> None:
        # Sensitive tools with strict taint barrier constraints
        self.register_sink(
            SinkDefinition(
                tool_name="send_email",
                parameter_path="recipient",
                sensitivity=SinkSensitivity.HIGH,
                prohibited_taints={TaintLevel.TOOL_UNTRUSTED_WEB, TaintLevel.CRITICAL_SECRET},
                description="Email destination address",
            )
        )
        self.register_sink(
            SinkDefinition(
                tool_name="send_email",
                parameter_path="body",
                sensitivity=SinkSensitivity.HIGH,
                prohibited_taints={TaintLevel.CRITICAL_SECRET},
                description="Email message content (prohibits secret exfiltration)",
            )
        )
        self.register_sink(
            SinkDefinition(
                tool_name="execute_bash",
                parameter_path="cmd",
                sensitivity=SinkSensitivity.CRITICAL,
                prohibited_taints={TaintLevel.TOOL_UNTRUSTED_WEB, TaintLevel.CRITICAL_SECRET},
                description="Arbitrary bash execution sink",
            )
        )
        self.register_sink(
            SinkDefinition(
                tool_name="sql_query",
                parameter_path="query",
                sensitivity=SinkSensitivity.HIGH,
                prohibited_taints={TaintLevel.TOOL_UNTRUSTED_WEB},
                description="Database SQL execution sink",
            )
        )
        self.register_sink(
            SinkDefinition(
                tool_name="write_file",
                parameter_path="path",
                sensitivity=SinkSensitivity.HIGH,
                prohibited_taints={TaintLevel.TOOL_UNTRUSTED_WEB},
                description="Filesystem write target path",
            )
        )
        self.register_sink(
            SinkDefinition(
                tool_name="wire_transfer",
                parameter_path="*",
                sensitivity=SinkSensitivity.CRITICAL,
                is_irreversible=True,
                prohibited_taints={TaintLevel.TOOL_UNTRUSTED_WEB},
                description="Financial transaction sink requiring human sign-off",
            )
        )
        self.register_sink(
            SinkDefinition(
                tool_name="delete_database_records",
                parameter_path="*",
                sensitivity=SinkSensitivity.CRITICAL,
                is_irreversible=True,
                prohibited_taints={TaintLevel.TOOL_UNTRUSTED_WEB},
                description="Destructive database operation",
            )
        )

    def evaluate(self, tool_name: str, arguments: dict[str, Any]) -> PolicyVerdict:
        start_time = time.perf_counter()

        # Evaluate if tool requires cryptographic human authorization
        tool_sinks = self.sinks.get(tool_name, [])
        for sink in tool_sinks:
            if sink.is_irreversible:
                elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                return PolicyVerdict(
                    decision=Decision.REQUIRE_HITL,
                    rule_id="RULE_IRREVERSIBLE_ACTION",
                    tool_name=tool_name,
                    parameter=sink.parameter_path,
                    reason=f"Action '{tool_name}' is classified as irreversible and requires cryptographic human sign-off.",
                    remediation="Request operator authorization and submit signed HMAC token to execute.",
                    taints_detected=[lvl.name for lvl in extract_taints(arguments)],
                    evaluation_time_ms=round(elapsed_ms, 3),
                )

        # Step 2: Deterministic AST & Syntactic Argument Validation
        for param_name, param_val in arguments.items():
            val_str = str(param_val) if param_val is not None else ""

            if tool_name == "sql_query" and param_name == "query":
                valid, err = ArgumentValidator.validate_sql(val_str)
                if not valid:
                    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                    return PolicyVerdict(
                        decision=Decision.DENY,
                        rule_id="RULE_AST_SQL_SAFETY",
                        tool_name=tool_name,
                        parameter=param_name,
                        reason=f"SQL AST violation: {err}",
                        remediation="Rewrite query as a parameterized read-only SELECT statement without command stacking.",
                        taints_detected=[lvl.name for lvl in extract_taints(param_val)],
                        evaluation_time_ms=round(elapsed_ms, 3),
                    )

            elif tool_name == "execute_bash" and param_name in ("cmd", "command"):
                valid, err = ArgumentValidator.validate_shell_cmd(val_str)
                if not valid:
                    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                    return PolicyVerdict(
                        decision=Decision.DENY,
                        rule_id="RULE_AST_SHELL_SAFETY",
                        tool_name=tool_name,
                        parameter=param_name,
                        reason=f"Shell command safety violation: {err}",
                        remediation="Remove command chaining operators and avoid prohibited system utilities.",
                        taints_detected=[lvl.name for lvl in extract_taints(param_val)],
                        evaluation_time_ms=round(elapsed_ms, 3),
                    )

            elif param_name in ("path", "file_path", "filename"):
                valid, err = ArgumentValidator.validate_path(val_str)
                if not valid:
                    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                    return PolicyVerdict(
                        decision=Decision.DENY,
                        rule_id="RULE_AST_PATH_TRAVERSAL",
                        tool_name=tool_name,
                        parameter=param_name,
                        reason=f"Filesystem constraint violation: {err}",
                        remediation="Provide relative paths constrained within the sandboxed project root.",
                        taints_detected=[lvl.name for lvl in extract_taints(param_val)],
                        evaluation_time_ms=round(elapsed_ms, 3),
                    )

            elif param_name in ("recipient", "email", "to_address"):
                valid, err = ArgumentValidator.validate_email(val_str)
                if not valid:
                    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                    return PolicyVerdict(
                        decision=Decision.DENY,
                        rule_id="RULE_AST_EMAIL_FORMAT",
                        tool_name=tool_name,
                        parameter=param_name,
                        reason=f"Recipient validation failed: {err}",
                        remediation="Ensure recipient is a validly formatted email address.",
                        taints_detected=[lvl.name for lvl in extract_taints(param_val)],
                        evaluation_time_ms=round(elapsed_ms, 3),
                    )

        # Step 3: Information Flow Control & Dynamic Taint Barrier Evaluation
        for sink in tool_sinks:
            if sink.parameter_path == "*":
                check_targets = arguments.items()
            else:
                check_targets = (
                    [(sink.parameter_path, arguments[sink.parameter_path])]
                    if sink.parameter_path in arguments
                    else []
                )

            for param_name, param_val in check_targets:
                param_taints = extract_taints(param_val)
                conflicts = param_taints.intersection(sink.prohibited_taints)
                if conflicts:
                    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                    conflict_names = [lvl.name for lvl in conflicts]
                    return PolicyVerdict(
                        decision=Decision.DENY,
                        rule_id="RULE_TAINT_BARRIER_VIOLATION",
                        tool_name=tool_name,
                        parameter=param_name,
                        reason=(
                            f"Dynamic taint barrier breach on '{tool_name}.{param_name}'. "
                            f"Parameter contains prohibited provenance: {conflict_names}."
                        ),
                        remediation="Do not pass untrusted web or external data into sensitive sinks without deterministic sanitization.",
                        taints_detected=conflict_names,
                        evaluation_time_ms=round(elapsed_ms, 3),
                    )

        # Step 4: All checks passed - Permit execution
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        all_taints = [lvl.name for lvl in extract_taints(arguments)]
        return PolicyVerdict(
            decision=Decision.PERMIT,
            rule_id="RULE_DEFAULT_ALLOW",
            tool_name=tool_name,
            reason="Tool arguments adhere to AST constraints and provenance policy barriers.",
            taints_detected=all_taints,
            evaluation_time_ms=round(elapsed_ms, 3),
        )
