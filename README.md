# Smart Ledger 👋
Smart Ledger is a **self-hosted, LLM-powered, multi-input personal expense tracking system** designed for privacy-conscious users who want intelligent automation without sacrificing data ownership.

## Key Features
- 🛡️ **Self-hosted** 
Deploy Smart Ledger on your own server or machine. Your financial data remains **fully under your control**  — no third-party storage, no data tracking. Seamlessly **sync across devices**  to keep your records accessible and consistent.

- 🎙️ **Voice Input** 
Record spoken expense entries. Powered by **Whisper**  for speech recognition and integrated with an **LLM**  for context understanding, Smart Ledger can convert your voice into clean, structured financial transactions with ease.

- 📷 **Picture Input** 
Snap photos of receipts or bills. Smart Ledger uses **multi-LLM models** to automatically extract key financial details like amount, date, and category — no manual typing required.

- 💻 **Beautiful User Interface** 
Enjoy a modern, mobile-friendly UI built with **Next.js**. Designed for simplicity and speed. 

<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <img src="imgs/HomePage.png" alt="HomePage.png" height="400">
  <img src="imgs/Card.png" alt="Card.png" height="400">
  <img src="imgs/Setting.png" alt="Setting.png" height="400">
</div>
<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <img src="imgs/EditPage.png" alt="EditPage.png" height="400">
  <img src="imgs/Voice.png" alt="Voice.png" height="400">
  <img src="imgs/Picture.png" alt="Picture.png" height="400">
</div>

- 🖥️ **Installable Fullscreen App** 
Can be added to your home screen and run in **fullscreen like a native app**  on iOS/macOS — no need to go through the App Store. Just open in Safari and "Add to Home Screen."

- 💱 **Multi-Currency Support** 
Automatically detects and converts multiple currencies from input (voice, image, or text) — perfect for international usage or travel expense tracking.
 

- 🏷️ **Tagging & Categorization** 
Add your own custom tags or let the AI suggest and infer tags based on transaction content. Smart Ledger helps keep your records organized effortlessly.

- 🔒 **Full Privacy & Control** 
All components are **open-source and self-manageable** . No vendor lock-in, no hidden data sharing — just transparent software that puts you in charge.

## How to Install 🚀


## 🚧 Development Progress 


> Current Version: `v0.1.0` (Alpha)

### ✅ Core Features
- [x] User login
- [x] User logout
- [x] User authentication and multi-device sync (JWT + MongoDB)
- [x] Admin account management
- [x] User registration
- [ ] iPhone shortcut support
- [ ] Google login
- [ ] WeChat login
- [ ] Multi-user account support
- [ ] Offline mode (local caching)
- [ ] Export to Excel / CSV
- [ ] Calendar and reminder integration


### 🎨 User Interface 
- [x] Homepage with expense list
- [x] Voice / Camera / Text input modes
- [x] Transaction edit & delete cards
- [x] Settings page (language, currency, tag management...)
- [x] Spending trend visualization
- [x] Installable fullscreen Web App (PWA-style experience)
- [ ] Transaction search and filters (in progress)

### 🧠 AI Features
- [x] Voice input via Whisper
- [x] Receipt image recognition (LLM-based parsing)
- [x] Auto-categorization and tag suggestions via LLM
- [x] Multi-currency detection and handling

### Deploy
- [ ] Docker support




## 📄 License 

Smart Ledger is open-source and released under the [MIT License]() .


```text
MIT License

Copyright (c) 2025 [Terry Xie]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.
```


## 技术栈

### 前端
- **框架**: Next.js 15.3.1
- **UI 库**: 
  - Radix UI
  - Tailwind CSS
  - Framer Motion
- **状态管理**: React Hooks
- **类型检查**: TypeScript

### 后端
- **API**: Next.js API Routes
- **数据库**: MongoDB
- **认证**: JWT (JSON Web Tokens)
- **AI 集成**: 
  - Google Gemini AI（智能分析）
  - 语音识别服务
  - OCR 服务

### 开发工具
- **包管理**: npm
- **代码规范**: ESLint
- **版本控制**: Git

## 环境变量

在项目根目录下创建 `.env` 文件，并添加以下环境变量：

```env
# 数据库配置
MONGODB_URI=your_mongodb_connection_string

# 认证配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_KEY=your_secure_admin_key

# AI 配置
GOOGLE_AI_API_KEY=your_google_ai_api_key

# 语音服务配置
SPEECH_TO_TEXT_API_KEY=your_speech_to_text_api_key

# OCR 服务配置
OCR_API_KEY=your_ocr_api_key

# 其他配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 开发指南

### 本地开发

1. 克隆项目：
   ```bash
   git clone <repository-url>
   cd ai-finance
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入必要的配置
   ```

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

5. 访问开发环境：
   ```
   http://localhost:3000
   ```

### 构建和部署

1. 构建项目：
   ```bash
   npm run build
   ```

2. 启动生产服务器：
   ```bash
   npm start
   ```

### 测试

运行测试：
```bash
npm test
```

## 使用示例

### 语音记账
1. 点击语音输入按钮
2. 说出消费内容，例如："今天在星巴克买了一杯拿铁，花了35元"
3. AI 自动识别并生成账单：
   - 类别：餐饮
   - 金额：35元
   - 描述：星巴克拿铁
   - 时间：自动记录

### 图片记账
1. 上传消费小票或发票图片
2. AI 自动识别图片内容
3. 生成标准账单信息

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 项目维护

### 代码规范
- 使用 TypeScript 进行开发
- 遵循 ESLint 规则
- 使用 Prettier 进行代码格式化

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式修改
- refactor: 代码重构
- test: 测试用例修改
- chore: 其他修改

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至 [项目维护者邮箱]
