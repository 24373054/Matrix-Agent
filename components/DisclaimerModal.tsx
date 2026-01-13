import React, { useState, useEffect, useCallback } from 'react';

// 内联SVG图标 - 避免加载 lucide-react
const IconAlert = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);
const IconShield = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconFile = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);
const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconClock = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconScale = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

interface DisclaimerModalProps {
  onAccept: () => void;
}

const COUNTDOWN_SECONDS = 10;
const AGREEMENT_VERSION = '2026年1月';

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isChecked, setIsChecked] = useState(false);
  const [isConfirmChecked, setIsConfirmChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const canAccept = countdown === 0 && isChecked && isConfirmChecked;

  const handleAccept = useCallback(async () => {
    if (!canAccept) return;
    setIsLoading(true);
    try {
      await onAccept();
    } catch (error) {
      console.error('Failed:', error);
    }
    setIsLoading(false);
  }, [canAccept, onAccept]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-4xl bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/10 max-h-[95vh] flex flex-col">
        
        {/* 头部 */}
        <div className="bg-gradient-to-r from-red-950 to-orange-950 border-b border-red-500/30 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <IconAlert className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                <IconShield className="w-6 h-6" />
                【重要】内部测试用户协议与风险免责声明
              </h1>
              <p className="text-red-300/80 text-sm mt-1">版本日期：{AGREEMENT_VERSION} | 请务必仔细阅读全部内容</p>
            </div>
          </div>
        </div>

        {/* 协议内容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 leading-relaxed min-h-0">
          
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <IconAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200">
                <p className="font-semibold mb-2">⚠️ 重要提示（请先阅读）</p>
                <p>欢迎参与本区块链溯源查证智能体（以下简称"本系统"）的封闭式内部测试。在您开始使用本系统前，请务必仔细阅读并充分理解本协议的全部内容，特别是以<span className="text-amber-400 font-semibold">粗体/下划线</span>标注的关于免责条款、风险提示及用户义务的内容。</p>
                <p className="mt-2 text-amber-300 font-medium">如果您不同意本协议的任何条款，请立即停止使用并退出本系统。</p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <IconFile className="w-5 h-5" />1. 服务性质声明（非商业化/非公开）
            </h2>
            <div className="pl-7 space-y-2 text-sm">
              <p><span className="text-white font-semibold">1.1 内测阶段：</span> 本系统目前处于极早期的封闭内部测试阶段（Closed Beta），仅面向受邀的特定技术研究人员、区块链从业者开放，<span className="text-red-400 font-semibold underline">严禁向任何第三方或社会公众公开转发、演示或提供本服务</span>。</p>
              <p><span className="text-white font-semibold">1.2 技术实验工具：</span> 本系统旨在探索大语言模型（LLM）在区块链链上公开数据分析领域的技术可行性，<span className="text-red-400 font-semibold">不具备商业化运营条件</span>。本系统提供的所有服务均为免费、非正式的测试服务。</p>
              <p><span className="text-white font-semibold">1.3 不稳定性：</span> 由于处于内测期，服务可能随时因技术调整、合规审查或不可抗力而中断、终止或回滚，开发者不对服务连续性及数据保留做任何承诺。</p>
            </div>
          </section>

          <section className="space-y-3 bg-red-950/20 border border-red-500/20 rounded-xl p-4 -mx-2">
            <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
              <IconAlert className="w-5 h-5" />2. AI生成内容与准确性免责 （核心条款）
            </h2>
            <div className="pl-7 space-y-2 text-sm">
              <p><span className="text-white font-semibold">2.1 技术局限性：</span> 您知悉并同意，本系统基于生成式人工智能技术。由于大模型的技术特性，<span className="text-red-400 font-semibold underline">系统输出的内容具有概率性、不确定性及潜在的"幻觉"风险</span>。</p>
              <p><span className="text-white font-semibold">2.2 非事实依据：</span> 本系统生成的任何溯源路径、资金流向图谱、地址标签或风险分析报告，<span className="text-red-400 font-semibold underline">仅供技术逻辑参考，不保证其真实性、准确性、完整性或时效性</span>。</p>
              <p><span className="text-white font-semibold">2.3 禁止作为决策依据：</span></p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-red-300">
                <li>本系统输出<span className="font-semibold underline">不构成任何法律证据、司法鉴定结果或行政调查依据</span>。</li>
                <li>本系统输出<span className="font-semibold underline">不构成任何投资建议、金融决策依据或交易指导</span>。</li>
              </ul>
              <p><span className="text-white font-semibold">2.4 人工核查义务：</span> 您在使用本系统输出的结果前，<span className="text-amber-400 font-semibold">必须通过区块链浏览器（如 Etherscan 等）或其他权威渠道进行独立的人工复核</span>。因您直接采信、引用或传播本系统结果而导致的任何资金损失、法律纠纷或声誉损害，<span className="text-red-400 font-semibold underline">开发者及运营团队不承担任何责任</span>。</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <IconScale className="w-5 h-5" />3. 合法合规使用承诺
            </h2>
            <div className="pl-7 space-y-2 text-sm">
              <p><span className="text-white font-semibold">3.1 数据来源合规：</span> 本系统仅基于公开的区块链账本数据进行分析。系统不通过非法侵入、爬虫等手段获取任何非公开的个人隐私数据。</p>
              <p><span className="text-white font-semibold">3.2 严禁非法用途：</span> 您承诺拥有合法的身份和明确的合规目的。<span className="text-red-400 font-semibold">严禁利用本系统从事以下活动：</span></p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-red-300">
                <li>追踪、人肉搜索公民个人现实身份信息，侵犯他人隐私权。</li>
                <li>为洗钱、非法集资、网络赌博、电信诈骗等犯罪活动提供技术支持或规避手段。</li>
                <li>窃取、破解他人的私钥、助记词或数字资产。</li>
                <li>生成违反中国法律法规、涉及政治敏感、暴力恐怖、色情低俗的内容。</li>
              </ul>
              <p><span className="text-white font-semibold">3.3 输入规范：</span> 您在与智能体对话时，<span className="text-amber-400 font-semibold">不得输入任何涉及国家秘密、商业机密或他人隐私的信息</span>。若因您的输入导致敏感信息泄露，责任由您自行承担。</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <IconShield className="w-5 h-5" />4. 知识产权与数据隐私
            </h2>
            <div className="pl-7 space-y-2 text-sm">
              <p><span className="text-white font-semibold">4.1 权利归属：</span> 本系统的算法、模型、代码及界面设计的知识产权归开发者所有。</p>
              <p><span className="text-white font-semibold">4.2 数据处理：</span> 为了改进模型性能，系统可能会对您的对话指令（Prompt）进行去标识化处理后用于分析。但系统承诺<span className="text-emerald-400 font-semibold">不存储您的私钥、助记词或任何能够直接识别您现实身份的敏感数据</span>。</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <IconAlert className="w-5 h-5" />5. 违约处理与管辖
            </h2>
            <div className="pl-7 space-y-2 text-sm">
              <p><span className="text-white font-semibold">5.1 熔断机制：</span> 一旦系统检测到（或接到举报）您利用本系统从事非法活动或输入违规内容，<span className="text-red-400 font-semibold">开发者有权在不通知的情况下立即封禁您的账号、终止服务，并向相关监管机关报案</span>。</p>
              <p><span className="text-white font-semibold">5.2 法律适用：</span> 本协议的解释及争议解决均适用<span className="text-amber-400 font-semibold">中华人民共和国法律</span>。</p>
            </div>
          </section>
        </div>

        {/* 底部操作区 */}
        <div className="border-t border-slate-700 p-6 space-y-4 bg-slate-900/95 rounded-b-2xl flex-shrink-0">
          {countdown > 0 && (
            <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-950/30 border border-amber-500/30 rounded-lg py-3">
              <IconClock className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">请仔细阅读协议内容，{countdown} 秒后可进行确认操作</span>
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} disabled={countdown > 0}
                className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" />
              <span className={`text-sm ${countdown > 0 ? 'text-slate-500' : 'text-slate-300 group-hover:text-white'} transition-colors`}>
                <IconCheck className="w-4 h-4 inline mr-1 text-emerald-500" />
                <span className="font-semibold text-emerald-400">我已阅读并同意上述所有条款</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={isConfirmChecked} onChange={(e) => setIsConfirmChecked(e.target.checked)} disabled={countdown > 0}
                className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" />
              <span className={`text-sm ${countdown > 0 ? 'text-slate-500' : 'text-slate-300 group-hover:text-white'} transition-colors`}>
                我确认：我是一名具有区块链基础知识的技术/研究人员，我清楚了解 AI 技术的局限性，并<span className="text-red-400 font-semibold">承诺自行承担使用本系统产生的一切风险</span>。
              </span>
            </label>
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={() => window.close()} className="flex-1 py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 transition-all">
              不同意，退出系统
            </button>
            <button onClick={handleAccept} disabled={!canAccept || isLoading}
              className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                canAccept && !isLoading ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}>
              {isLoading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />处理中...</>)
               : countdown > 0 ? (<><IconClock className="w-5 h-5" />请等待 {countdown} 秒</>)
               : (<><IconCheck className="w-5 h-5" />同意并进入系统</>)}
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 pt-2">协议版本：v1.0 | 生效日期：{AGREEMENT_VERSION} | 您的同意记录将被安全存储</p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
