// lib/agent-router.ts
// API-Agnostic Agent-Router Proxy
// Interchangeable: OpenRouter, Anthropic, Gemini, OLLAMA

import type { AgentPayload, AgentProvider } from '@/types/agent';

const PROVIDER_ENDPOINTS: Record<AgentProvider, (model: string) => string> = {
  openrouter: () => 'https://openrouter.ai/api/v1/chat/completions',
  anthropic: () => 'https://api.anthropic.com/v1/messages',
  google: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  local: () => (process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + '/api/chat',
};

export async function routeAgent(payload: AgentPayload) {
  const { provider, apiKey, model, messages, temperature = 0.1, max_tokens = 3000, stream = false } = payload;

  const endpoint = PROVIDER_ENDPOINTS[provider](model);

  // OpenAI-compatible normalization
  if (provider === 'openrouter' || provider === 'local') {
    const headers: Record<string,string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://agent-sentinel.vercel.app';
      headers['X-Title'] = 'Agent-Sentinel';
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider === 'local' ? model || 'llama3.1:8b' : model,
        messages,
        temperature,
        max_tokens,
        stream,
      }),
    });
    if (!res.ok) throw new Error(`${provider} ${res.status}: ${await res.text()}`);
    return stream ? res : res.json();
  }

  // Anthropic native
  if (provider === 'anthropic') {
    const system = messages.find(m => m.role === 'system')?.content;
    const userMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens,
        temperature,
        system,
        messages: userMessages.length ? userMessages : [{ role: 'user', content: system || '' }],
        stream,
      }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
    if (stream) return res;
    const data = await res.json();
    // normalize to OpenAI shape
    return {
      choices: [{ message: { content: data.content?.[0]?.text ?? '' } }],
      usage: data.usage,
      _raw: data,
    };
  }

  // Google Gemini
  if (provider === 'google') {
    const promptText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const url = `${endpoint}?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }]}],
        generationConfig: { temperature, maxOutputTokens: max_tokens }
      }),
    });
    if (!res.ok) throw new Error(`google ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.map((p:any)=>p.text).join('') ?? '';
    return {
      choices: [{ message: { content: text } }],
      _raw: data,
    };
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export function normalizeContent(agentResp: any): string {
  return (
    agentResp?.choices?.[0]?.message?.content ??
    agentResp?.content?.[0]?.text ??
    ''
  );
}

// Token budget / context window guard
export function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export function trimContextWindow(messages: {content:string, role:string}[], maxTokens = 120000) {
  let tokens = messages.reduce((s,m)=>s+estimateTokens(m.content),0);
  const out = [...messages];
  while (tokens > maxTokens && out.length > 2) {
    out.splice(1,1); // drop oldest non-system
    tokens = out.reduce((s,m)=>s+estimateTokens(m.content),0);
  }
  return out;
}
