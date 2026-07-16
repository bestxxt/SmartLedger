<div align="center">
  <img src="https://umami.40.233.68.217.nip.io/q/CoqnQZG6B" alt="Smart Ledger Logo" width="150" />
  <h1>Smart Ledger</h1>
</div>

[English](README.md)

Smart Ledger 是一款专注于个人财务记录与追踪的现代化 Web 记账应用。它拥有极简复古的视觉设计，并深度集成了 AI 自动解析能力，能够帮助您通过自然语言快速、优雅地记录日常开销。

> [!WARNING]
> **安全风险提示**
> 
> 本项目属于个人探索与开发性质，**强烈建议仅在个人局域网（内网）环境或本地运行使用**。
> 本系统并未经过详尽的渗透测试与专业安全审计，不是一个“牢不可破”的安全系统。请勿将其暴露在公网环境下，也请勿在其中存储极其敏感的金融级密码或密钥。

## 项目结构
- `/frontend`: 前端用户界面 (React SPA)
- `/backend`: 后端 API 服务
- `/legacy`: (备份) 早期单体架构版本代码

## 如何运行

### 后端启动
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
*(后端默认运行在 `http://localhost:4000`)*

### 前端启动
```bash
cd frontend
npm install
npm run dev
```
*(前端默认运行在 `http://localhost:5173`)*
