import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, Search, Settings, HelpCircle, User, Send, Paperclip, MoreHorizontal, Bot, ChevronLeft, ChevronRight, Zap, ShieldCheck, X, CreditCard, Bell, Lock, Eye, EyeOff, CheckCircle, RefreshCw, AlertTriangle, Loader2, Check, Info, Camera, Mail, Globe, Moon, Sun, Monitor, Trash2, Download, FileText, ExternalLink, Cpu, Key, Smartphone, Laptop, LogOut, Code, Activity, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { ChatSession, Message, Role, AnalysisReport } from './types';
import { sendMessageToGemini, generateMockAnalysis, ModelProvider } from './services/gemini';
import { AnalysisCard } from './components/AnalysisCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import './markdown.css';

// Regex to detect crypto addresses
const ADDRESS_REGEX = /(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})/g;

// --- Localization & Theme Config ---
type Language = 'en' | 'zh' | 'ja';
type ThemeMode = 'system' | 'light' | 'dark';

const translations = {
  en: {
    appTitle: 'Matrix Agent',
    newChat: 'New Investigation',
    recentCases: 'Recent Cases',
    tools: 'Tools',
    settings: 'Settings',
    logout: 'Log out',
    inputPlaceholder: 'Enter address (0x... / Base58) or ask a question...',
    welcomeTitle: 'How can I assist with',
    welcomeSubtitle: 'on-chain',
    welcomeSuffix: 'forensics?',
    welcomeDesc: 'I can analyze transaction graphs, audit smart contracts for vulnerabilities, and trace funds across mixers.',
    suggestions: [
      'Analyze address 0x7a250d...',
      'Trace funds from the latest bridge hack',
      'Check risk score for USDT contract',
      'Explain the logic of this reentrancy attack'
    ],
    settingsModal: {
      general: 'General',
      account: 'Account',
      api: 'API & Integrations',
      billing: 'Billing',
      security: 'Security',
      data: 'Data Controls',
      about: 'About',
      appearance: 'Appearance',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      langDesc: 'Language for the UI and AI responses',
      clearHistory: 'Clear All Chats',
      exportData: 'Export Data',
      dangerZone: 'Danger Zone',
      regenKey: 'Regenerate API Key',
      twoFactor: 'Two-Factor Authentication'
    }
  },
  zh: {
    appTitle: 'Matrix 智能体',
    newChat: '发起新调查',
    recentCases: '近期案例',
    tools: '工具箱',
    settings: '设置',
    logout: '退出登录',
    inputPlaceholder: '输入地址 (0x... / Base58) 或提问...',
    welcomeTitle: '我该如何协助您的',
    welcomeSubtitle: '链上',
    welcomeSuffix: '取证工作？',
    welcomeDesc: '我可以分析交易图谱，审计智能合约漏洞，并追踪混币器资金流向。',
    suggestions: [
      '分析地址 0x7a250d...',
      '追踪最新跨链桥黑客资金',
      '检查 USDT 合约风险评分',
      '解释这个重入攻击的逻辑'
    ],
    settingsModal: {
      general: '通用设置',
      account: '账号管理',
      api: 'API 与集成',
      billing: '账单与订阅',
      security: '安全设置',
      data: '数据管理',
      about: '关于我们',
      appearance: '外观主题',
      language: '语言设置',
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
      langDesc: '界面和 AI 回复的语言',
      clearHistory: '清除所有对话',
      exportData: '导出数据',
      dangerZone: '危险区域',
      regenKey: '重置 API 密钥',
      twoFactor: '双重验证'
    }
  },
  ja: {
    appTitle: 'Matrix エージェント',
    newChat: '新規調査',
    recentCases: '最近のケース',
    tools: 'ツール',
    settings: '設定',
    logout: 'ログアウト',
    inputPlaceholder: 'アドレス (0x... / Base58) を入力するか質問してください...',
    welcomeTitle: 'どのような',
    welcomeSubtitle: 'オンチェーン',
    welcomeSuffix: '分析をお手伝いしますか？',
    welcomeDesc: 'トランザクショングラフの分析、スマートコントラクトの監査、ミキサー間の資金追跡が可能です。',
    suggestions: [
      'アドレス 0x7a250d... を分析',
      '最新のブリッジハック資金を追跡',
      'USDTコントラクトのリスクスコアを確認',
      '再入攻撃のロジックを説明して'
    ],
    settingsModal: {
      general: '一般',
      account: 'アカウント',
      api: 'API & 統合',
      billing: '請求とプラン',
      security: 'セキュリティ',
      data: 'データ管理',
      about: '情報',
      appearance: '外観',
      language: '言語',
      light: 'ライト',
      dark: 'ダーク',
      system: 'システム',
      langDesc: 'UIおよびAI応答の言語',
      clearHistory: '履歴を消去',
      exportData: 'データのエクスポート',
      dangerZone: '危険エリア',
      regenKey: 'APIキーを再生成',
      twoFactor: '二要素認証'
    }
  }
};

