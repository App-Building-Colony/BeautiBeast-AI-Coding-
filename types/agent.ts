export type AgentProvider = 'openrouter' | 'anthropic' | 'google' | 'local';

export interface AgentPayload {
  provider: AgentProvider;
  apiKey: string;
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface SubAgentResult {
  agent: 'alpha' | 'beta' | 'gamma';
  name: string;
  passed: boolean;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_RISK';
  score: number; // 0-100
  findings: Finding[];
  summary: string;
  elapsed_ms: number;
}

export interface Finding {
  severity: 'info' | 'warn' | 'high' | 'critical';
  file: string;
  line?: number;
  rule: string;
  message: string;
  suggestion?: string;
}

export interface SocketTelemetry {
  supplyChain: number;
  quality: number;
  maintenance: number;
  security: number;
  vulnerability: number;
  license: number;
}

export interface PRCoordinationRequest {
  prId: number;
  repository: string;
  installationId?: number;
  fileDiffs: DiffFile[];
  userConfig: AgentPayload;
}

export interface DiffFile {
  path: string;
  additions: number;
  deletions: number;
  patch: string;
  status: 'added' | 'modified' | 'removed';
}

export interface CoordinationResponse {
  status: 'success' | 'error';
  autonomousAction: 'TRIGGER_AUTO_MERGE' | 'BLOCK_AND_FLAG_MANUAL' | 'NEEDS_REVIEW';
  telemetry: {
    securityAnalysis: any;
    codeQualityAnalysis: any;
    supplyChainAnalysis: any;
  };
  subAgents: SubAgentResult[];
  socketScores: SocketTelemetry;
  sha?: string;
}
