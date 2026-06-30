"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [provider, setProvider] = useState("openrouter");
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,255,148,0.07),transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(255,106,0,0.07),transparent_50%)] pointer-events-none" />
      <header className="border-b border-border/80 bg-obsidian-800/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-neon-green/10 border border-neon-green/30 flex items-center justify-center shadow-neon">
              <span className="mono text-neon-green text-[11px] font-bold">AS</span>
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight">Agent-Sentinel</div>
              <div className="text-[10px] text-muted mono -mt-0.5">API-AGNOSTIC • v1.0.0-edge</div>
            </div>
          </div>
          <nav className="flex items-center gap-5 text-[12px] mono text-muted">
            <Link href="/dashboard" className="hover:text-neon-green">/dashboard</Link>
            <Link href="/api/agent/route" className="hover:text-neon-green">/api/agent/route</Link>
            <span className="text-neon-green">● LIVE</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-[1.25fr_.9fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] mono px-3 py-1.5 rounded-full bg-hazard-orange/10 border border-hazard-orange/30 text-hazard-orange mb-5">
              SOCKET.DEV TELEMETRY CORE • SWARM v3
            </div>
            <h1 className="text-4xl md:text-[52px] leading-[1.05] font-[680] tracking-tight">
              Agentic supply-chain<br/>
              security that <span className="neon-text text-neon-green">auto-merges</span><br/>
              or kills PRs.
            </h1>
            <p className="text-zinc-400 mt-5 max-w-xl text-[15px] leading-relaxed">
              API-agnostic proxy gateway. No vendor capping. Dynamic sub-agent spawn: 
              Alpha (Supply Chain), Beta (Logic Review), Gamma (Auto-Merge Gatekeeper).
              Socket.dev-grade telemetry in obsidian.
            </p>
            <div className="flex gap-3 mt-7">
              <Link href="/dashboard" className="px-5 py-2.5 rounded-lg bg-neon-green text-black text-[13px] font-[650] shadow-neon hover:brightness-110 transition">Open Override Matrix →</Link>
              <a href="https://github.com" className="px-5 py-2.5 rounded-lg border border-border text-[13px] mono hover:border-muted transition">/api/webhook/github</a>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12 max-w-xl">
              {[
                {k:"92", l:"Supply Chain"},
                {k:"0ms", l:"Edge cold-start"},
                {k:"4", l:"Providers"},
              ].map(s=>(
                <div key={s.l} className="card-obsidian px-4 py-3">
                  <div className="text-2xl font-[700] mono hazard-text">{s.k}</div>
                  <div className="text-[10px] text-muted mono uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-obsidian p-5 shadow-hazard">
            <div className="text-[11px] mono text-muted uppercase tracking-widest mb-3">Agnostic Provider Proxy</div>
            <div className="bg-black/50 rounded-lg border border-border p-4 mono text-[12px] leading-relaxed text-zinc-300">
              <div className="text-muted">// app/api/agent/route</div>
              <div><span className="text-neon-cyan">provider</span>: <select value={provider} onChange={e=>setProvider(e.target.value)} className="bg-obsidian-600 border border-border rounded px-2 py-1 text-neon-green">
                <option>openrouter</option>
                <option>anthropic</option>
                <option>google</option>
                <option>local</option>
              </select></div>
              <div className="mt-2 text-zinc-400">
                model: <span className="text-hazard-amber">"{provider==='openrouter'?'anthropic/claude-3.5-sonnet':provider==='anthropic'?'claude-3-5-sonnet-20241022':provider==='google'?'gemini-1.5-pro':'llama3.1:8b'}"</span><br/>
                temperature: <span className="text-neon-green">0.1</span><br/>
                stream: <span className="text-neon-green">true</span>
              </div>
              <div className="mt-3 text-[10px] text-muted">Authorization: Bearer $&#123;DYNAMIC_KEY_ROTATION&#125;</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] mono">
              <div className="bg-obsidian-800 rounded-md p-3 border border-border">
                <div className="text-muted">Alpha</div>
                <div className="text-hazard-orange">Supply Chain</div>
              </div>
              <div className="bg-obsidian-800 rounded-md p-3 border border-border">
                <div className="text-muted">Beta</div>
                <div className="text-neon-cyan">Logic Review</div>
              </div>
              <div className="bg-obsidian-800 rounded-md p-3 border border-border col-span-2">
                <div className="text-muted">Gamma</div>
                <div className="text-neon-green">Auto-Merge Gatekeeper</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-5">
          {[
            {t:"Gateway & Core Pipeline", d:"Next.js 15 Edge, /api/agent/route streaming OpenRouter→Anthropic→Gemini→Ollama."},
            {t:"Sub-Agent Factory", d:"Coordinator reads diff metrics, spawns Alpha/Beta dynamically, zero hard limits."},
            {t:"Manual Override Matrix", d:"Secure JWT-signed dashboard. Force validate/invalidate any agentic block."},
          ].map(b=>(
            <div key={b.t} className="card-obsidian p-5">
              <div className="text-[12px] mono text-neon-green mb-2">{b.t}</div>
              <div className="text-[13px] text-zinc-400">{b.d}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/80 py-8 text-center text-[11px] mono text-muted">
        Agent-Sentinel • Edge Runtime • github webhook &lt; 10s • api-agnostic
      </footer>
    </div>
  );
}
