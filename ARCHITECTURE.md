# Agent-Sentinel Architecture

As per your blueprint – unified, agentic platform merging deep AI repository orchestration with strict supply-chain security analytics.

## High-Level System Topography

```
       [ GitHub Webhook / Developer UI ]
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│               API GATEWAY / ORCHESTRATOR               │
│  (Next.js Route Handlers + Edge Runtime @ Vercel)     │
└──────────┬───────────────────────────┬─────────────────┘
           │                           │
           ▼                           ▼
┌────────────────────┐       ┌───────────────────────────┐
│ AGENTIC ROUTER     │       │ SOCKET.DEV TELEMETRY CORE │
│ • Prompt Injection │       │ • Static Analysis (AST)   │
│ • Context Window   │       │ • Dependency Tree Diff    │
│ • Token Budgets    │       │ • Exploit/Malware Feeds   │
└──────────┬─────────┘       └───────────┬───────────────┘
           │                             │
           └─────────────┬───────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│              DYNAMIC SUB-AGENT SWARM                   │
│  • Agent-Alpha: Bug & Logic Reviewer                   │
│  • Agent-Beta: License & Supply Chain Auditor          │
│  • Agent-Gamma: Automated Auto-Merge Gatekeeper        │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│          API AGNOSTIC AGENT-ROUTER PROXY               │
│  (OpenRouter, Anthropic, Gemini, OLLAMA)               │
└────────────────────────────────────────────────────────┘
```

Implemented 1:1.

## Files built

- `app/api/agent/route/route.ts` – universal LLM router, streaming, X-Agent-Key rotation
- `app/api/agent/coordinate/route.ts` – Edge Coordinator
- `app/api/webhook/github/route.ts` – <10s ack, Octokit status + PR comment
- `lib/agent-router.ts` – agnostic provider proxy
- `lib/socket-telemetry.ts` – typosquat DB, malicious patterns, AST heuristics
- `lib/sub-agents.ts` – Alpha / Beta / Gamma
- `app/dashboard/page.tsx` – Socket.dev obsidian UI, Manual Override Matrix
- `app/page.tsx` – landing

All milestones 1-3 done: Gateway & Core Pipeline (Day 1-3), Sub-Agent Factory & Telemetry (Day 4-6), Webhook Automation & Override Control (Day 7-8).
