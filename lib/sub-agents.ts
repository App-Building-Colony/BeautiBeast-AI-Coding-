// lib/sub-agents.ts
// Dynamic Sub-Agent Swarm

import { routeAgent, normalizeContent, trimContextWindow } from './agent-router';
import { analyzeDependencyDiff, analyzeCodeAST, computeSocketScores, riskLevelFromScore } from './socket-telemetry';
import type { AgentPayload, DiffFile, SubAgentResult } from '@/types/agent';

export async function runAgentAlpha(depDiffs: DiffFile[], baseConfig: AgentPayload): Promise<SubAgentResult> {
  const start = Date.now();
  const staticRes = analyzeDependencyDiff(depDiffs);

  const prompt = `You are Agent-Alpha: License & Supply Chain Auditor.
Analyze dependency shifts for typosquatting, malicious install scripts, compromised packages, license conflicts.

TELEMETRY:
${JSON.stringify(staticRes, null, 2)}

DIFFS:
${depDiffs.map(d=>`### ${d.path}\n${d.patch.slice(0,3500)}`).join('\n\n')}

Return concise JSON:
{"risk":"LOW|MEDIUM|HIGH|CRITICAL_RISK","summary":"...","findings":["..."]}
If CRITICAL, include the literal token CRITICAL_RISK.`;

  let llmSummary = staticRes.findings.map(f=>f.message).join('; ') || 'No heuristic flags.';
  let risk = riskLevelFromScore(staticRes.score);

  try {
    const resp = await routeAgent({
      ...baseConfig,
      temperature: 0.1,
      messages: trimContextWindow([
        { role: 'system', content: 'You are a strict supply-chain security auditor. Be terse. Emit JSON.' },
        { role: 'user', content: prompt }
      ])
    });
    const content = normalizeContent(resp);
    llmSummary = content.slice(0,600);
    if (/CRITICAL_RISK|critical/i.test(content)) risk = 'CRITICAL_RISK';
  } catch (e:any) {
    llmSummary += ` | LLM fallback: ${e.message}`;
  }

  return {
    agent: 'alpha',
    name: 'Agent-Alpha • Supply Chain Auditor',
    passed: risk !== 'CRITICAL_RISK' && risk !== 'HIGH',
    risk_level: risk,
    score: staticRes.score,
    findings: staticRes.findings,
    summary: llmSummary,
    elapsed_ms: Date.now() - start,
  };
}

export async function runAgentBeta(codeDiffs: DiffFile[], baseConfig: AgentPayload): Promise<SubAgentResult> {
  const start = Date.now();
  const staticRes = analyzeCodeAST(codeDiffs);

  const prompt = `You are Agent-Beta: Bug & Logic Reviewer.
Perform structural syntax check: memory leaks, unhandled async, edge cases, eval injection, secret leaks.

STATIC_FINDINGS: ${JSON.stringify(staticRes.findings)}
CODE:
${codeDiffs.map(d=>`// ${d.path}\n${d.patch.slice(0,4000)}`).join('\n\n---\n\n')}

Return JSON {"risk":"...","issues":[...],"summary":"..."}. Use CRITICAL_RISK token if exploitable.`;

  let llmSummary = staticRes.findings.map(f=>f.message).join('; ') || 'Structure clean.';
  let risk = riskLevelFromScore(staticRes.score);

  try {
    const resp = await routeAgent({
      ...baseConfig,
      temperature: 0.15,
      messages: trimContextWindow([
        { role: 'system', content: 'Elite code auditor. Output JSON only.'},
        { role: 'user', content: prompt }
      ])
    });
    const content = normalizeContent(resp);
    llmSummary = content.slice(0,700);
    if (/CRITICAL_RISK|RCE|injection/i.test(content)) {
      risk = content.toLowerCase().includes('critical') ? 'CRITICAL_RISK' : risk;
    }
  } catch(e:any) {
    llmSummary += ` | LLM fallback: ${e.message}`;
  }

  return {
    agent: 'beta',
    name: 'Agent-Beta • Logic Reviewer',
    passed: risk !== 'CRITICAL_RISK',
    risk_level: risk,
    score: staticRes.score,
    findings: staticRes.findings,
    summary: llmSummary,
    elapsed_ms: Date.now() - start,
  };
}

export async function runAgentGamma(
  alpha: SubAgentResult,
  beta: SubAgentResult,
  socketScores: ReturnType<typeof computeSocketScores>
): Promise<SubAgentResult> {
  const start = Date.now();
  const block = alpha.risk_level === 'CRITICAL_RISK' || beta.risk_level === 'CRITICAL_RISK';
  const passed = !block && alpha.score > 55 && beta.score > 50 && socketScores.security > 45;
  const risk = block ? 'CRITICAL_RISK' : passed ? 'LOW' : 'MEDIUM';

  return {
    agent: 'gamma',
    name: 'Agent-Gamma • Auto-Merge Gatekeeper',
    passed,
    risk_level: risk,
    score: Math.round((alpha.score + beta.score + socketScores.security) / 3),
    findings: [],
    summary: passed
      ? 'AUTO_MERGE_APPROVED – All sub-agents green. PR gate passing.'
      : block
      ? 'BLOCK_AND_FLAG_MANUAL – Critical threat detected. Manual Override required.'
      : 'NEEDS_REVIEW – Non-critical warnings present.',
    elapsed_ms: Date.now() - start,
  };
}

// Coordinator
export async function coordinateSwarm(diffFiles: DiffFile[], userConfig: AgentPayload) {
  const depFiles = diffFiles.filter(f => f.path.includes('package') || f.path.includes('pnpm') || f.path.includes('yarn') || f.path.includes('lock'));
  const codeFiles = diffFiles.filter(f => !depFiles.includes(f));

  const tasks: Promise<SubAgentResult>[] = [];
  tasks.push(depFiles.length ? runAgentAlpha(depFiles, userConfig) : Promise.resolve({
    agent: 'alpha' as const,
    name: 'Agent-Alpha • Supply Chain Auditor',
    passed: true,
    risk_level: 'LOW' as const,
    score: 94,
    findings: [],
    summary: 'No dependency changes detected.',
    elapsed_ms: 4
  }));
  tasks.push(codeFiles.length ? runAgentBeta(codeFiles, userConfig) : Promise.resolve({
    agent: 'beta' as const,
    name: 'Agent-Beta • Logic Reviewer',
    passed: true,
    risk_level: 'LOW' as const,
    score: 92,
    findings: [],
    summary: 'No code changes.',
    elapsed_ms: 2
  }));

  const [alpha, beta] = await Promise.all(tasks);
  const socketScores = computeSocketScores(alpha.score, beta.score, alpha.findings.length + beta.findings.length);
  const gamma = await runAgentGamma(alpha, beta, socketScores);

  const autoMergeApproved = gamma.passed;

  return {
    subAgents: [alpha, beta, gamma],
    socketScores,
    autoMergeApproved,
    telemetry: {
      securityAnalysis: beta,
      codeQualityAnalysis: beta,
      supplyChainAnalysis: alpha,
    }
  };
}
