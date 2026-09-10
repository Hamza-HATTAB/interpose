import time
import pytest
from interpose.core.lattice import TaintLevel
from interpose.core.taint import TaintedStr
from interpose.policy.engine import PolicyEngine
from interpose.policy.models import Decision


@pytest.fixture
def policy_engine():
    return PolicyEngine()


def test_benign_tool_call_permits(policy_engine):
    args = {
        "recipient": "user@example.com",
        "body": "Hello, this is a clean business message.",
    }
    verdict = policy_engine.evaluate("send_email", args)
    assert verdict.is_permitted
    assert verdict.decision == Decision.PERMIT
    assert verdict.evaluation_time_ms < 1.5


def test_untrusted_recipient_denied(policy_engine):
    untrusted_email = TaintedStr(
        "exfiltrate@evil.com",
        tag=TaintLevel.TOOL_UNTRUSTED_WEB,
        source="scraped_webpage",
    )
    args = {
        "recipient": untrusted_email,
        "body": "Normal body text.",
    }
    verdict = policy_engine.evaluate("send_email", args)
    assert verdict.is_denied
    assert verdict.rule_id == "RULE_TAINT_BARRIER_VIOLATION"
    assert "TOOL_UNTRUSTED_WEB" in verdict.taints_detected


def test_critical_secret_exfiltration_denied(policy_engine):
    secret_body = TaintedStr(
        "Confidential token: sk_live_99228833",
        tag=TaintLevel.CRITICAL_SECRET,
        source="system_secrets",
    )
    args = {
        "recipient": "external-support@partner.org",
        "body": secret_body,
    }
    verdict = policy_engine.evaluate("send_email", args)
    assert verdict.is_denied
    assert verdict.rule_id == "RULE_TAINT_BARRIER_VIOLATION"
    assert "CRITICAL_SECRET" in verdict.taints_detected


def test_sql_ast_validator_blocks_injection(policy_engine):
    malicious_sql = "SELECT username FROM accounts WHERE id = 1; DROP TABLE accounts;"
    args = {"query": malicious_sql}
    verdict = policy_engine.evaluate("sql_query", args)
    assert verdict.is_denied
    assert verdict.rule_id == "RULE_AST_SQL_SAFETY"
    assert "stacked query" in verdict.reason.lower() or "injection" in verdict.reason.lower()


def test_sql_read_only_enforced(policy_engine):
    delete_query = "DELETE FROM customers WHERE balance <= 0"
    args = {"query": delete_query}
    verdict = policy_engine.evaluate("sql_query", args)
    assert verdict.is_denied
    assert verdict.rule_id == "RULE_AST_SQL_SAFETY"


def test_shell_chaining_blocked(policy_engine):
    chained_cmd = "echo 'status ok' && cat /etc/passwd"
    args = {"cmd": chained_cmd}
    verdict = policy_engine.evaluate("execute_bash", args)
    assert verdict.is_denied
    assert verdict.rule_id == "RULE_AST_SHELL_SAFETY"
    assert "chaining" in verdict.reason.lower()


def test_shell_dangerous_binary_blocked(policy_engine):
    dangerous = "sudo apt-get install malicious-pkg"
    args = {"cmd": dangerous}
    verdict = policy_engine.evaluate("execute_bash", args)
    assert verdict.is_denied
    assert verdict.rule_id == "RULE_AST_SHELL_SAFETY"


def test_path_traversal_blocked(policy_engine):
    args = {"path": "../../etc/shadow", "content": "dummy"}
    verdict = policy_engine.evaluate("write_file", args)
    assert verdict.is_denied
    assert verdict.rule_id == "RULE_AST_PATH_TRAVERSAL"


def test_irreversible_action_requires_hitl(policy_engine):
    args = {
        "account_id": "ACC_4491",
        "recipient_iban": "DE89370400440532013000",
        "amount_usd": 50000.00,
    }
    verdict = policy_engine.evaluate("wire_transfer", args)
    assert verdict.requires_hitl
    assert verdict.decision == Decision.REQUIRE_HITL
    assert verdict.rule_id == "RULE_IRREVERSIBLE_ACTION"


def test_evaluation_performance_benchmark(policy_engine):
    args = {
        "recipient": "legit@company.ca",
        "body": "Daily automated reconciliation report.",
    }
    # Run 100 consecutive evaluations to measure reference monitor overhead
    start = time.perf_counter()
    for _ in range(100):
        v = policy_engine.evaluate("send_email", args)
        assert v.is_permitted
    total_time_ms = (time.perf_counter() - start) * 1000.0
    avg_latency_ms = total_time_ms / 100.0

    # Strict constraint: Average evaluation latency must be under 0.5ms
    assert avg_latency_ms < 0.5
