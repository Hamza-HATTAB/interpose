#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=========================================================================="
echo " INTERPOSE // FULL END-TO-END VERIFICATION SUITE"
echo "=========================================================================="

export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
cd "${ROOT_DIR}"

echo -e "\n[1/3] Running complete pytest regression suite (37 tests)..."
.venv/bin/pytest tests/ -v --tb=short

echo -e "\n[2/3] Executing 4-condition security benchmark sweep (ASR vs Utility)..."
.venv/bin/python scripts/run_benchmark.py

echo -e "\n[3/3] Validating Next.js 14 production bundle build..."
cd "${ROOT_DIR}/frontend"
npm run build

echo -e "\n=========================================================================="
echo " [✓] 100% VERIFICATION PASSED: ALL SECURITY CONSTRAINTS SATISFIED"
echo "=========================================================================="
