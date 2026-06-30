// lib/socket-telemetry.ts
// Socket.dev Telemetry Core – Static Analysis (AST) + Dependency Tree Diff
import type { DiffFile, SocketTelemetry, Finding } from '@/types/agent';

// Heuristic exploit / typosquatting feeds
const TYPO_SQUAT_DB = [
  'reactt', 'reacct', 'lodashh', 'expres', 'expresss', 'axois', 'axioss',
  'nextt', 'nxt', 'vuee', 'electorn', 'electr0n', 'chalkk', 'momentt',
  'tailwindccs', 'vitee', 'webpackk', 'typescriptt'
];

const MALICIOUS_PATTERNS = [
  /eval\s*\(/,
  /Function\s*\(['"`]/,
  /require\s*\(\s*['"`]child_process['"`]\s*\)/,
  /process\.mainModule/,
  /\bexecSync\b/,
  /postinstall/i,
  /preinstall/i,
  /https?:\/\/[0-9a-z\-]+\.oast/,
  /atob\s*\(.*fetch/,
  /Buffer\.from.*base64.*eval/s,
];

const SUSPICIOUS_IMPORTS = [
  'node-ipc', 'colors', 'faker', 'left-pad-tampered',
  'ua-parser-js', 'coa', 'rc'
];

export function analyzeDependencyDiff(diffFiles: DiffFile[]): { findings: Finding[]; score: number; changed: string[] } {
  const pkgFile = diffFiles.find(f => f.path.includes('package.json'));
  const findings: Finding[] = [];
  const changedPackages: string[] = [];

  if (!pkgFile) return { findings, score: 92, changed: [] };

  const patch = pkgFile.patch || '';
  // naive added dependency extraction
  const addedLines = patch.split('\n').filter(l => l.startsWith('+') && l.includes(':'));
  for (const line of addedLines) {
    const match = line.match(/"\s*([^"]+)"\s*:\s*"([^"]+)"/);
    if (!match) continue;
    const [_, pkg, version] = match;
    if (pkg === 'name' || pkg === 'version' || pkg === 'dependencies' || pkg === 'devDependencies') continue;
    changedPackages.push(`${pkg}@${version}`);

    // Typosquatting
    if (TYPO_SQUAT_DB.includes(pkg.toLowerCase())) {
      findings.push({
        severity: 'critical',
        file: pkgFile.path,
        rule: 'TYPOSQUAT_DETECT',
        message: `Possible typosquatting: "${pkg}" matches known squat fingerprint. CRITICAL_RISK`,
      });
    }

    // Suspicious known compromised
    if (SUSPICIOUS_IMPORTS.includes(pkg)) {
      findings.push({
        severity: 'high',
        file: pkgFile.path,
        rule: 'SUPPLY_CHAIN_COMPROMISED',
        message: `${pkg} has historic supply-chain incidents. Manual audit required.`,
      });
    }

    // Version risk
    if (/^0\.0\./.test(version) || version.includes('git+') || version.includes('http')) {
      findings.push({
        severity: 'warn',
        file: pkgFile.path,
        rule: 'UNSTABLE_VERSION',
        message: `${pkg}@${version} – unstable / git / remote source`,
      });
    }
  }

  // install script detection
  if (/postinstall|preinstall|install":/i.test(patch)) {
    findings.push({
      severity: 'critical',
      file: pkgFile.path,
      rule: 'INSTALL_SCRIPT_INJECT',
      message: 'Lifecycle install script detected – possible privilege escalation. CRITICAL_RISK',
    });
  }

  const criticals = findings.filter(f=>f.severity==='critical').length;
  const highs = findings.filter(f=>f.severity==='high').length;
  const score = Math.max(12, 94 - criticals*35 - highs*14 - findings.length*3);

  return { findings, score, changed: changedPackages };
}

export function analyzeCodeAST(diffFiles: DiffFile[]): { findings: Finding[]; score: number } {
  const findings: Finding[] = [];

  for (const file of diffFiles) {
    if (file.path.includes('package') || file.path.includes('.md')) continue;
    const code = file.patch;
    MALICIOUS_PATTERNS.forEach((re, idx) => {
      const m = code.match(re);
      if (m) {
        findings.push({
          severity: idx < 2 ? 'critical' : 'high',
          file: file.path,
          rule: 'MALICIOUS_PATTERN_' + idx,
          message: `Suspicious pattern detected: ${re.source.slice(0,44)}`,
          suggestion: 'Remove dynamic eval / child_process. CRITICAL_RISK if untrusted input.',
        });
      }
    });

    // unhandled async
    if (/\.then\s*\(\s*\)/.test(code) || /\bawait\b/.test(code) && !/try\s*{/.test(code)) {
      findings.push({
        severity: 'warn',
        file: file.path,
        rule: 'UNHANDLED_ASYNC',
        message: 'Possible unhandled async / missing try/catch',
      });
    }
    // memory leak heuristic
    if (/setInterval\s*\(/.test(code) && !/clearInterval/.test(code)) {
      findings.push({
        severity: 'warn',
        file: file.path,
        rule: 'MEMORY_LEAK_RISK',
        message: 'setInterval without clearInterval',
      });
    }
    // secrets
    if (/sk-(live|ant-|proj-)[A-Za-z0-9]{20,}/.test(code) || /ghp_[A-Za-z0-9]{36}/.test(code)) {
      findings.push({
        severity: 'critical',
        file: file.path,
        rule: 'SECRET_LEAK',
        message: 'Embedded API secret detected. CRITICAL_RISK',
      });
    }
  }

  const criticals = findings.filter(f=>f.severity==='critical').length;
  const score = Math.max(10, 90 - criticals*30 - findings.length*4);
  return { findings, score };
}

export function computeSocketScores(depScore: number, codeScore: number, findingsCount: number): SocketTelemetry {
  const drift = Math.min(15, findingsCount*2);
  return {
    supplyChain: Math.max(0, Math.min(100, depScore)),
    security: Math.max(0, Math.min(100, codeScore - 3)),
    quality: Math.max(30, Math.min(96, codeScore + 4 - drift)),
    maintenance: Math.max(40, 82 - drift),
    vulnerability: Math.max(5, 100 - codeScore),
    license: 88,
  };
}

export function riskLevelFromScore(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_RISK' {
  if (score < 35) return 'CRITICAL_RISK';
  if (score < 60) return 'HIGH';
  if (score < 80) return 'MEDIUM';
  return 'LOW';
}
