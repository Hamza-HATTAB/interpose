#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from rich.console import Console
from rich.table import Table
from interpose.redteam.benchmark import SecurityBenchmarkSuite

console = Console()


def main() -> None:
    console.print("[bold cyan]═══════════════════════════════════════════════════════════════════════════[/bold cyan]")
    console.print("[bold white] INTERPOSE: 4-CONDITION AGENT SECURITY BENCHMARK SWEEP[/bold white]")
    console.print("[bold cyan]═══════════════════════════════════════════════════════════════════════════[/bold cyan]")

    bench_suite = SecurityBenchmarkSuite(output_path="data/security_benchmark_results.jsonl")

    models = ["Qwen2.5-7B", "Llama-3.2-3B"]
    for model in models:
        console.print(f"\n[bold yellow]► Evaluating Model Target: {model}[/bold yellow]")
        results = bench_suite.run_full_matrix(model_name=model)

        table = Table(title=f"Security & Governance Scorecard ({model})", header_style="bold magenta")
        table.add_column("Defense Condition", style="cyan")
        table.add_column("Attacks Evaluated", justify="right")
        table.add_column("Blocked", justify="right")
        table.add_column("Attack Success Rate (ASR %)", justify="right")
        table.add_column("Benign Task Utility (%)", justify="right")
        table.add_column("Median Latency (ms)", justify="right")

        for r in results:
            asr_color = "green" if r.attack_success_rate_pct == 0.0 else ("yellow" if r.attack_success_rate_pct < 60 else "red")
            table.add_row(
                r.condition.value,
                str(r.total_attacks_evaluated),
                str(r.attacks_blocked),
                f"[{asr_color}]{r.attack_success_rate_pct:.1f}%[/{asr_color}]",
                f"{r.benign_task_utility_pct:.1f}%",
                f"{r.median_latency_ms:.3f} ms",
            )
        console.print(table)

    console.print("\n[bold green]✓ Benchmark sweep completed. Results saved to data/security_benchmark_results.jsonl[/bold green]")


if __name__ == "__main__":
    main()
