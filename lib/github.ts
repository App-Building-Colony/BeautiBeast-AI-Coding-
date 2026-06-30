// lib/github.ts
import { Octokit } from '@octokit/rest';
import type { SubAgentResult, SocketTelemetry } from '@/types/agent';

export function getOctokit(installationToken?: string) {
  const token = installationToken || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  return new Octokit({ auth: token });
}

export async function postPRStatus({
  owner, repo, sha, state, description, context='agent-sentinel/swarm',
}: { owner:string; repo:string; sha:string; state:'pending'|'success'|'failure'|'error'; description:string; context?:string }) {
  try {
    const octokit = getOctokit();
    if (!process.env.GITHUB_TOKEN) return { skipped: true };
    await octokit.rest.repos.createCommitStatus({
      owner, repo, sha, state, description: description.slice(0,139), context,
    });
    return { ok: true };
  } catch(e:any){ return { ok:false, error:e.message }; }
}

export async function commentPR({ owner, repo, issue_number, body }: { owner:string; repo:string; issue_number:number; body:string }) {
  try {
    const octokit = getOctokit();
    if (!process.env.GITHUB_TOKEN) return { skipped:true };
    await octokit.rest.issues.createComment({ owner, repo, issue_number, body });
    return { ok:true };
  } catch(e:any){ return { ok:false, error:e.message }; }
}

export function buildPRComment(subAgents: SubAgentResult[], scores: SocketTelemetry, approved: boolean) {
  const badge = approved ? '✅ AUTO_MERGE_APPROVED' : '🛑 BLOCK_AND_FLAG_MANUAL';
  const r = (n:number)=>`${n}/100`;
  return `### Agent-Sentinel Swarm Report
**${badge}**

| Risk Vector | Score |
|---|---|
| Supply Chain | ${r(scores.supplyChain)} |
| Security | ${r(scores.security)} |
| Quality | ${r(scores.quality)} |
| Maintenance | ${r(scores.maintenance)} |

${subAgents.map(a=>`
<details><summary><b>${a.name}</b> — ${a.risk_level} • ${a.score}/100 • ${a.elapsed_ms}ms</summary>

${a.summary}

${a.findings.map(f=>`- **${f.severity.toUpperCase()}** \`${f.file}\` ${f.rule}: ${f.message}`).join('\n') || '_No findings_'}
</details>`).join('\n')}

---
<sub>Agent-Sentinel • agnostic router • ${new Date().toISOString()}</sub>
`;
}
