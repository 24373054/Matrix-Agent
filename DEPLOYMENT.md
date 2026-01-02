# Matrix Agent 部署指南

## 快速开始

### 1. 配置环境变量

确保 `.env.local` 文件包含必要的 API 密钥：

```bash
GEMINI_API_KEY=your_gemini_key
DEEPSEEK_API_KEY=your_deepseek_key
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动应用

```bash
./start.sh
```

### 4. 停止应用

```bash
./stop.sh
```

## 生产环境部署

### 前置要求

- Ubuntu/Debian 或 CentOS/RHEL 服务器
- Root 或 sudo 权限
- 域名 `agent.matrixlab.work` 的 DNS A 记录指向服务器 IP
- 开放端口 80 (HTTP) 和 443 (HTTPS)

### 部署步骤

#### 1. 配置 SSL 证书

运行 SSL 设置脚本（需要 root 权限）：

```bash
sudo ./setup-ssl.sh
```

这个脚本会：
- 安装 certbot（如果未安装）
- 申请 Let's Encrypt SSL 证书
- 配置 Nginx 反向代理
- 设置证书自动续期

#### 2. 启动应用

```bash
./start.sh
```

#### 3. 验证部署

- 本地访问: http://localhost:3119
- 域名访问: https://agent.matrixlab.work

#### 4. 查看日志

```bash
tail -f logs/app.log
```

## 配置说明

### 端口配置

应用运行在端口 **3119**，通过 Nginx 反向代理到 443 端口。

配置文件：`vite.config.ts`

```typescript
server: {
  port: 3119,
  host: '0.0.0.0',
}
```

### Nginx 配置

配置文件：`nginx.conf`

- HTTP (80) 自动重定向到 HTTPS (443)
- SSL/TLS 配置
- WebSocket 支持（用于 HMR）
- 安全头设置

### SSL 证书

证书位置：`/etc/letsencrypt/live/agent.matrixlab.work/`

- `fullchain.pem` - 完整证书链
- `privkey.pem` - 私钥

证书自动续期：每天凌晨 3 点运行

## 脚本说明

### start.sh

启动脚本功能：
- 检查并安装依赖
- 检查环境变量配置
- 清理端口占用
- 后台启动应用
- 保存进程 PID

### stop.sh

停止脚本功能：
- 优雅关闭应用进程
- 清理 PID 文件
- 强制清理端口占用

### setup-ssl.sh

SSL 配置脚本功能：
- 安装 certbot
- 申请 SSL 证书
- 配置 Nginx
- 设置自动续期

## 故障排查

### 端口被占用

```bash
# 查看端口占用
lsof -i:3119

# 手动清理
kill -9 $(lsof -ti:3119)
```

### SSL 证书问题

```bash
# 测试证书续期
sudo certbot renew --dry-run

# 手动续期
sudo certbot renew

# 重新申请证书
sudo certbot certonly --standalone -d agent.matrixlab.work
```

### Nginx 配置测试

```bash
# 测试配置
sudo nginx -t

# 重新加载
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx
```

### 查看应用日志

```bash
# 实时日志
tail -f logs/app.log

# 查看最近 100 行
tail -n 100 logs/app.log

# 查看错误
grep -i error logs/app.log
```

## 维护

### 更新应用

```bash
# 停止应用
./stop.sh

# 拉取最新代码
git pull

# 安装依赖
npm install

# 重新启动
./start.sh
```

### 备份

建议定期备份：
- `.env.local` - 环境变量
- `logs/` - 日志文件
- SSL 证书（如果需要迁移）

## 安全建议

1. **定期更新依赖**
   ```bash
   npm audit
   npm update
   ```

2. **保护 API 密钥**
   - 不要提交 `.env.local` 到版本控制
   - 使用环境变量或密钥管理服务

3. **监控日志**
   - 定期检查访问日志
   - 设置日志轮转避免磁盘占满

4. **防火墙配置**
   ```bash
   # 只开放必要端口
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

## 支持

如有问题，请查看：
- 应用日志: `logs/app.log`
- Nginx 日志: `/var/log/nginx/agent.matrixlab.work.*.log`
- 系统日志: `journalctl -u nginx`
