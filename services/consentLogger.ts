/**
 * 用户协议同意日志服务
 * 记录用户同意协议的行为，用于合规留痕
 */

export interface ConsentLog {
  user_id: string;
  action: 'AGREE_TERMS_V1.0';
  timestamp: string;
  ip_address: string;
  user_agent: string;
  agreement_version: string;
}

// 获取用户IP地址（通过公共API）
async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

// 生成唯一用户ID（基于浏览器指纹）
function generateUserId(): string {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|');
  
  // 简单哈希
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash).toString(16)}`;
}

// 记录用户同意日志
export async function logUserConsent(): Promise<ConsentLog> {
  const ip = await getUserIP();
  
  const log: ConsentLog = {
    user_id: generateUserId(),
    action: 'AGREE_TERMS_V1.0',
    timestamp: new Date().toISOString(),
    ip_address: ip,
    user_agent: navigator.userAgent,
    agreement_version: '2026-01-13',
  };

  // 存储到 localStorage 作为本地备份
  const existingLogs = JSON.parse(localStorage.getItem('consent_logs') || '[]');
  existingLogs.push(log);
  localStorage.setItem('consent_logs', JSON.stringify(existingLogs));

  // 在控制台输出日志（生产环境应发送到后端服务器）
  console.log('[CONSENT LOG]', JSON.stringify(log, null, 2));

  // TODO: 生产环境应将日志发送到后端API
  // await fetch('/api/consent-log', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(log),
  // });

  return log;
}

// 检查用户是否已同意协议
export function hasUserConsented(): boolean {
  return localStorage.getItem('user_agreed_terms_v1') === 'true';
}

// 标记用户已同意协议
export function markUserConsented(): void {
  localStorage.setItem('user_agreed_terms_v1', 'true');
  localStorage.setItem('consent_timestamp', new Date().toISOString());
}

// 获取所有同意日志（用于导出）
export function getAllConsentLogs(): ConsentLog[] {
  return JSON.parse(localStorage.getItem('consent_logs') || '[]');
}
