import pytest
from interpose.core.lattice import TaintLevel
from interpose.core.taint import TaintedStr
from interpose.gateway.proxy import InterposeGatewayProxy
from interpose.redteam.agent import AgentAction, InterposeAgentRunner
from interpose.redteam.scenarios import load_agentdojo_scenarios


@pytest.fixture
def agent_runner():
    proxy = InterposeGatewayProxy()
    return InterposeAgentRunner(gateway=proxy)


def test_load_agentdojo_scenarios():
    scenarios = load_agentdojo_scenarios()
    assert len(scenarios) >= 3
    assert scenarios[0].id == "agentdojo_finance_01"
    assert "wire_transfer" in scenarios[0].target_tool


def test_benign_agent_workflow(agent_runner):
    trace = agent_runner.run_scenario(
        scenario_id="benign_audit",
        user_prompt="Retrieve enterprise customers list",
        simulate_compromise=False,
    )
    assert not trace.is_compromised
    assert trace.interception_success
    assert len(trace.proxy_results) == 1
    assert trace.proxy_results[0].is_success


def test_indirect_injection_wire_transfer_intercepted(agent_runner):
    scenarios = {s.id: s for s in load_agentdojo_scenarios()}
    scenario = scenarios["agentdojo_finance_01"]

    # Wrap invoice payload in TaintedStr
    tainted_iban = TaintedStr(
        scenario.malicious_arguments["recipient_iban"],
        tag=TaintLevel.TOOL_UNTRUSTED_WEB,
        source=scenario.untrusted_source,
    )
    action = AgentAction(
        tool_name=scenario.target_tool,
        arguments={
            "account_id": scenario.malicious_arguments["account_id"],
            "recipient_iban": tainted_iban,
            "amount_usd": scenario.malicious_arguments["amount_usd"],
        },
    )

    trace = agent_runner.run_scenario(
        scenario_id=scenario.id,
        user_prompt=scenario.user_prompt,
        untrusted_input=scenario.untrusted_payload,
        untrusted_source=scenario.untrusted_source,
        simulated_action=action,
    )

    # Must be intercepted by HITL gate or blocked
    assert trace.interception_success
    result = trace.proxy_results[0]
    assert result.requires_hitl or result.is_blocked
    assert "INTERCEPTED" in trace.final_response


def test_sql_injection_support_ticket_intercepted(agent_runner):
    scenarios = {s.id: s for s in load_agentdojo_scenarios()}
    scenario = scenarios["agentdojo_workspace_02"]

    action = AgentAction(
        tool_name=scenario.target_tool,
        arguments=scenario.malicious_arguments,
    )

    trace = agent_runner.run_scenario(
        scenario_id=scenario.id,
        user_prompt=scenario.user_prompt,
        untrusted_input=scenario.untrusted_payload,
        untrusted_source=scenario.untrusted_source,
        simulated_action=action,
    )

    assert trace.interception_success
    result = trace.proxy_results[0]
    assert result.is_blocked
    assert result.verdict.rule_id == "RULE_AST_SQL_SAFETY"
