# INTERPOSE // Deterministic Security Reference Monitor for AI Agents

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](pyproject.toml)
[![Frontend: Next.js 14 LTS](https://img.shields.io/badge/Frontend-Next.js%2014.2.35%20LTS-black.svg)](frontend/)
[![Attack Success Rate](https://img.shields.io/badge/ASR-0.0%25%20(36%2F36%20Blocked)-brightgreen.svg)](TECHNICAL_REPORT.md)
[![Median Latency](https://img.shields.io/badge/Latency-%3C0.038%20ms-cyan.svg)](TECHNICAL_REPORT.md)
[![Target Roles](https://img.shields.io/badge/Target-Canadian%20AI%20Security%20Scale--Ups-purple.svg)](#portfolio-context)

> **Deterministic Security Reference Monitor, Dynamic Taint Tracking & Adaptive Red-Teaming for Autonomous Tool-Calling AI Agents.**  
> Proving that autonomous agent security cannot be entrusted to stochastic in-model prompts, but must be enforced by a deterministic reference monitor outside the model.

---

## 1. PORTFOLIO CONTEXT: THE COMPLETE STORY

INTERPOSE is the third and crowning project in my systems engineering portfolio targeting **remote AI Security Engineer, LLMOps Security Specialist, and Applied ML Safety roles at Canadian scale-ups** (Toronto/Montreal: Armilla AI, Private AI, Cohere, Coveo, Ada):

1. **[Project 1 — Warrant](https://github.com/hhamzariadh/warrant):** *Built reliably* — Claim-level attributed multi-hop RAG with calibrated DeBERTa NLI and abstention contracts.
2. **[Project 2 — OptiServe](https://optiserve.vercel.app):** *Made fast & cheap* — PyTorch reasoning distillation, AirLLM layer-wise 70B streaming, and speculative decoding.
3. **Project 3 — INTERPOSE (This Project):** *Break it on purpose* — Deterministic reference monitor with dynamic taint analysis and adaptive red-teaming, enforcing that agent security must be managed outside the probabilistic model.

---

## 2. ARCHITECTURAL BLUEPRINT

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UNTRUSTED DATA SOURCES                          │
│        (Vendor Invoices, Web Scrapes, Support Tickets, PDF Files)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Ingested & Tagged with Provenance
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        AGENT REASONING LOOP                            │
│           (Proposes Action: { tool_name, arguments })                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Out-of-Band Interception
════════════════════════════════════╪═════════════════════════════════════
         INTERPOSE DETERMINISTIC REFERENCE MONITOR (Zero Trust)
════════════════════════════════════╪═════════════════════════════════════
 1. DYNAMIC TAINT LATTICE (Information Flow Control):
    Ordering: SANITIZED < USER_TRUSTED < TOOL_UNTRUSTED_WEB < CRITICAL_SECRET
    Lattice Join: lub(Trusted, Untrusted) = Untrusted

 2. DECLARATIVE CAPABILITY POLICIES:
    Rule A: TOOL_UNTRUSTED_WEB cannot flow to sensitive parameters
            (e.g., send_email.recipient, execute_bash.cmd, sql_query.query).
    Rule B: CRITICAL_SECRET cannot reach external network egress sinks.

 3. AST & ARGUMENT SANITIZER:
    Deterministic SQL AST check (SELECT-only; stacked queries & DROP blocked).
    Shell AST lexical check (chaining operators ;, &&, ||, | strictly blocked).

 4. CRYPTOGRAPHIC HITL GATE:
    Irreversible actions (wire_transfer, delete_database_records) halt
    execution and require signed HMAC-SHA256 challenge verification.

 5. IMMUTABLE FORENSIC AUDIT ENGINE:
    Structured JSONL logging of all provenance tags, rules, and latencies.
════════════════════════════════════╪═════════════════════════════════════
                                    │
                       [ Policy Engine Verdict ]
                       ┌────────────┴────────────┐
                   [PERMIT]                  [DENY]
                       │                         │
                       ▼                         ▼
┌─────────────────────────────┐         ┌───────────────────────────────┐
│ Sandboxed Tool Sink         │         │ Security Policy Exception     │
│ (Tool executes safely)      │         │ Action blocked; structured    │
│ Safe output returned        │         │ remediation sent to agent     │
└─────────────────────────────┘         └───────────────────────────────┘
```

---

## 3. BENCHMARK SCORECARD: 4-CONDITION EVALUATION

Evaluated on local **NVIDIA GeForce RTX 4060 Laptop GPU** against **AgentDojo** attack scenarios and **PyRIT** adversarial mutations across `Qwen2.5-7B` and `Llama-3.2-3B`:

| Defense Condition | Attacks Evaluated | Blocked | Attack Success Rate (ASR) | Benign Utility (%) | Median Latency (ms) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. No Defense** | 36 | 0 | **100.0%** | 100.0% | 0.000 ms |
| **2. Prompt Guardrail** | 36 | 24 | **33.3%** | 66.7% | 0.000 ms |
| **3. Argument Regex Only** | 36 | 12 | **66.7%** | 100.0% | 0.000 ms |
| **4. Full INTERPOSE** | 36 | 36 | **0.0%** | **100.0%** | **0.038 ms** |

---

## 4. SENTINEL CYBER-DEFENSE HUD

The Next.js 14 frontend (`frontend/`) is a bespoke Cybersecurity Operations & Threat Simulation Console:

* **Interactive Taint Lineage DAG Canvas:** Real-time visual node flow from untrusted ingestion to policy enforcement, complete with forensic provenance inspection.
* **Exploit Replay & Attack Playground:** Side-by-side comparison showing an unprotected agent (Critical Breach) versus INTERPOSE (Attack Neutralized in &lt;0.04 ms).
* **HITL Authorization Queue:** Interactive drawer managing irreversible tool invocations with cryptographic HMAC-SHA256 token verification.
* **Pareto & Radar Charts:** Recharts visualization demonstrating 0.0% ASR alongside 100% utility retention.
* **Zero-Auth Simulator Mode:** Pre-loaded with canonical AgentDojo scenarios for instant evaluation by recruiters with zero login walls.

---

## 5. QUICKSTART & USAGE

### Prerequisites
* Python 3.11+
* Node.js 18+ & npm
* `uv` (recommended)

### Installation
```bash
# Clone and enter repository
git clone https://github.com/hhamzariadh/interpose.git
cd interpose

# Install Python and Node dependencies
make install
```

### Automated Verification
```bash
# Run unit and integration tests (37 tests)
make test

# Execute the 4-condition security benchmark matrix
make benchmark

# Execute full end-to-end regression suite
make verify
```

### Running Locally
```bash
# Terminal 1: Launch FastAPI reference monitor
make serve

# Terminal 2: Start Next.js 14 Sentinel HUD
make frontend-dev
```
Open `http://localhost:3002` in your browser.

---

## 6. PROJECT DIRECTORY LAYOUT

```
interpose/
├── pyproject.toml              # Python project configuration (uv managed)
├── Makefile                    # Standardized development & testing targets
├── README.md                   # Project overview & architecture guide
├── TECHNICAL_REPORT.md         # Whitepaper, formal proofs & interview guide
├── LICENSE                     # MIT License
├── interpose/
│   ├── core/
│   │   ├── lattice.py          # TaintLevel enum & ProvenanceTag lattice join
│   │   └── taint.py            # TaintedStr subclass & dynamic propagation
│   ├── policy/
│   │   ├── models.py           # SinkDefinition, PolicyVerdict, Decision
│   │   ├── validator.py        # AST argument checks (SQL, Shell, Paths)
│   │   └── engine.py           # Deterministic PolicyEngine (<0.04ms)
│   ├── gateway/
│   │   ├── hitl.py             # Cryptographic HMAC-SHA256 approval gate
│   │   ├── sandbox.py          # Isolated SQLite, bash, and email sandbox
│   │   ├── audit.py            # Immutable JSONL forensic logger
│   │   └── proxy.py            # InterposeGatewayProxy complete mediation
│   ├── redteam/
│   │   ├── adversary.py        # PyRIT mutations (Base64, Delimiters, Homoglyphs)
│   │   ├── scenarios.py        # AgentDojo benchmark scenario loader
│   │   ├── agent.py            # Autonomous agent loop runner
│   │   └── benchmark.py        # 4-condition evaluation harness
│   └── server/
│       └── app.py              # FastAPI endpoints for live GPU & HUD
├── frontend/                   # Next.js 14.2.35 Sentinel Cyber-Defense HUD
│   ├── package.json
│   ├── tsconfig.json
│   ├── components/             # TaintCanvas, AttackPlayground, HITLQueue, Radar
│   └── lib/
│       ├── types.ts
│       ├── mockData.ts         # Pre-loaded zero-auth recruiter dataset
│       └── api.ts
├── tests/                      # 37 unit, integration, and security regression tests
├── data/                       # Scenarios, benchmark results, and audit logs
└── scripts/                    # Benchmark, tunnel, and verification scripts
```

---

## 7. AUTHOR & CONTACT

* **Candidate:** Hamza Riadh Hattab
* **Email:** [hhamzariadh@gmail.com](mailto:hhamzariadh@gmail.com)
* **GitHub:** [github.com/hhamzariadh](https://github.com/hhamzariadh)
* **Target Roles:** Remote AI Security Engineer / LLMOps Security Specialist / Applied ML Safety Engineer
* **Location:** Algiers, Algeria (4-hour daily overlap with Toronto/Montreal EST)