// Types
interface UserProfile {
  name: string;
  email: string;
  plan: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ToastContainer = ({ toasts }: { toasts: Toast[] }) => (
  <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
    {toasts.map(toast => (
      <div 
        key={toast.id}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md animate-[slideIn_0.3s_ease-out] pointer-events-auto min-w-[300px]
          ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' : ''}
          ${toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-200' : ''}
          ${toast.type === 'info' ? 'bg-slate-900/90 border-slate-700/50 text-slate-200' : ''}
        `}
      >
        {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-500" />}
        {toast.type === 'error' && <AlertTriangle size={18} className="text-red-500" />}
        {toast.type === 'info' && <Info size={18} className="text-blue-500" />}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    ))}
  </div>
);

// --- Style Helpers ---
const getThemeStyles = (isDark: boolean) => ({
  bgMain: isDark ? 'bg-slate-950' : 'bg-slate-50',
  bgSecondary: isDark ? 'bg-slate-900' : 'bg-white',
  bgTertiary: isDark ? 'bg-slate-800' : 'bg-slate-100',
  textMain: isDark ? 'text-slate-200' : 'text-slate-900',
  textSecondary: isDark ? 'text-slate-400' : 'text-slate-500',
  border: isDark ? 'border-slate-800' : 'border-slate-200',
  borderHighlight: isDark ? 'border-emerald-500/50' : 'border-emerald-600/50',
  inputBg: isDark ? 'bg-slate-950' : 'bg-white',
  hoverBg: isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
  accentText: isDark ? 'text-emerald-400' : 'text-emerald-600',
  accentBg: isDark ? 'bg-emerald-600' : 'bg-emerald-600',
});

// --- Settings Modal Component ---
const SettingsModal = ({ 
  isOpen, 
  onClose, 
  onLogout, 
  userProfile,
  onUpdateProfile,
  addToast,
  onClearHistory,
  language,
  setLanguage,
  themeMode,
  setThemeMode,
  isDark
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onLogout: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onClearHistory: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (t: ThemeMode) => void;
  isDark: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'api' | 'billing' | 'security' | 'data' | 'about'>('general');
  const t = translations[language];
  const s = getThemeStyles(isDark);
  
  // Profile Edit State
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // API State
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('sk-mat-8837-x92-bc4-live');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  // Security State
  const [twoFactor, setTwoFactor] = useState(true);

  // Billing State
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [cardLast4, setCardLast4] = useState('4242');
  const [tempLast4, setTempLast4] = useState('');
  const [isSavingCard, setIsSavingCard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditName(userProfile.name);
      setEditEmail(userProfile.email);
    }
  }, [isOpen, userProfile]);

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      addToast("Name and Email are required", "error");
      return;
    }
    setIsSavingProfile(true);
    setTimeout(() => {
      onUpdateProfile({ ...userProfile, name: editName, email: editEmail });
      setIsSavingProfile(false);
      addToast("Profile updated", "success");
    }, 1000);
  };

  const handleRegenerateKey = () => {
    if (!confirmRegen) {
      setConfirmRegen(true);
      setTimeout(() => setConfirmRegen(false), 3000);
      return;
    }
    setIsRegenerating(true);
    setConfirmRegen(false);
    setTimeout(() => {
      setApiKey(`sk-mat-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-live`);
      setIsRegenerating(false);
      setShowKey(true);
      addToast("New API Key generated", "success");
    }, 2000);
  };

  const savePaymentMethod = () => {
    if (tempLast4.length !== 4) {
      addToast("Invalid card digits", "error");
      return;
    }
    setIsSavingCard(true);
    setTimeout(() => {
      setCardLast4(tempLast4);
      setIsEditingPayment(false);
      setIsSavingCard(false);
      addToast("Payment method updated", "success");
    }, 1500);
  };

  const handleClearHistory = () => {
    if(confirm("Are you sure?")) {
      onClearHistory();
      addToast("History cleared", "success");
    }
  }

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: t.settingsModal.general, icon: Settings },
    { id: 'account', label: t.settingsModal.account, icon: User },
    { id: 'api', label: t.settingsModal.api, icon: Code },
    { id: 'security', label: t.settingsModal.security, icon: ShieldCheck },
    { id: 'billing', label: t.settingsModal.billing, icon: CreditCard },
    { id: 'data', label: t.settingsModal.data, icon:  Cpu },
    { id: 'about', label: t.settingsModal.about, icon: Info },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className={`w-full max-w-4xl ${s.bgMain} border ${s.border} rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex h-[650px] max-h-[90vh]`}>
        
        {/* Sidebar */}
        <div className={`w-64 ${s.bgSecondary} border-r ${s.border} flex flex-col`}>
          <div className="p-6 pb-4">
            <h2 className={`text-xl font-semibold ${s.textMain} tracking-tight`}>{t.settings}</h2>
          </div>
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? `${s.bgTertiary} ${s.accentText}` 
                    : `${s.textSecondary} ${s.hoverBg} hover:${s.textMain}`
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
          <div className={`p-4 border-t ${s.border}`}>
             <button 
                onClick={onLogout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors`}
              >
                <LogOut size={18} />
                {t.logout}
              </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 flex flex-col ${s.bgMain} min-w-0`}>
          <div className={`flex items-center justify-between p-6 border-b ${s.border}`}>
             <h3 className={`text-lg font-medium ${s.textMain} capitalize`}>{tabs.find(tab => tab.id === activeTab)?.label}</h3>
             <button onClick={onClose} className={`${s.textSecondary} hover:${s.textMain} transition-colors`}>
               <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* --- GENERAL --- */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fadeIn">
                <section className="space-y-4">
                  <h4 className={`text-sm font-medium ${s.textSecondary} uppercase tracking-wider`}>{t.settingsModal.appearance}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { mode: 'light', icon: Sun, label: t.settingsModal.light },
                      { mode: 'dark', icon: Moon, label: t.settingsModal.dark },
                      { mode: 'system', icon: Monitor, label: t.settingsModal.system },
                    ].map(opt => (
                      <button 
                        key={opt.mode}
                        onClick={() => setThemeMode(opt.mode as ThemeMode)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                          themeMode === opt.mode 
                            ? `${s.bgTertiary} border-emerald-500 ${s.textMain}` 
                            : `${s.bgMain} ${s.border} ${s.textSecondary} hover:${s.textMain}`
                        }`}
                      >
                        <opt.icon size={24} />
                        <span className="text-sm">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className={`text-sm font-medium ${s.textSecondary} uppercase tracking-wider`}>{t.settingsModal.language}</h4>
                  <div className={`flex items-center justify-between p-4 ${s.bgSecondary} rounded-xl border ${s.border}`}>
                    <div className="flex items-center gap-3">
                      <Globe size={20} className={s.textSecondary} />
                      <div>
                        <div className={`text-sm font-medium ${s.textMain}`}>{t.settingsModal.language}</div>
                        <div className={`text-xs ${s.textSecondary}`}>{t.settingsModal.langDesc}</div>
                      </div>
                    </div>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className={`${s.inputBg} ${s.border} ${s.textMain} text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500`}
                    >
                      <option value="en">English</option>
                      <option value="zh">中文 (简体)</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                </section>
              </div>
            )}

            {/* --- ACCOUNT --- */}
            {activeTab === 'account' && (
              <div className="space-y-6 animate-fadeIn max-w-lg">
                <div className={`flex items-center gap-6 pb-6 border-b ${s.border}`}>
                  <div className="relative group cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                      {userProfile.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={20} className="text-white/80" />
                    </div>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${s.textMain}`}>{userProfile.name}</h4>
                    <p className={`${s.textSecondary} text-sm`}>{userProfile.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full">
                      {userProfile.plan} Plan
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${s.textSecondary} uppercase ml-1`}>Display Name</label>
                    <div className={`flex items-center gap-2 ${s.bgSecondary} border ${s.border} rounded-xl px-3 py-2.5 focus-within:border-emerald-500 transition-colors`}>
                       <User size={18} className={s.textSecondary} />
                       <input 
                         type="text" 
                         value={editName}
                         onChange={(e) => setEditName(e.target.value)}
                         className={`bg-transparent border-none focus:ring-0 ${s.textMain} w-full text-sm placeholder-slate-500`}
                       />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${s.textSecondary} uppercase ml-1`}>Email Address</label>
                    <div className={`flex items-center gap-2 ${s.bgSecondary} border ${s.border} rounded-xl px-3 py-2.5 focus-within:border-emerald-500 transition-colors`}>
                       <Mail size={18} className={s.textSecondary} />
                       <input 
                         type="email" 
                         value={editEmail}
                         onChange={(e) => setEditEmail(e.target.value)}
                         className={`bg-transparent border-none focus:ring-0 ${s.textMain} w-full text-sm placeholder-slate-500`}
                       />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                   <button 
                     onClick={handleSaveProfile}
                     disabled={isSavingProfile}
                     className={`px-6 py-2 ${s.accentBg} hover:opacity-90 text-white font-medium rounded-lg shadow-lg transition-all flex items-center gap-2`}
                   >
                     {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                     {isSavingProfile ? 'Saving...' : 'Update Profile'}
                   </button>
                </div>
              </div>
            )}

            {/* --- API --- */}
            {activeTab === 'api' && (
               <div className="space-y-6 animate-fadeIn">
                 {/* Key Management */}
                 <div className={`p-5 ${s.bgSecondary} rounded-xl border ${s.border} space-y-4`}>
                    <div>
                       <label className={`text-xs font-semibold ${s.textSecondary} uppercase flex justify-between`}>
                         Active Secret Key
                         {isRegenerating && <span className="text-emerald-500 flex items-center gap-1"><RefreshCw size={10} className="animate-spin"/> Generating...</span>}
                       </label>
                       <div className="flex items-center gap-2 mt-2">
                         <code className={`flex-1 ${s.inputBg} p-3 rounded-lg border ${s.border} font-mono text-sm truncate transition-colors ${isRegenerating ? s.textSecondary : 'text-emerald-500'}`}>
                           {showKey ? apiKey : 'sk-mat-•••••••••••••••••••••••••'}
                         </code>
                         <button 
                           onClick={() => setShowKey(!showKey)}
                           className={`p-3 ${s.bgTertiary} hover:opacity-80 rounded-lg ${s.textSecondary} hover:${s.textMain} transition-colors`}
                           disabled={isRegenerating}
                         >
                           {showKey ? <EyeOff size={18}/> : <Eye size={18}/>}
                         </button>
                       </div>
                       <p className={`text-xs ${s.textSecondary} mt-2 flex items-center gap-1`}>
                         <CheckCircle size={10} className="text-emerald-500"/>
                         Last used 2 minutes ago by 192.168.1.1
                       </p>
                    </div>

                     <div className={`p-4 ${isDark ? 'bg-red-950/10 border-red-900/30' : 'bg-red-50 border-red-100'} rounded-lg border`}>
                        <div className="flex items-start justify-between">
                           <div>
                             <h4 className="text-sm font-medium text-red-500 mb-1">Rotate API Key</h4>
                             <p className="text-xs text-red-400/80">Regenerating will invalidate the current key immediately.</p>
                           </div>
                           <button 
                              onClick={handleRegenerateKey}
                              disabled={isRegenerating}
                              className={`px-3 py-1.5 border text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${confirmRegen 
                                ? 'bg-red-600 border-red-500 text-white animate-pulse' 
                                : 'border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950 text-red-500'}`}
                            >
                              {isRegenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                              {confirmRegen ? 'Confirm?' : 'Regenerate'}
                            </button>
                        </div>
                     </div>
                 </div>

                 {/* Usage Stats */}
                 <div className={`p-5 ${s.bgSecondary} rounded-xl border ${s.border}`}>
                    <h4 className={`text-sm font-medium ${s.textMain} mb-4 flex items-center gap-2`}>
                      <Activity size={16} className={s.accentText} />
                      API Usage
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-2">
                          <span className={s.textSecondary}>Monthly Quota</span>
                          <span className={s.textMain}>850 / 1,000 reqs</span>
                        </div>
                        <div className={`h-2.5 ${s.bgTertiary} rounded-full overflow-hidden border ${s.border}`}>
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 w-[85%] rounded-full"></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 ${s.bgTertiary} rounded-lg border ${s.border}`}>
                          <div className={`text-xs ${s.textSecondary}`}>Error Rate</div>
                          <div className="text-lg font-mono text-emerald-500">0.02%</div>
                        </div>
                        <div className={`p-3 ${s.bgTertiary} rounded-lg border ${s.border}`}>
                          <div className={`text-xs ${s.textSecondary}`}>Avg Latency</div>
                          <div className={`text-lg font-mono ${s.textMain}`}>124ms</div>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
            )}

            {/* --- SECURITY --- */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                <section>
                   <h4 className={`text-sm font-medium ${s.textSecondary} uppercase tracking-wider mb-3`}>Authentication</h4>
                   <div className={`p-4 ${s.bgSecondary} rounded-xl border ${s.border} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${s.bgTertiary} rounded-lg ${s.textSecondary}`}>
                        <Lock size={20} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${s.textMain} mb-0.5`}>{t.settingsModal.twoFactor}</h4>
                        <p className={`text-xs ${s.textSecondary}`}>Secure your account with 2FA (TOTP).</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setTwoFactor(!twoFactor);
                        addToast(twoFactor ? "2FA Disabled" : "2FA Enabled", "info");
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${twoFactor ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span
                        className={`${
                          twoFactor ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </div>
                </section>

                <section>
                   <h4 className={`text-sm font-medium ${s.textSecondary} uppercase tracking-wider mb-3`}>Active Sessions</h4>
                   <div className={`rounded-xl border ${s.border} overflow-hidden`}>
                      <div className={`p-4 ${s.bgSecondary} flex items-center justify-between border-b ${s.border}`}>
                         <div className="flex items-center gap-3">
                            <Monitor size={20} className="text-emerald-500" />
                            <div>
                               <div className={`text-sm font-medium ${s.textMain}`}>Mac OS <span className="text-xs text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded ml-1">Current</span></div>
                               <div className={`text-xs ${s.textSecondary}`}>Chrome • Tokyo, Japan</div>
                            </div>
                         </div>
                      </div>
                      <div className={`p-4 ${s.bgSecondary} flex items-center justify-between`}>
                         <div className="flex items-center gap-3">
                            <Smartphone size={20} className={s.textSecondary} />
                            <div>
                               <div className={`text-sm font-medium ${s.textMain}`}>iPhone 14 Pro</div>
                               <div className={`text-xs ${s.textSecondary}`}>Safari • Osaka, Japan • 2 hrs ago</div>
                            </div>
                         </div>
                         <button className={`p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 rounded-lg transition-colors`}>
                           <LogOut size={16} />
                         </button>
                      </div>
                   </div>
                </section>
                
                <div className={`p-4 ${isDark ? 'bg-red-950/10 border-red-900/30' : 'bg-red-50 border-red-100'} rounded-xl border`}>
                   <h4 className="text-sm font-medium text-red-500 mb-2 flex items-center gap-2">
                     <AlertTriangle size={16}/>
                     Deactivate Account
                   </h4>
                   <p className="text-xs text-red-400/80 mb-3">This will permanently delete your account and all associated data.</p>
                   <button className="text-xs font-semibold text-red-500 hover:text-red-400 hover:underline">
                     Proceed to deletion
                   </button>
                </div>
              </div>
            )}

            {/* --- BILLING --- */}
            {activeTab === 'billing' && (
              <div className="space-y-6 animate-fadeIn">
                 <div className="p-6 bg-gradient-to-br from-indigo-900/90 to-slate-900 rounded-xl border border-indigo-500/30 relative overflow-hidden text-white">
                   <div className="absolute top-0 right-0 p-3 opacity-10">
                     <Zap size={100} />
                   </div>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                     <div className="space-y-4 flex-1">
                       <div>
                         <div className="text-sm text-slate-300 mb-1">Current Plan</div>
                         <div className="text-3xl font-bold tracking-tight">{userProfile.plan} Analyst</div>
                       </div>
                       
                       <div className="space-y-2 max-w-md">
                         <div className="flex justify-between text-xs font-medium">
                           <span className="text-indigo-200">Monthly Credits</span>
                           <span className="text-white">850 / 1000</span>
                         </div>
                         <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                           <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-[85%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                         </div>
                         <p className="text-xs text-slate-400 pt-1">Renews on Nov 01, 2023</p>
                       </div>
                     </div>
                     <div className="flex flex-col justify-center items-end gap-3">
                        <span className="bg-white text-slate-950 text-xl font-bold px-3 py-1 rounded shadow-sm">$29<span className="text-sm font-normal text-slate-500">/mo</span></span>
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
                           Upgrade Plan
                        </button>
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className={`text-sm font-medium ${s.textSecondary} uppercase tracking-wider`}>Payment Method</h4>
                   <div className={`flex items-center justify-between p-4 ${s.bgSecondary} rounded-xl border ${s.border}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-8 ${s.bgTertiary} rounded border ${s.border} flex items-center justify-center text-xs font-bold ${s.textSecondary}`}>VISA</div>
                        
                        {isEditingPayment ? (
                          <div className="flex items-center gap-2">
                             <span className={`${s.textSecondary} text-sm`}>•••• •••• ••••</span>
                             <input 
                               type="text" 
                               maxLength={4}
                               className={`w-16 ${s.inputBg} border ${s.border} rounded px-2 py-1 text-sm ${s.textMain} focus:outline-none focus:border-emerald-500`}
                               value={tempLast4}
                               onChange={(e) => setTempLast4(e.target.value.replace(/\D/g,''))}
                               autoFocus
                               placeholder="1234"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className={`text-sm font-medium ${s.textMain}`}>Visa ending in {cardLast4}</div>
                            <div className={`text-xs ${s.textSecondary}`}>Expiry 12/2025</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isEditingPayment ? (
                           <>
                             <button onClick={savePaymentMethod} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                               {isSavingCard ? <Loader2 size={18} className="animate-spin"/> : <Check size={18}/>}
                             </button>
                             <button onClick={() => setIsEditingPayment(false)} className={`p-2 ${s.textSecondary} ${s.hoverBg} rounded-lg`}><X size={18}/></button>
                           </>
                        ) : (
                           <button onClick={() => { setIsEditingPayment(true); setTempLast4(cardLast4); }} className={`px-3 py-1.5 text-sm ${s.textSecondary} hover:${s.textMain} border ${s.border} ${s.hoverBg} rounded-lg transition-colors`}>Edit</button>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* --- DATA --- */}
            {activeTab === 'data' && (
               <div className="space-y-6 animate-fadeIn">
                 <section className="space-y-4">
                  <h4 className={`text-sm font-medium ${s.textSecondary} uppercase tracking-wider`}>{t.settingsModal.data}</h4>
                  <div className={`p-4 ${s.bgSecondary} rounded-xl border ${s.border} flex items-center justify-between`}>
                     <div className="flex items-center gap-3">
                       <Download size={20} className={s.textSecondary}/>
                       <div>
                         <div className={`text-sm font-medium ${s.textMain}`}>{t.settingsModal.exportData}</div>
                         <div className={`text-xs ${s.textSecondary}`}>Download as JSON</div>
                       </div>
                     </div>
                     <button className={`px-3 py-1.5 text-sm ${s.textSecondary} hover:${s.textMain} border ${s.border} ${s.hoverBg} rounded-lg`}>
                       Export
                     </button>
                  </div>
                  
                  <div className={`p-4 ${s.bgSecondary} rounded-xl border ${s.border} flex items-center justify-between`}>
                     <div className="flex items-center gap-3">
                       <Trash2 size={20} className="text-red-400"/>
                       <div>
                         <div className={`text-sm font-medium ${s.textMain}`}>{t.settingsModal.clearHistory}</div>
                         <div className={`text-xs ${s.textSecondary}`}>Permanently delete history</div>
                       </div>
                     </div>
                     <button onClick={handleClearHistory} className="px-3 py-1.5 text-sm text-red-400 hover:text-red-500 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                       Clear All
                     </button>
                  </div>
                 </section>
               </div>
            )}

             {/* --- ABOUT --- */}
             {activeTab === 'about' && (
               <div className="space-y-6 animate-fadeIn">
                 <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                      <Zap className="text-white fill-current" size={32} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${s.textMain}`}>{t.appTitle}</h3>
                      <p className={`${s.textSecondary} text-sm`}>Version 2.1.0 (Pro)</p>
                    </div>
                 </div>

                 <div className="space-y-2">
                   {['Terms of Service', 'Privacy Policy'].map(item => (
                     <a key={item} href="#" className={`flex items-center justify-between p-4 ${s.bgSecondary} ${s.hoverBg} rounded-xl border ${s.border} transition-colors group`}>
                        <div className="flex items-center gap-3">
                          <FileText size={20} className={`${s.textSecondary} group-hover:text-emerald-500 transition-colors`} />
                          <span className={`text-sm font-medium ${s.textMain}`}>{item}</span>
                        </div>
                        <ExternalLink size={16} className={s.textSecondary} />
                     </a>
                   ))}
                 </div>
               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Model Selection State
  const [selectedModel, setSelectedModel] = useState<ModelProvider>(() => 
    (localStorage.getItem('matrix_model') as ModelProvider) || 'deepseek'
  );
  
  // File Upload State
  const [attachment, setAttachment] = useState<{ name: string; type: string; data: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings State with Persistence
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('matrix_lang') as Language || 'en');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => localStorage.getItem('matrix_theme') as ThemeMode || 'dark');
  
  // Computed Theme
  const isSystemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = themeMode === 'system' ? isSystemDark : themeMode === 'dark';
  const s = getThemeStyles(isDark);
  const t = translations[language];

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('matrix_lang', language);
    localStorage.setItem('matrix_theme', themeMode);
    localStorage.setItem('matrix_model', selectedModel);
    
    // Update body background to match theme to avoid white flashes
    if (typeof document !== 'undefined') {
       document.body.style.backgroundColor = isDark ? '#020617' : '#f8fafc';
    }
  }, [language, themeMode, isDark, selectedModel]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Operator',
    email: 'operator@matrix.eth',
    plan: 'PRO'
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const [sessions, setSessions] = useState<ChatSession[]>([
    { 
      id: '1', 
      title: 'Tornado Cash Trace', 
      lastMessage: 'Analysis complete', 
      timestamp: new Date(),
      messages: [
        { id: '1-1', role: Role.USER, text: 'Trace funds for Tornado Cash withdrawal 0x...abc', timestamp: new Date(Date.now() - 10000) },
        { id: '1-2', role: Role.MODEL, text: 'Analysis complete. The funds have been dispersed to 3 separate exchanges.', timestamp: new Date(), analysis: generateMockAnalysis('0xTornado...') }
      ]
    },
  ]);

  const [currentChatId, setCurrentChatId] = useState<string>('new');
  const [messages, setMessages] = useState<Message[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const validateInput = (text: string) => {
    const ethRegex = /0x[a-fA-F0-9]{40}/;
    const solRegex = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;
    if (ethRegex.test(text)) setDetectedType('Ethereum');
    else if (solRegex.test(text)) setDetectedType('Solana');
    else setDetectedType(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    validateInput(val);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // result is data:image/png;base64,.....
        // We strip the prefix for sending to Gemini API, but keep full result for preview
        const base64Data = result.split(',')[1];
        setAttachment({
          name: file.name,
          type: file.type,
          data: base64Data,
          preview: result 
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = () => setAttachment(null);

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachment) || isThinking) return;

    const userText = input;
    const currentAttachment = attachment;

    setInput('');
    setAttachment(null);
    setDetectedType(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
      timestamp: new Date(),
      attachment: currentAttachment ? {
        name: currentAttachment.name,
        type: currentAttachment.type,
        preview: currentAttachment.preview
      } : undefined
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsThinking(true);

    let activeSessionId = currentChatId;
    let newSessionTitle = '';

    if (currentChatId === 'new') {
       activeSessionId = Date.now().toString();
       const addrMatch = userText.match(ADDRESS_REGEX);
       newSessionTitle = addrMatch ? `Analysis: ${addrMatch[0].slice(0,6)}...` : (userText ? userText.split(' ').slice(0, 4).join(' ') + '...' : 'Image Analysis');
    }

    const detectedAddresses = userText.match(ADDRESS_REGEX);
    let analysisData: AnalysisReport | undefined;

    if (detectedAddresses && detectedAddresses.length > 0) {
       await new Promise(resolve => setTimeout(resolve, 1500));
       analysisData = generateMockAnalysis(detectedAddresses[0]);
    }

    // Call Gemini Service with text history and current attachment
    const responseText = await sendMessageToGemini(
      userText, 
      updatedMessages.map(m => ({ role: m.role, text: m.text })),
      currentAttachment ? { type: currentAttachment.type, data: currentAttachment.data } : undefined,
      selectedModel
    );

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: Role.MODEL,
      text: responseText,
      timestamp: new Date(),
      analysis: analysisData
    };

    const finalMessages = [...updatedMessages, aiMsg];
    setIsThinking(false);
    setMessages(finalMessages);

    setSessions(prev => {
      if (currentChatId === 'new') {
        return [{
          id: activeSessionId,
          title: newSessionTitle,
          lastMessage: aiMsg.text.slice(0, 40) + '...',
          timestamp: new Date(),
          messages: finalMessages
        }, ...prev];
      } else {
        return prev.map(session => session.id === activeSessionId ? {
          ...session,
          lastMessage: aiMsg.text.slice(0, 40) + '...',
          timestamp: new Date(),
          messages: finalMessages
        } : session).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      }
    });

    if (currentChatId === 'new') setCurrentChatId(activeSessionId);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId('new');
    setInput('');
    setAttachment(null);
    setDetectedType(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const activateTool = (toolName: string) => {
    startNewChat();
    let prefix = '';
    switch(toolName) {
      case 'Address Profiler': prefix = "Analyze the risk profile of address: "; break;
      case 'Graph Visualizer': prefix = "Visualize the transaction graph for: "; break;
      case 'Contract Auditor': prefix = "Audit the smart contract at: "; break;
      case 'Fund Tracing': prefix = "Trace the flow of funds starting from: "; break;
      default: prefix = "Analyze: ";
    }
    setInput(prefix);
    validateInput(prefix);
    setTimeout(() => inputRef.current?.focus(), 100);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleClearHistory = () => {
     setSessions([]);
     startNewChat();
  };

  const handleLogout = () => {
    setShowSettings(false);
    setMessages([]);
    setSessions([]);
    setCurrentChatId('new');
    setInput('');
    addToast('You have been logged out safely.', 'success');
  };

  const loadSession = (session: ChatSession) => {
    setCurrentChatId(session.id);
    setMessages(session.messages);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen ${s.bgMain} ${s.textMain} overflow-hidden font-sans relative transition-colors duration-300`}>
      <ToastContainer toasts={toasts} />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onLogout={handleLogout} 
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        addToast={addToast}
        onClearHistory={handleClearHistory}
        language={language}
        setLanguage={setLanguage}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        isDark={isDark}
      />
      
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full opacity-0'
        } ${s.bgMain} border-r ${s.border} transition-all duration-300 ease-in-out flex flex-col fixed md:relative z-20 h-full`}
      >
        <div className="p-4 flex items-center justify-between">
           <div className={`flex items-center gap-2 font-bold text-lg tracking-tight ${s.textMain}`}>
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
               <Zap className="text-white fill-current" size={18} />
             </div>
             Matrix<span className="text-emerald-500">Agent</span>
           </div>
           <button onClick={() => setSidebarOpen(false)} className={`md:hidden p-2 ${s.textSecondary}`}>
             <ChevronLeft size={20} />
           </button>
        </div>

        <div className="px-3 mb-4">
          <button 
            onClick={startNewChat}
            className={`w-full flex items-center gap-3 px-3 py-2.5 ${s.bgSecondary} ${s.hoverBg} border ${s.border} rounded-lg text-sm ${s.textMain} transition-all group`}
          >
            <Plus size={18} className="text-emerald-500 group-hover:text-emerald-400" />
            <span>{t.newChat}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className={`px-2 py-1 text-xs font-semibold ${s.textSecondary} uppercase tracking-wider`}>{t.recentCases}</div>
          {sessions.map(session => (
            <button 
              key={session.id} 
              onClick={() => loadSession(session)}
              className={`w-full text-left px-3 py-2 rounded-lg ${s.hoverBg} text-sm truncate transition-colors ${currentChatId === session.id ? `${s.bgTertiary} ${s.accentText}` : s.textSecondary}`}
            >
              {session.title}
            </button>
          ))}
          
          <div className={`px-2 py-1 mt-6 text-xs font-semibold ${s.textSecondary} uppercase tracking-wider`}>{t.tools}</div>
          {['Address Profiler', 'Graph Visualizer', 'Contract Auditor', 'Fund Tracing'].map(tool => (
             <button 
               key={tool} 
               onClick={() => activateTool(tool)}
               className={`w-full text-left px-3 py-2 rounded-lg ${s.hoverBg} text-sm ${s.textSecondary} hover:${s.accentText} transition-colors`}
             >
              {tool}
            </button>
          ))}
        </div>

        <div className={`p-3 border-t ${s.border} ${s.bgMain}`}>
          <button 
            onClick={() => setShowSettings(true)}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg ${s.hoverBg} text-sm transition-colors group`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              {userProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className={`font-medium ${s.textMain} transition-colors truncate`}>{userProfile.name}</div>
              <div className={`text-xs ${s.textSecondary} transition-colors truncate`}>{userProfile.plan} Plan</div>
            </div>
            <Settings size={16} className={`${s.textSecondary} group-hover:text-emerald-400 transition-colors shrink-0`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        <header className={`h-14 flex items-center justify-between px-4 border-b ${s.border} md:hidden ${s.bgMain} backdrop-blur-md sticky top-0 z-10`}>
          <button onClick={() => setSidebarOpen(true)} className={`p-2 -ml-2 ${s.textSecondary}`}>
            <Menu size={24} />
          </button>
          <span className={`font-semibold ${s.textMain}`}>{t.appTitle}</span>
          <div className="w-8" />
        </header>

        <div className={`absolute top-4 left-4 z-10 hidden md:block transition-all ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
           <button onClick={() => setSidebarOpen(true)} className={`p-2 ${s.bgSecondary} rounded-lg border ${s.border} ${s.textSecondary} hover:${s.textMain}`}>
             <ChevronRight size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${isDark ? 'from-slate-900 to-slate-800' : 'from-slate-100 to-white'} border ${s.border} flex items-center justify-center shadow-2xl shadow-emerald-500/10 mb-4`}>
                  <Bot className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h1 className={`text-3xl md:text-4xl font-bold ${s.textMain} mb-3`}>
                    {t.welcomeTitle} <span className="text-emerald-500">{t.welcomeSubtitle}</span> {t.welcomeSuffix}
                  </h1>
                  <p className={`${s.textSecondary} max-w-md mx-auto`}>
                    {t.welcomeDesc}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {t.suggestions.map((suggestion, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        setInput(suggestion);
                        validateInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className={`p-4 text-left ${s.bgSecondary} ${s.hoverBg} border ${s.border} hover:border-emerald-500/30 rounded-xl transition-all text-sm ${s.textSecondary}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                    
                    {msg.role === Role.MODEL && (
                      <div className="w-8 h-8 rounded-full bg-emerald-900/30 border border-emerald-800 flex items-center justify-center flex-shrink-0 mt-1">
                         <Bot size={16} className="text-emerald-500" />
                      </div>
                    )}
                    
                    <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}>
                      {msg.role === Role.USER ? (
                         <div className={`bg-slate-800 text-slate-100 px-4 py-2.5 rounded-2xl rounded-tr-sm border border-slate-700 flex flex-col gap-2`}>
                           {msg.attachment && (
                             <div className="mb-1">
                               {msg.attachment.type.startsWith('image/') ? (
                                 <img src={msg.attachment.preview} alt="User upload" className="max-h-64 rounded-lg border border-slate-600" />
                               ) : (
                                 <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                                    <FileText size={20} className="text-emerald-400"/>
                                    <span className="text-sm underline">{msg.attachment.name}</span>
                                 </div>
                               )}
                             </div>
                           )}
                           {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
                         </div>
                      ) : (
                        <div className="space-y-2 w-full">
                          <div className={`${s.textMain} leading-relaxed prose prose-invert max-w-none`}>
                             <ReactMarkdown
                               remarkPlugins={[remarkGfm]}
                               rehypePlugins={[rehypeHighlight]}
                               components={{
                                 code: ({node, inline, className, children, ...props}) => {
                                   const match = /language-(\w+)/.exec(className || '');
                                   return !inline ? (
                                     <code className={`${className} block bg-slate-900 rounded-lg p-3 overflow-x-auto text-sm border border-slate-700`} {...props}>
                                       {children}
                                     </code>
                                   ) : (
                                     <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 text-sm font-mono" {...props}>
                                       {children}
                                     </code>
                                   );
                                 },
                                 pre: ({children}) => <pre className="my-2">{children}</pre>,
                                 p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                 ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                 ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                 li: ({children}) => <li className="ml-2">{children}</li>,
                                 a: ({children, href}) => (
                                   <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline">
                                     {children}
                                   </a>
                                 ),
                                 blockquote: ({children}) => (
                                   <blockquote className="border-l-4 border-emerald-500 pl-4 italic my-2 text-slate-400">
                                     {children}
                                   </blockquote>
                                 ),
                                 h1: ({children}) => <h1 className="text-2xl font-bold mb-2 mt-4">{children}</h1>,
                                 h2: ({children}) => <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>,
                                 h3: ({children}) => <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>,
                                 table: ({children}) => (
                                   <div className="overflow-x-auto my-2">
                                     <table className="min-w-full border border-slate-700 rounded-lg">{children}</table>
                                   </div>
                                 ),
                                 thead: ({children}) => <thead className="bg-slate-800">{children}</thead>,
                                 th: ({children}) => <th className="border border-slate-700 px-3 py-2 text-left">{children}</th>,
                                 td: ({children}) => <td className="border border-slate-700 px-3 py-2">{children}</td>,
                               }}
                             >
                               {msg.text}
                             </ReactMarkdown>
                          </div>
                          
                          {msg.analysis && (
                            <AnalysisCard data={msg.analysis} />
                          )}
                        </div>
                      )}
                    </div>

                    {msg.role === Role.USER && (
                      <div className={`w-8 h-8 rounded-full ${s.bgSecondary} flex items-center justify-center flex-shrink-0 mt-1`}>
                        <User size={16} className={s.textSecondary} />
                      </div>
                    )}
                  </div>
                ))}

                {isThinking && (
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-emerald-900/30 border border-emerald-800 flex items-center justify-center flex-shrink-0">
                         <Bot size={16} className="text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-1.5 h-8">
                        <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce"></div>
                      </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className={`p-4 ${s.bgMain}`}>
          <div className="max-w-3xl mx-auto">
            {/* Model Selector */}
            <div className="mb-3 flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value as ModelProvider);
                    addToast(`Switched to ${e.target.value}`, 'success');
                  }}
                  className={`${s.bgSecondary} ${s.border} ${s.textMain} text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer transition-colors hover:border-emerald-500/50`}
                >
                  <option value="deepseek">DeepSeek Chat</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
                <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${s.textSecondary} pointer-events-none`} />
              </div>
              <span className={`text-xs ${s.textSecondary}`}>Model</span>
            </div>

            <div className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 ${isThinking ? 'opacity-0' : ''}`}></div>
              
              {detectedType && !attachment && (
                <div className="absolute top-[-30px] left-2 bg-emerald-900/90 text-emerald-400 text-xs px-2.5 py-1 rounded-t-lg border border-emerald-800/50 flex items-center gap-1.5 shadow-lg backdrop-blur-sm z-10 animate-fade-in">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span className="font-medium">Valid {detectedType} Detected</span>
                </div>
              )}

              <div className={`relative flex flex-col ${s.bgSecondary} border ${detectedType && !attachment ? 'border-emerald-500/50' : s.border} rounded-xl shadow-xl transition-colors duration-300`}>
                
                {/* Attachment Preview Area */}
                {attachment && (
                   <div className={`p-3 border-b ${s.border} flex items-center gap-3 animate-fadeIn`}>
                      <div className="relative group">
                         {attachment.type.startsWith('image/') ? (
                           <img src={attachment.preview} className="h-14 w-14 object-cover rounded-lg border border-slate-700" alt="preview" />
                         ) : (
                           <div className="h-14 w-14 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
                             <FileText className="text-slate-400" />
                           </div>
                         )}
                         <button 
                           onClick={handleRemoveAttachment}
                           className="absolute -top-1.5 -right-1.5 bg-slate-900 border border-slate-600 rounded-full p-0.5 text-slate-400 hover:text-red-400 shadow-sm"
                         >
                           <X size={12} />
                         </button>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className={`text-xs font-medium ${s.textMain} truncate`}>{attachment.name}</div>
                         <div className="text-[10px] text-slate-500 uppercase">{attachment.type.split('/')[1] || 'FILE'}</div>
                      </div>
                   </div>
                )}

                <div className="flex items-end gap-2 p-2">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.txt,.json" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 ${s.textSecondary} hover:text-emerald-500 transition-colors rounded-lg ${s.hoverBg}`}
                    title="Upload image or file"
                  >
                    {attachment ? <ImageIcon size={20} className="text-emerald-500" /> : <Paperclip size={20} />}
                  </button>
                  
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={attachment ? "Describe this file..." : t.inputPlaceholder}
                    className={`flex-1 max-h-48 min-h-[44px] bg-transparent border-none focus:ring-0 ${s.textMain} placeholder-slate-500 resize-none py-2.5 px-2`}
                    rows={1}
                  />
                  
                  <button 
                    onClick={handleSendMessage}
                    disabled={(!input.trim() && !attachment) || isThinking}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      (input.trim() || attachment) && !isThinking
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20' 
                        : `${s.bgTertiary} ${s.textSecondary} cursor-not-allowed`
                    }`}
                  >
                    <Send size={18} className={(input.trim() || attachment) && !isThinking ? 'ml-0.5' : ''} />
                  </button>
                </div>
              </div>
            </div>
            <p className={`text-center text-xs ${s.textSecondary} mt-3`}>
              Matrix Agent can make mistakes. Verify critical on-chain data independently.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}