"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SocketScore } from "@/components/socket-score";
import type { SubAgentResult, SocketTelemetry, AgentProvider } from "@/types/agent";

const defaultScores: SocketTelemetry = {
  supplyChain: 91,
  security: 86,
  quality: 84,
  maintenance: 79,
  vulnerability: 14,
  license: 88
};

export default function Dashboard() {
  const [scores, setScores] = useState(defaultScores);
  const [provider, setProvider] = useState<AgentProvider>('openrouter');
  const [apiKey, setApiKey] = useState('');
  const [diffInput, setDiffInput] = useState(`diff --git a/package.json b/package.json
+    "reactt": "18.3.1",
+    "axioss": "^1.7.0"
diff --git a/src/auth.ts b/src/auth.ts
+ eval(userInput)
+ const exec = require('child_process').execSync`);
  const [running, setRunning] = useState(false);
  const [agents, setAgents] = useState<SubAgentResult[]>([]);
  const [action, setAction] = useState('IDLE');

  const runSwarm = async () => {
    setRunning(true);
    setAction('SPAWNING…');
    // simple client parse
    const chunks = diffInput.split('diff --git').filter(Boolean).map(c=>{
      const firstLine = c.split('\n')[0];
      const path = firstLine.split(' b/')[1]?.trim() || 'unknown';
      return { path, additions: (c.match(/^\+/gm)||[]).length, deletions: (c.match(/^\-/gm)||[]).length, patch: c.slice(0,7000), status:'modified' as const };
    });
    try {
      const res = await fetch('/api/agent/coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-agent-key': apiKey },
        body: JSON.stringify({
          prId: 482,
          repository: 'acme/agent-sentinel',
          fileDiffs: chunks,
          userConfig: {
            provider,
            apiKey,
            model: provider==='openrouter' ? 'anthropic/claude-3.5-sonnet' : provider==='anthropic' ? 'claude-3-5-sonnet-20241022' : provider==='google' ? 'gemini-1.5-pro' : 'llama3.1:8b',
            messages: []
          }
        })
      });
      const data = await res.json();
      setAgents(data.subAgents || []);
      setScores(data.socketScores || defaultScores);
      setAction(data.autonomousAction || 'ERROR');
    } catch(e:any){
      setAction('ERROR: '+e.message);
    } finally { setRunning(false); }
  };

  const override = (approve: boolean) => {
    setAction(approve ? 'MANUAL_OVERRIDE_APPROVED' : 'MANUAL_OVERRIDE_BLOCKED');
  };

  const totalRisk = Math.round((scores.security + scores.supplyChain)/2);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-obsidian-800/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1280px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="mono text-neon-green text-[13px]">agent-sentinel / dashboard</span>
            <span className="text-[10px] mono px-2 py-1 rounded bg-hazard-orange/10 text-hazard-orange border border-hazard-orange/20">SWARM LIVE</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] mono">
            <select value={provider} onChange={e=>setProvider(e.target.value as any)} className="bg-obsidian-700 border border-border rounded px-2 py-1">
              <option value="openrouter">openrouter</option>
              <option value="anthropic">anthropic</option>
              <option value="google">google</option>
              <option value="local">local / ollama</option>
            </select>
            <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="x-agent-key…" className="bg-black/40 border border-border rounded px-3 py-1 w-56 text-[11px]" />
            <a href="/" className="text-muted hover:text-zinc-200">← home</a>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-12 gap-5">
        {/* left metrics */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-12 gap-5">
          <Card className="col-span-12 md:col-span-4">
            <CardHeader><CardTitle>Supply Chain</CardTitle></CardHeader>
            <CardContent>
              <div className="text-4xl font-[700] mono neon-text">{scores.supplyChain}</div>
              <div className="text-[11px] text-muted mt-1">Socket.dev SCS</div>
            </CardContent>
          </Card>
          <Card className="col-span-12 md:col-span-4">
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-4xl font-[700] mono ${scores.security < 60 ? 'text-hazard-crimson hazard-text' : 'neon-text'}`}>{scores.security}</div>
              <div className="text-[11px] text-muted mt-1">Exploit / Malware</div>
            </CardContent>
          </Card>
          <Card className="col-span-12 md:col-span-4">
            <CardHeader><CardTitle>Vulnerability</CardTitle></CardHeader>
            <CardContent>
              <div className="text-4xl font-[700] mono text-hazard-orange hazard-text">{scores.vulnerability}</div>
              <div className="text-[11px] text-muted mt-1">Lower = better</div>
            </CardContent>
          </Card>

          <Card className="col-span-12">
            <CardHeader><CardTitle>Socket.dev Telemetry – Multi-Layer Risk</CardTitle></CardHeader>
            <CardContent>
              <SocketScore scores={scores} />
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-2 text-[11px] mono">
                {Object.entries(scores).map(([k,v])=>(
                  <div key={k} className="bg-black/30 rounded px-3 py-2 border border-border/60">
                    <div className="text-muted">{k}</div>
                    <div className="text-[15px]">{v}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-12">
            <CardHeader>
              <CardTitle>Sub-Agent Swarm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(agents.length ? agents : [
                  {agent:'alpha', name:'Agent-Alpha • Supply Chain Auditor', risk_level:'LOW', score:91, elapsed_ms:184, summary:'Idle – paste diff → run swarm', findings:[], passed:true},
                  {agent:'beta', name:'Agent-Beta • Logic Reviewer', risk_level:'LOW', score:86, elapsed_ms:212, summary:'Idle', findings:[], passed:true},
                  {agent:'gamma', name:'Agent-Gamma • Auto-Merge Gatekeeper', risk_level:'LOW', score:88, elapsed_ms:8, summary:'Waiting for Alpha + Beta', findings:[], passed:true},
                ] as any).map((a:any)=>(
                  <div key={a.agent} className="border border-border rounded-lg px-4 py-3 bg-obsidian-800/50 flex items-center justify-between">
                    <div>
                      <div className="text-[12px] mono">{a.name}</div>
                      <div className="text-[11px] text-muted mt-0.5 truncate max-w-[720px]">{a.summary}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[11px] mono px-2 py-1 rounded ${a.risk_level==='CRITICAL_RISK' ? 'bg-hazard-crimson/15 text-hazard-crimson' : a.risk_level==='HIGH' ? 'bg-hazard-orange/15 text-hazard-orange' : 'bg-neon-green/10 text-neon-green'}`}>{a.risk_level}</div>
                      <div className="text-[10px] text-muted mt-1">{a.score}/100 • {a.elapsed_ms}ms</div>
                    </div>
                  </div>
                ))}
              </div>

              {agents.some((a:any)=>a.findings?.length) && (
                <div className="mt-5 border border-hazard-crimson/30 rounded-lg bg-hazard-crimson/5 p-4">
                  <div className="text-[11px] mono text-hazard-crimson mb-2">CRITICAL FINDINGS</div>
                  <ul className="text-[12px] space-y-1.5 text-zinc-300">
                    {agents.flatMap(a=>a.findings||[]).map((f:any,i:number)=>(
                      <li key={i}>• <span className="text-hazard-orange">[{f.severity}]</span> {f.file} – {f.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* right column */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <Card>
            <CardHeader><CardTitle>Manual Intervention Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-[13px] mono mb-3 px-3 py-2 rounded border ${action.includes('APPROVED')||action.includes('MERGE') ? 'border-neon-green/30 bg-neon-green/5 text-neon-green' : action.includes('BLOCK') ? 'border-hazard-crimson/40 bg-hazard-crimson/5 text-hazard-crimson' : 'border-border text-muted'}`}>{action}</div>
              <div className="flex gap-2">
                <button onClick={()=>override(true)} className="flex-1 py-2 rounded bg-neon-green text-black text-[12px] font-[650]">Force Validate ✓</button>
                <button onClick={()=>override(false)} className="flex-1 py-2 rounded bg-hazard-crimson text-white text-[12px] font-[650]">Invalidate ✕</button>
              </div>
              <div className="text-[10px] text-muted mono mt-2">JWT signed • temporary bypass</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>PR Diff Input</CardTitle></CardHeader>
            <CardContent>
              <textarea value={diffInput} onChange={e=>setDiffInput(e.target.value)} className="w-full h-56 bg-black/50 border border-border rounded p-3 text-[11px] mono text-zinc-300" />
              <button disabled={running} onClick={runSwarm} className="mt-3 w-full py-2.5 rounded-lg bg-zinc-100 text-black font-[650] text-[13px] disabled:opacity-60">
                {running ? 'Coordinating swarm…' : 'Run Coordinator → /api/agent/coordinate'}
              </button>
              <div className="text-[10px] mono text-muted mt-2">Total Risk: {totalRisk}/100 • provider: {provider}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Webhook Config</CardTitle></CardHeader>
            <CardContent className="text-[11px] mono space-y-2 text-zinc-400">
              <div>POST <span className="text-neon-cyan">/api/webhook/github</span></div>
              <div>X-GitHub-Event: pull_request</div>
              <div>Timeout: &lt;10s ack Edge</div>
              <div>Status: <span className="text-neon-green">agent-sentinel/swarm</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
