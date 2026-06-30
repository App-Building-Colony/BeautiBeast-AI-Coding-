export const runtime = 'edge';
export async function GET() {
  return Response.json({
    ok: true,
    service: 'agent-sentinel',
    version: '1.0.0-edge',
    providers: ['openrouter','anthropic','google','local'],
    endpoints: [
      '/api/agent/route',
      '/api/agent/coordinate',
      '/api/webhook/github',
      '/api/override'
    ],
    ts: new Date().toISOString()
  });
}
