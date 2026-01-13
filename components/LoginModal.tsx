import React, { useState, useCallback } from 'react';

// 内联SVG图标
const IconKey = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
  </svg>
);
const IconAlert = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);
const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconShield = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconLock = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// 有效邀请码列表
const VALID_CODES = [
  "MAT-88FC-36B0-2377", "MAT-2341-5E0E-3A07", "MAT-C290-3ED0-942C", "MAT-99F2-BE1B-E7AE",
  "MAT-D422-5AA6-EC2B", "MAT-145B-185C-BE1D", "MAT-17AD-F5B2-66D0", "MAT-B1CA-EB4A-1416",
  "MAT-EA08-1D81-E8EA", "MAT-A32D-A28F-596F", "MAT-4ADA-9B0A-CBD3", "MAT-27F4-A897-F9C1",
  "MAT-5372-89BB-E8BC", "MAT-6821-8CD0-E470", "MAT-AF10-6FF1-2827", "MAT-B073-A00E-599A",
  "MAT-377D-188A-92DC", "MAT-3DB0-1988-6FFA", "MAT-1D34-745C-1DF2", "MAT-5875-2E33-D017",
  "MAT-3F7E-005F-2D05", "MAT-D3F2-A0C8-94B1", "MAT-2994-A884-589D", "MAT-3A4C-FA58-B23D",
  "MAT-9A77-3D37-C267", "MAT-F462-B42E-C611", "MAT-2926-9324-9EA1", "MAT-E1C7-BAFE-73E6",
  "MAT-B8AD-3D50-310E", "MAT-F07F-AC80-4FF4", "MAT-7528-6233-A35F", "MAT-3C04-E6A4-FE3D",
  "MAT-22F8-C4B6-D54B", "MAT-F393-BD99-0963", "MAT-684D-1ECB-A90E", "MAT-46FC-40A7-9A65",
  "MAT-769B-F16E-68E9", "MAT-FDEF-0380-8259", "MAT-85A5-FC39-52A3", "MAT-E0ED-827A-BD2D",
  "MAT-3405-A11E-111C", "MAT-129C-1A22-E7C0", "MAT-E103-485F-128D", "MAT-E542-50C3-2302",
  "MAT-C9A6-BB67-E325", "MAT-B330-AD34-DC82", "MAT-B302-5217-7933", "MAT-C0B5-E5EA-BEBB",
  "MAT-5D7A-4A65-CD8F", "MAT-FCA6-EE60-28EB"
];

interface LoginModalProps {
  onLogin: (code: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const formatCode = (input: string) => {
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const parts = [];
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 3));
    if (cleaned.length > 3) parts.push(cleaned.slice(3, 7));
    if (cleaned.length > 7) parts.push(cleaned.slice(7, 11));
    if (cleaned.length > 11) parts.push(cleaned.slice(11, 15));
    return parts.join('-');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    if (formatted.length <= 18) {
      setCode(formatted);
      setError('');
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (attempts >= 5) { setError('尝试次数过多，请稍后再试'); return; }
    if (!code.trim()) { setError('请输入邀请码'); return; }
    if (code.length !== 18) { setError('邀请码格式不正确'); setAttempts(prev => prev + 1); return; }

    setIsLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 500));

    if (VALID_CODES.includes(code)) {
      console.log('[LOGIN]', JSON.stringify({ code, timestamp: new Date().toISOString() }));
      sessionStorage.setItem('matrix_invite_code', code);
      onLogin(code);
    } else {
      setAttempts(prev => prev + 1);
      setError(`邀请码无效 (${5 - attempts - 1} 次尝试机会)`);
    }
    setIsLoading(false);
  }, [code, attempts, onLogin]);

  const isLocked = attempts >= 5;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <IconShield className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">内测访问验证</h1>
              <p className="text-slate-400 text-sm mt-1">请输入您的专属邀请码</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <IconLock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <p>本系统仅对受邀内测用户开放。</p>
                <p className="mt-1">如需获取邀请码，请联系项目负责人。</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <IconKey className="w-4 h-4" />邀请码
            </label>
            <input type="text" value={code} onChange={handleInputChange} disabled={isLocked || isLoading}
              placeholder="MAT-XXXX-XXXX-XXXX" autoFocus autoComplete="off" spellCheck={false}
              className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white text-center font-mono text-lg tracking-wider placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                error ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-emerald-500/50 focus:border-emerald-500'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`} />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-500/30 rounded-lg px-4 py-3">
              <IconAlert className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-950/30 border border-amber-500/30 rounded-lg px-4 py-3">
              <IconLock className="w-4 h-4 flex-shrink-0" /><span>账户已临时锁定，请 5 分钟后重试</span>
            </div>
          )}

          <button type="submit" disabled={isLocked || isLoading || !code.trim()}
            className={`w-full py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              !isLocked && !isLoading && code.trim()
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}>
            {isLoading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />验证中...</>)
             : isLocked ? (<><IconLock className="w-5 h-5" />账户已锁定</>)
             : (<><IconCheck className="w-5 h-5" />验证并进入</>)}
          </button>
          <p className="text-center text-xs text-slate-500">邀请码区分大小写 · 每个码仅限一人使用</p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
