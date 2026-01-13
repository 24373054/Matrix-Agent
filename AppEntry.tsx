import React, { useState, Suspense, lazy, useEffect } from 'react';
import { DisclaimerModal } from './components/DisclaimerModal';
import { LoginModal } from './components/LoginModal';
import { logUserConsent } from './services/consentLogger';

// 懒加载主应用
const MainApp = lazy(() => import('./App'));

// 预加载函数 - 在后台静默加载主应用
const preloadMainApp = () => {
  import('./App');
};

type AccessStep = 'disclaimer' | 'login' | 'app';

// 加载占位
const LoadingFallback = () => (
  <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-400 text-sm">正在加载系统...</p>
    </div>
  </div>
);

export default function AppEntry() {
  const [accessStep, setAccessStep] = useState<AccessStep>('disclaimer');
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // 条款页面显示后立即开始预加载主应用
  useEffect(() => {
    if (accessStep === 'disclaimer') {
      // 延迟1秒后开始预加载，让条款页面先渲染完
      const timer = setTimeout(preloadMainApp, 1000);
      return () => clearTimeout(timer);
    }
  }, [accessStep]);

  const handleDisclaimerAccept = async () => {
    await logUserConsent();
    setAccessStep('login');
  };

  const handleLoginSuccess = (code: string) => {
    setInviteCode(code);
    setAccessStep('app');
  };

  if (accessStep === 'disclaimer') {
    return <DisclaimerModal onAccept={handleDisclaimerAccept} />;
  }

  if (accessStep === 'login') {
    return <LoginModal onLogin={handleLoginSuccess} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <MainApp inviteCode={inviteCode} />
    </Suspense>
  );
}
