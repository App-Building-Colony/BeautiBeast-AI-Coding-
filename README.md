# Agent-Sentinel • API-Agnostic Supply-Chain Security Swarm

API-Agnostic Proxy Gateway merging deep AI repository orchestration with strict Socket.dev-grade supply-chain security analytics.

> No vendor capping. Dynamic sub-agent spawn. PR gatekeeping in <10s Edge.

```
[ GitHub Webhook ] → API GATEWAY / ORCHESTRATOR (Next.js Edge @ Vercel)
                    → AGENTIC ROUTER → SOCKET.DEV TELEMETRY CORE
                    → DYNAMIC SUB-AGENT SWARM
                      • Alpha: Bug & Logic Reviewer
                      • Beta: License & Supply Chain Auditor  
                      • Gamma: Automated Auto-Merge Gatekeeper
                    → API AGNOSTIC AGENT-ROUTER PROXY
                      OpenRouter • Anthropic • Gemini • OLLAMA
```

---

## Beauty & the Beast Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 App Router, React Server Components |
| Styling | Tailwind CSS + Shadcn UI – obsidian, hazard orange, crimson alerts |
| Deployment | Vercel Edge Functions – zero-cold-start <10s |
| Streaming | Vercel AI SDK `streamText` |
| Repo Sync | GitHub Octokit API – PR comments, status checks |

---

## Endpoints

- `POST /api/agent/route` – Universal LLM router
  ```ts
  {
    provider: 'openrouter' | 'anthropic' | 'google' | 'local',
    apiKey: string,
    model: string,
    messages: [...]
  }
  ```
  Header rotation: `X-Agent-Key`

- `POST /api/agent/coordinate` – Swarm Coordinator
  Spawns Alpha/Beta concurrently, returns:
  ```json
  { "autonomousAction": "TRIGGER_AUTO_MERGE" | "BLOCK_AND_FLAG_MANUAL" }
  ```

- `POST /api/webhook/github` – GitHub PR webhook
  `pull_request.opened / synchronize` → pending → swarm → commit status

- `POST /api/override` – Manual Override Matrix, JWT signed 15m

---

## Sub-Agent Factory

Coordinator reads file diff metrics:
- `package.json` changed → **Dependency Isolation Sub-Agent (Alpha)**
  - typosquatting, install script injection, compromised packages
- core logic changed → **AST Code-Review Sub-Agent (Beta)**
  - memory leaks, unhandled async, eval/RCE, secret leaks

**Gamma Gatekeeper**: Auto-merge if both pass, else BLOCK.

Status checks: `pending` → GitHub blocks merge until green OR Manual Override Bypass in dashboard.

---

## Local Dev

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000/dashboard

Run a test swarm:
```bash
curl -X POST http://localhost:3000/api/agent/coordinate \
  -H "Content-Type: application/json" \
  -H "x-agent-key: $OPENROUTER_API_KEY" \
  -d '{
    "prId": 1,
    "repository":"test/repo",
    "fileDiffs":[{"path":"package.json","additions":2,"deletions":0,"patch":"+ \"reactt\": \"1.0.0\"","status":"modified"}],
    "userConfig":{"provider":"openrouter","model":"anthropic/claude-3.5-sonnet","messages":[]}
  }'
```

---

## Vercel Deploy

1. `vercel --prod`
2. Env: `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `GITHUB_TOKEN`, `GITHUB_WEBHOOK_SECRET`
3. GitHub Repo → Settings → Webhooks:
   - Payload URL: `https://your-app.vercel.app/api/webhook/github`
   - Content type: `application/json`
   - Secret: same as `GITHUB_WEBHOOK_SECRET`
   - Events: Pull requests
4. Branch protection: Require status check `agent-sentinel/swarm`

Security posture:
- Strict Status Check Mandate
- Dynamic encrypted API token header (`X-Agent-Key` + `X-GitHub-Signature-256`)
- JWT signed Manual Override (15m expiry)

---

MIT – built for the agentic supply-chain era.
