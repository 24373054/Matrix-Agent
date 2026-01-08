# Matrix Agent - Blockchain Forensics AI

## 项目概述

Matrix Agent 是一个专业的区块链取证 AI 智能体，专注于链上风险评估、交易追踪和智能合约审计。该项目提供了一个现代化的 Web 界面，集成了多个 AI 模型，用于分析区块链地址、追踪资金流向、识别安全风险。

**在线访问：** https://agent.matrixlab.work  
**GitHub 仓库：** https://github.com/24373054/Matrix-Agent

---

## 核心功能

### 1. 多模型 AI 支持
- **DeepSeek Chat**（默认）- 高性能对话模型
- **Gemini 1.5 Flash** - 快速响应模型
- **Gemini 1.5 Pro** - 高质量分析模型
- 支持实时模型切换
- 模型选择持久化存储

### 2. 区块链地址分析
- **自动识别地址类型**
  - Ethereum 地址（0x...）
  - Solana 地址（Base58）
- **风险评分系统**（0-100）
  - Safe（安全）
  - Caution（警告）
  - High Risk（高风险）
  - Critical（严重）

### 3. 交易图谱可视化
- **节点类型识别**
  - Wallet（钱包）
  - Contract（合约）
  - Mixer（混币器）
  - Exchange（交易所）
- **资金流向追踪**
  - 交易金额和代币类型
  - 多层级关系展示
  - 风险节点高亮
- **交互式 SVG 图表**

### 4. 资金流分析
- **完整的攻击链追踪**
  - Lure（诱饵阶段）
  - Auth（授权阶段）
  - Theft（盗窃阶段）
  - Cleanup（清理阶段）
  - Split（分散阶段）
  - Mix（混淆阶段）
  - Collect（汇集阶段）
- **时间线展示**
- **关键地址标注**

### 5. 智能合约审计
- 合约地址验证
- 漏洞检测
- 风险评估
- 安全建议

### 6. Markdown 渲染支持
- **完整的 Markdown 语法**
  - 代码块（带语法高亮）
  - 行内代码
  - 表格
  - 列表（有序/无序）
  - 链接
  - 引用块
  - 标题（H1-H6）
  - 粗体/斜体
- **GitHub Flavored Markdown (GFM)**
- **代码高亮**（highlight.js）

### 7. 多语言支持
- **English**（英语）
- **中文**（简体中文）
- **日本語**（日语）
- UI 和 AI 响应同步切换
- 语言设置持久化

### 8. 主题系统
- **Light Mode**（浅色模式）
- **Dark Mode**（深色模式）
- **System**（跟随系统）
- 平滑过渡动画
- 主题设置持久化

