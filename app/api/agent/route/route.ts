import { NextRequest } from 'next/server';
import { routeAgent } from '@/lib/agent-router';
import type { AgentPayload } from '@/types/agent';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AgentPayload & { stream?: boolean };
    
    // Dynamic user/workspace level key rotation
    // X-Agent-Key header overrides body
    const headerKey = req.headers.get('x-agent-key');
    if (headerKey) body.apiKey = headerKey;

    const apiKey = body.apiKey || process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'No API key provided. Set x-agent-key or body.apiKey' }), { status: 401 });
    }

    const payload: AgentPayload = {
      provider: body.provider || 'openrouter',
      apiKey,
      model: body.model || (
        body.provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' :
        body.provider === 'google' ? 'gemini-1.5-pro' :
        body.provider === 'local' ? 'llama3.1:8b' :
        'anthropic/claude-3.5-sonnet'
      ),
      messages: body.messages,
      temperature: body.temperature ?? 0.2,
      stream: body.stream,
    };

    const result = await routeAgent(payload);

    if (body.stream && result instanceof Response) {
      return new Response(result.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    return Response.json(result);
  } catch (e:any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    name: "Agent-Sentinel Agnostic Router",
    providers: ["openrouter","anthropic","google","local"],
    models: {
      openrouter: "anthropic/claude-3.5-sonnet, openai/gpt-4o, meta-llama/llama-3.1-405b",
      anthropic: "claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022",
      google: "gemini-1.5-pro, gemini-1.5-flash",
      local: "ollama – any local model"
    },
    stream: true,
    endpoint: "/api/agent/route"
  });
}
