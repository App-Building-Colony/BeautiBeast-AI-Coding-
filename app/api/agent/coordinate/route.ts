import { NextRequest, NextResponse } from 'next/server';
import { coordinateSwarm } from '@/lib/sub-agents';
import type { PRCoordinationRequest } from '@/types/agent';

export const runtime = 'edge';
// maxDuration 25s on vercel edge – webhook must respond <10s to GitHub

export async function POST(req: NextRequest) {
  try {
    const { prId, repository, fileDiffs, userConfig } = await req.json() as PRCoordinationRequest;

    if (!fileDiffs?.length) {
      return NextResponse.json({ status: 'error', message: 'fileDiffs required' }, { status: 400 });
    }

    // Token budget guard + provider fallback
    const config = {
      provider: userConfig.provider || 'openrouter',
      apiKey: userConfig.apiKey || req.headers.get('x-agent-key') || process.env.OPENROUTER_API_KEY || '',
      model: userConfig.model || 'anthropic/claude-3.5-sonnet',
      messages: [],
      temperature: 0.1
    };

    const swarm = await coordinateSwarm(fileDiffs, config as any);

    const containsCriticalThreat = swarm.subAgents.some(a => a.risk_level === 'CRITICAL_RISK');

    return NextResponse.json({
      status: 'success',
      prId,
      repository,
      autonomousAction: swarm.autoMergeApproved && !containsCriticalThreat ? 'TRIGGER_AUTO_MERGE' : 'BLOCK_AND_FLAG_MANUAL',
      telemetry: swarm.telemetry,
      subAgents: swarm.subAgents,
      socketScores: swarm.socketScores,
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message, stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined }, { status: 500 });
  }
}
