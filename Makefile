.PHONY: install test benchmark serve frontend-dev frontend-build tunnel verify help

PYTHON ?= .venv/bin/python
PYTEST ?= .venv/bin/pytest
UVICORN ?= .venv/bin/uvicorn

help:
	@echo "INTERPOSE: Deterministic Security Reference Monitor & Dynamic Taint Tracking"
	@echo ""
	@echo "Usage:"
	@echo "  make install         Install backend (uv) and frontend (npm) dependencies"
	@echo "  make test            Run full automated test suite (37 unit & integration tests)"
	@echo "  make benchmark       Run 4-condition security benchmark sweep (ASR vs Utility)"
	@echo "  make serve           Launch FastAPI reference monitor server (port 8000)"
	@echo "  make frontend-dev    Start Next.js 14 Sentinel HUD development server (port 3002)"
	@echo "  make frontend-build  Compile optimized Next.js 14 production bundle"
	@echo "  make tunnel          Launch Cloudflare Tunnel for live remote GPU inference"
	@echo "  make verify          Execute full end-to-end regression verification suite"

install:
	export PATH="$$HOME/.local/bin:$$HOME/.cargo/bin:$$PATH" && uv pip install -e ".[dev]"
	cd frontend && npm install

test:
	$(PYTEST) tests/ -v

benchmark:
	$(PYTHON) scripts/run_benchmark.py

serve:
	$(UVICORN) interpose.server.app:app --host 0.0.0.0 --port 8000 --reload

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

tunnel:
	bash scripts/run_tunnel.sh

verify:
	bash scripts/verify_all.sh