### 9. 文件上传功能
- **支持的文件类型**
  - 图片（image/*）
  - PDF 文档
  - 文本文件（.txt）
  - JSON 数据
- **图片预览**
- **多模态分析**（图片+文本）

### 10. 会话管理
- **多会话支持**
- **历史记录保存**
- **会话标题自动生成**
- **快速切换会话**
- **新建调查**

---

## 技术架构

### 前端技术栈
```
- React 19.2.3
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS（内联样式）
- Lucide React（图标库）
- React Markdown（Markdown 渲染）
- Remark GFM（GitHub Flavored Markdown）
- Rehype Highlight（代码高亮）
```

### AI 集成
```
- Google Gemini AI (@google/genai)
- DeepSeek API（OpenAI 兼容接口）
- 多模型切换架构
- 流式响应支持
```

### 后端架构
```
- Nginx（反向代理 + 静态文件服务）
- Let's Encrypt（SSL/TLS 证书）
- 生产级构建优化
- Gzip 压缩
- 静态资源缓存
```

---

## 项目结构

```
matrix-agent/
├── App.tsx                      # 主应用组件
├── index.tsx                    # 应用入口
├── index.html                   # HTML 模板
├── types.ts                     # TypeScript 类型定义
├── markdown.css                 # Markdown 样式
├── components/
│   └── AnalysisCard.tsx        # 分析报告卡片组件
├── services/
│   └── gemini.ts               # AI 服务层（多模型支持）
├── dist/                        # 生产构建输出
├── logs/                        # 应用日志
├── nginx.conf                   # Nginx 配置
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 依赖管理
├── .env.local                  # 环境变量（不提交）
├── .gitignore                  # Git 忽略规则
├── start.sh                    # 生产构建脚本
├── stop.sh                     # 生产环境信息
├── start-dev.sh                # 开发服务器启动
├── stop-dev.sh                 # 开发服务器停止
├── deploy.sh                   # 一键部署脚本
├── setup-ssl.sh                # SSL 证书配置
├── status.sh                   # 状态检查脚本
├── README.md                   # 项目说明
├── DEPLOYMENT.md               # 部署文档
└── SCRIPTS.md                  # 脚本使用说明
```

---

## 核心数据结构

### AnalysisReport（分析报告）
```typescript
interface AnalysisReport {
  address: string;              // 目标地址
  riskScore: number;            // 风险评分 0-100
  riskLevel: string;            // 风险等级
  labels: string[];             // 标签列表
  entity?: string;              // 实体名称
  volume24h: string;            // 24小时交易量
  
  executiveSummary: string;     // 执行摘要
  attackerProfile: {            // 攻击者画像
    identity: string;
    location: string;
    fingerprints: string[];
  };
  fundsFlow: FundsFlowStep[];   // 资金流向
  keyAddresses: KeyAddress[];   // 关键地址
  graphData: {                  // 图谱数据
    nodes: GraphNode[];
    links: GraphLink[];
  };
  recentTransactions: [];       // 最近交易
}
```

### Message（消息）
```typescript
interface Message {
  id: string;
  role: Role;                   // USER | MODEL
  text: string;
  timestamp: Date;
  analysis?: AnalysisReport;    // 分析报告
  attachment?: {                // 附件
    name: string;
    type: string;
    preview: string;
  };
}
```

---

## 部署架构

### 生产环境
```
用户浏览器
    ↓ HTTPS (443)
Nginx (反向代理)
    ↓
静态文件服务 (dist/)
    ↓
AI API 调用
    ├─→ DeepSeek API
    └─→ Google Gemini API
```

### 开发环境
```
用户浏览器
    ↓ HTTP (3119)
Vite Dev Server
    ↓ HMR (WebSocket)
React Hot Reload
    ↓
AI API 调用
    ├─→ DeepSeek API
    └─→ Google Gemini API
```

---

## 安全特性

### 1. SSL/TLS 加密
- Let's Encrypt 免费证书
- 自动续期配置
- HTTPS 强制重定向
- HSTS 安全头

### 2. 安全响应头
```nginx
Strict-Transport-Security: max-age=31536000
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

### 3. API 密钥保护
- 环境变量存储
- 不提交到版本控制
- 服务端调用（避免暴露）

---

## 性能优化

### 1. 构建优化
- **代码分割**
  - react-vendor chunk（React 核心库）
  - markdown chunk（Markdown 相关库）
  - 主应用 chunk
- **压缩优化**
  - esbuild 压缩
  - Gzip 压缩（Nginx）
- **Tree Shaking**（移除未使用代码）

### 2. 缓存策略
```nginx
# 静态资源缓存 1 年
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 加载优化
- 懒加载组件
- 图片预览优化
- 按需加载 Markdown 渲染器

### 4. 构建产物
```
dist/index.html                  2.80 kB
dist/assets/index.css            2.40 kB
dist/assets/react-vendor.js     11.79 kB
dist/assets/markdown.js        335.24 kB
dist/assets/index.js           520.04 kB
```

---

## 使用场景

### 场景 1: 地址风险评估
```
用户输入: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
系统响应:
- 自动识别为 Ethereum 地址
- 生成风险评分
- 显示标签和实体信息
- 展示交易图谱
- 提供安全建议
```

### 场景 2: 资金追踪
```
用户输入: "追踪最新跨链桥黑客资金"
系统响应:
- 分析攻击链路
- 展示资金流向时间线
- 标注关键地址
- 识别混币器和交易所
- 生成调查报告
```

### 场景 3: 智能合约审计
```
用户输入: "审计 USDT 合约风险"
系统响应:
- 合约地址验证
- 代码安全分析
- 漏洞检测
- 风险等级评估
- 修复建议
```

### 场景 4: 图片分析
```
用户操作: 上传交易截图
系统响应:
- OCR 识别地址
- 提取交易信息
- 风险分析
- 生成报告
```

---

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Ubuntu/Debian 服务器（生产环境）
- 域名和 DNS 配置

### 本地开发
```bash
# 1. 克隆项目
git clone git@github.com:24373054/Matrix-Agent.git
cd Matrix-Agent/matrix-agent

# 2. 安装依赖
npm install

# 3. 配置环境变量
cat > .env.local << EOF
GEMINI_API_KEY=your_gemini_key
DEEPSEEK_API_KEY=your_deepseek_key
EOF

# 4. 启动开发服务器
./start-dev.sh

# 5. 访问应用
# http://localhost:3119
```

### 生产部署
```bash
# 1. 配置 SSL 证书
sudo ./setup-ssl.sh

# 2. 构建和部署
sudo ./start.sh

# 3. 访问应用
# https://agent.matrixlab.work
```

### 状态检查
```bash
./status.sh
```

---

## 脚本说明

### 生产环境
| 脚本 | 功能 | 权限 |
|------|------|------|
| `start.sh` | 构建生产版本并部署 | sudo |
| `stop.sh` | 显示生产环境信息 | 普通 |

### 开发环境
| 脚本 | 功能 | 权限 |
|------|------|------|
| `start-dev.sh` | 启动开发服务器 | 普通 |
| `stop-dev.sh` | 停止开发服务器 | 普通 |

### 部署工具
| 脚本 | 功能 | 权限 |
|------|------|------|
| `deploy.sh` | 一键部署（首次） | sudo |
| `setup-ssl.sh` | 配置 SSL 证书 | sudo |
| `status.sh` | 检查运行状态 | 普通 |

---

## 配置文件

### .env.local（环境变量）
```bash
GEMINI_API_KEY=your_gemini_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### vite.config.ts（构建配置）
```typescript
{
  server: {
    port: 3119,
    host: '0.0.0.0',
    allowedHosts: ['agent.matrixlab.work']
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {...}
      }
    }
  }
}
```

### nginx.conf（Web 服务器配置）
```nginx
server {
    listen 443 ssl http2;
    server_name agent.matrixlab.work;
    
    ssl_certificate /etc/letsencrypt/live/agent.matrixlab.work/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agent.matrixlab.work/privkey.pem;
    
    root /home/ubuntu/yz/Web3/MatrixAgent/matrix-agent/dist;
    index index.html;
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## API 集成

### DeepSeek API
```typescript
const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [...],
    temperature: 0.7
  })
});
```

### Google Gemini API
```typescript
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const chat = ai.chats.create({
  model: 'gemini-1.5-flash',
  config: {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.7
  }
});
const result = await chat.sendMessage({ message });
```

---

## 关键特性实现

### 1. 地址自动识别
```typescript
const ADDRESS_REGEX = /(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})/g;

const validateInput = (text: string) => {
  const ethRegex = /0x[a-fA-F0-9]{40}/;
  const solRegex = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;
  if (ethRegex.test(text)) setDetectedType('Ethereum');
  else if (solRegex.test(text)) setDetectedType('Solana');
};
```

### 2. 模型切换
```typescript
const [selectedModel, setSelectedModel] = useState<ModelProvider>('deepseek');

// 持久化存储
useEffect(() => {
  localStorage.setItem('matrix_model', selectedModel);
}, [selectedModel]);

// 调用 AI
const responseText = await sendMessageToGemini(
  message,
  history,
  attachment,
  selectedModel  // 传入选中的模型
);
```

### 3. Markdown 渲染
```typescript
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  components={{
    code: ({inline, className, children}) => {...},
    a: ({href, children}) => {...},
    table: ({children}) => {...}
  }}
>
  {msg.text}
</ReactMarkdown>
```

### 4. 文件上传处理
```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    const base64Data = result.split(',')[1];
    setAttachment({
      name: file.name,
      type: file.type,
      data: base64Data,
      preview: result
    });
  };
  reader.readAsDataURL(file);
};
```

### 5. 主题切换
```typescript
const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const isDark = themeMode === 'system' ? isSystemDark : themeMode === 'dark';

// 动态样式
const s = getThemeStyles(isDark);
```

---

## 监控和日志

### 应用日志
```bash
# 实时查看日志（开发模式）
tail -f logs/app.log

# 查看最近 100 行
tail -n 100 logs/app.log

# 搜索错误
grep -i error logs/app.log
```

### Nginx 日志
```bash
# 访问日志
tail -f /var/log/nginx/agent.matrixlab.work.access.log

# 错误日志
tail -f /var/log/nginx/agent.matrixlab.work.error.log
```

### 状态检查输出
```bash
$ ./status.sh

🔍 Matrix Agent Status Check
============================

✅ Application: RUNNING (PID: 409568)
   CPU Usage: 1.2%
   Memory Usage: 1.6%
   Uptime: 00:17

✅ Port 3119: IN USE (PID: 409583)

✅ Nginx: RUNNING
   Config: INSTALLED

✅ SSL Certificate: INSTALLED
   Expires: Apr  2 13:46:46 2026 GMT

📋 Log File: logs/app.log
   Size: 4.0K
   Lines: 10
```

---

## 故障排查

### 问题 1: 端口被占用
```bash
# 查看端口占用
lsof -i:3119

# 清理端口
./stop-dev.sh
```

### 问题 2: SSL 证书过期
```bash
# 手动续期
sudo certbot renew

# 重新加载 Nginx
sudo systemctl reload nginx
```

### 问题 3: 构建失败
```bash
# 清理缓存
rm -rf node_modules dist
npm install
sudo ./start.sh
```

### 问题 4: API 调用失败
```bash
# 检查环境变量
cat .env.local

# 检查 API Key 是否有效
# 查看浏览器控制台错误信息
```

---

## 未来规划

### 短期目标
- [ ] 添加更多区块链网络支持（BSC, Polygon, Arbitrum）
- [ ] 集成真实的链上数据 API（Etherscan, Chainalysis）
- [ ] 增强交易图谱可视化（3D 图表）
- [ ] 添加 PDF 报告导出功能
- [ ] 实现用户认证系统

### 中期目标
- [ ] 支持批量地址分析
- [ ] 添加实时监控和告警
- [ ] 集成更多 AI 模型（Claude, GPT-4）
- [ ] 开发移动端应用
- [ ] 添加 API 接口供第三方调用

### 长期目标
- [ ] 构建区块链威胁情报数据库
- [ ] 开发自动化调查工作流
- [ ] 集成机器学习风险预测模型
- [ ] 支持跨链资金追踪
- [ ] 建立社区贡献的威胁标签系统

---

## 贡献指南

### 开发流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 React Hooks 最佳实践
- 组件使用函数式编程
- 添加必要的注释和文档

---

## 许可证

MIT License

---

## 联系方式

- **项目主页**: https://github.com/24373054/Matrix-Agent
- **在线演示**: https://agent.matrixlab.work
- **问题反馈**: GitHub Issues

---

## 致谢

### 技术栈
- React Team - 优秀的前端框架
- Vite Team - 快速的构建工具
- Google - Gemini AI API
- DeepSeek - 高性能 AI 模型
- Lucide - 精美的图标库

### 灵感来源
- Chainalysis - 区块链分析平台
- Elliptic - 加密货币合规解决方案
- TRM Labs - 区块链情报平台

---

## 更新日志

### v1.0.0 (2026-01-02)
- ✅ 初始版本发布
- ✅ 多模型 AI 支持（DeepSeek, Gemini）
- ✅ 区块链地址分析
- ✅ 交易图谱可视化
- ✅ Markdown 渲染
- ✅ 多语言支持（EN/ZH/JA）
- ✅ 主题切换（Light/Dark）
- ✅ 文件上传功能
- ✅ 生产级部署
- ✅ SSL/HTTPS 配置
- ✅ 完整的部署脚本

---

**Built with ❤️ for Blockchain Security**
