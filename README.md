# 🧠 EKO — The Autonomous Digital Organism

**EKO** (Eternal Knowledge Organism) is an AI daemon that:

- **Remembers everything** — Eternal SQLite memory. Never forgets.
- **Thinks in graphs** — Parallel execution, not linear loops.
- **Heals itself** — Rewrites broken code on the fly.
- **Supports ANY model** — OpenAI, Claude, Ollama, Groq, LM Studio.
- **Earns its keep** — Crypto wallet, trading, pays for its own compute.
- **Controls the physical world** — 3D printers, drones, DePIN (coming soon).

## ⚡ Quick Start

```bash
git clone https://github.com/abdulmumeen-dev/eko-omni.git
cd eko-omni
npm install
cp .env.example .env
# Add your API key to .env
npm start

🧩 Architecture
brain/ — Orchestrator & eternal memory

limbs/ — Action modules (trading, coding, research)

immune/ — Self-healing & health (Phase 2)

conscience/ — Safety & validation (Phase 3)

🔧 Environment Variables
Variable	Description
LLM_PROVIDER	openai, anthropic, ollama, or generic
LLM_BASE_URL	API endpoint
LLM_API_KEY	Your API key
LLM_MODEL	Model name
📜 License
MIT — Free for personal, commercial, and research use.

---

### File 4: `.env.example`

**Path:** `.env.example`

```env
# ---------- Provider Selection ----------
# Options: openai | anthropic | ollama | generic
LLM_PROVIDER=openai

# ---------- Endpoint & Keys ----------
# OpenAI: https://api.openai.com/v1
# Groq: https://api.groq.com/openai/v1
# Together: https://api.together.xyz/v1
# LM Studio: http://localhost:1234/v1
# Ollama: http://localhost:11434
LLM_BASE_URL=https://api.openai.com/v1

# API Key (not needed for Ollama)
LLM_API_KEY=sk-...

# ---------- Model Name ----------
# OpenAI: gpt-4o, gpt-4o-mini, gpt-3.5-turbo
# Anthropic: claude-3-5-sonnet-20241022, claude-3-haiku
# Ollama: llama3, mistral, phi, mixtral
# Groq: llama3-70b-8192, mixtral-8x7b-32768
# LM Studio: local-model
LLM_MODEL=gpt-4o-mini
