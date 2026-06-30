import { NextRequest, NextResponse } from 'next/server';
import { coordinateSwarm } from '@/lib/sub-agents';
import { postPRStatus, commentPR, buildPRComment } from '@/lib/github';
import type { DiffFile } from '@/types/agent';

export const runtime = 'nodejs'; // need octokit full
export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

async function verifyHmac(req: NextRequest, raw: string) {
  if (!WEBHOOK_SECRET) return true;
  const sig = req.headers.get('x-hub-signature-256') || '';
  const crypto = await import('node:crypto');
  const h = 'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig));
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const okSig = await verifyHmac(req, raw);
  if (!okSig) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });

  const event = req.headers.get('x-github-event');
  const payload = JSON.parse(raw);

  if (event !== 'pull_request') {
    return NextResponse.json({ received: true, ignored: event });
  }

  const action = payload.action;
  if (!['opened','synchronize','reopened'].includes(action)) {
    return NextResponse.json({ received: true, ignored: action });
  }

  const pr = payload.pull_request;
  const repoFull = payload.repository.full_name;
  const [owner, repo] = repoFull.split('/');
  const sha = pr.head.sha;
  const prNumber = pr.number;

  // Instant pending – must respond <10s to GitHub
  postPRStatus({ owner, repo, sha, state: 'pending', description: 'Agent-Sentinel swarm launching…' }).catch(()=>{});

  // Fire-and-forget swarm, but for MVP run inline (Vercel max 60s)
  // In production: push to queue
  try {
    // fetch diff via GitHub Compare API
    const diffFiles: DiffFile[] = [];
    if (process.env.GITHUB_TOKEN && pr.diff_url) {
      try {
        const r = await fetch(pr.diff_url, { headers: { 'User-Agent': 'agent-sentinel', Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }});
        const diffText = await r.text();
        // very light parse
        const files = diffText.split('diff --git ');
        for (const chunk of files.slice(1, 12)) { // cap to 12 files for webhook latency
          const lines = chunk.split('\n');
          const pathLine = lines[0] || '';
          const pathMatch = pathLine.match(/b\/(.+)/);
          const path = pathMatch ? pathMatch[1] : 'unknown';
          diffFiles.push({
            path,
            additions: (chunk.match(/^\+[^+]/gm)||[]).length,
            deletions: (chunk.match(/^\-[^-]/gm)||[]).length,
            patch: chunk.slice(0, 8000),
            status: 'modified'
          });
        }
      } catch {}
    }

    // fallback mock if diff fetch failed
    if (diffFiles.length === 0 && payload.pull_request.changed_files) {
      // leave empty – swarm handles 0 gracefully
    }

    const userConfig = {
      provider: (process.env.AGENT_DEFAULT_PROVIDER as any) || 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY || 'sk-mock',
      model: process.env.AGENT_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
      messages: [],
      temperature: 0.1
    };

    const swarm = await coordinateSwarm(diffFiles.length ? diffFiles : [
      { path: 'src/index.ts', additions: 12, deletions: 3, patch: pr.body?.slice(0,4000) || '+ // PR opened', status: 'modified' }
    ], userConfig as any);

    const approved = swarm.autoMergeApproved;
    await postPRStatus({
      owner, repo, sha,
      state: approved ? 'success' : 'failure',
      description: approved ? 'Swarm: AUTO_MERGE_APPROVED' : 'Swarm: BLOCK_AND_FLAG_MANUAL',
    });

    const body = buildPRComment(swarm.subAgents, swarm.socketScores, approved);
    await commentPR({ owner, repo, issue_number: prNumber, body });

    // Auto merge
    if (approved && process.env.AUTO_MERGE_ENABLED === 'true') {
      try {
        const { getOctokit } = await import('@/lib/github');
        const octokit = getOctokit();
        await octokit.rest.pulls.merge({ owner, repo, pull_number: prNumber, merge_method: 'squash' });
      } catch {}
    }

    return NextResponse.json({ ok: true, approved, scores: swarm.socketScores });
  } catch (e:any) {
    await postPRStatus({ owner, repo, sha, state: 'error', description: 'Swarm error: '+e.message.slice(0,80) });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhook/github',
    expects: 'X-GitHub-Event: pull_request',
    secret: !!WEBHOOK_SECRET,
    timeoutTarget: '<10s initial ack',
  });
}
