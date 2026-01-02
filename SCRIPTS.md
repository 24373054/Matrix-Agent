# 脚本使用说明

## 生产环境脚本

### start.sh - 生产构建和部署
```bash
sudo ./start.sh
```

**功能：**
- 安装依赖（如果需要）
- 构建生产版本（优化和压缩）
- 更新 Nginx 配置
- 重新加载 Nginx
- 静态文件直接由 Nginx 提供

**特点：**
- ✅ 最佳性能
- ✅ 自动压缩和缓存
- ✅ 无需后台进程
- ✅ 适合生产环境

### stop.sh - 生产环境信息
```bash
./stop.sh
```

显示生产环境信息（静态文件由 Nginx 直接提供，无需停止）

---

## 开发环境脚本

### start-dev.sh - 启动开发服务器
```bash
./start-dev.sh
```

**功能：**
- 启动 Vite 开发服务器
- 支持热模块替换（HMR）
- 实时代码更新
- 后台运行

**特点：**
- ✅ 快速开发
- ✅ 实时预览
- ✅ 源码调试
- ✅ 适合开发环境

### stop-dev.sh - 停止开发服务器
```bash
./stop-dev.sh
```

停止开发服务器进程

---

## 部署脚本

### deploy.sh - 一键部署
```bash
sudo ./deploy.sh
```

**功能：**
- 检查环境配置
- 安装依赖
- 配置 SSL 证书（可选）
- 构建和部署应用

**适用场景：** 首次部署或完整重新部署

### setup-ssl.sh - SSL 证书配置
```bash
sudo ./setup-ssl.sh
```

**功能：**
- 安装 certbot
- 申请 Let's Encrypt 证书
- 配置 Nginx
- 设置自动续期

**适用场景：** 首次配置 SSL 或证书更新

---

## 监控脚本

### status.sh - 状态检查
```bash
./status.sh
```

**显示信息：**
- 应用运行状态
- 端口占用情况
- Nginx 状态
- SSL 证书信息
- 日志文件信息

---

## 使用场景

### 场景 1: 首次部署
```bash
# 1. 配置环境变量
vim .env.local

# 2. 一键部署
sudo ./deploy.sh
```

### 场景 2: 代码更新（生产）
```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建部署
sudo ./start.sh
```

### 场景 3: 本地开发
```bash
# 1. 启动开发服务器
./start-dev.sh

# 2. 开发完成后停止
./stop-dev.sh
```

### 场景 4: 检查状态
```bash
./status.sh
```

---

## 文件结构

```
matrix-agent/
├── start.sh          # 生产构建和部署
├── stop.sh           # 生产环境信息
├── start-dev.sh      # 开发服务器启动
├── stop-dev.sh       # 开发服务器停止
├── deploy.sh         # 一键部署
├── setup-ssl.sh      # SSL 配置
├── status.sh         # 状态检查
├── nginx.conf        # Nginx 配置
├── dist/             # 生产构建输出（自动生成）
└── logs/             # 日志目录
    ├── app.log       # 应用日志
    └── app.pid       # 进程 ID（开发模式）
```

---

## 注意事项

1. **权限要求**
   - `start.sh` 需要 sudo（更新 Nginx）
   - `deploy.sh` 需要 sudo（SSL 和 Nginx）
   - `setup-ssl.sh` 需要 sudo（系统配置）

2. **端口使用**
   - 开发模式：3119（Vite 开发服务器）
   - 生产模式：80/443（Nginx）

3. **构建输出**
   - 生产构建输出到 `dist/` 目录
   - 该目录已在 `.gitignore` 中

4. **日志位置**
   - 应用日志：`logs/app.log`（开发模式）
   - Nginx 日志：`/var/log/nginx/agent.matrixlab.work.*.log`

5. **环境变量**
   - `.env.local` 不会被提交到 Git
   - 部署时需要手动配置
