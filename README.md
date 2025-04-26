# AI Finance

AI Finance 是一个基于 Next.js 的项目，旨在提供与金融相关的服务和功能。项目使用现代 Web 技术构建，支持用户注册、登录、权限管理等功能。

## 项目结构

```
next-env.d.ts
next.config.ts
package.json
postcss.config.mjs
README.md
tsconfig.json
public/
    file.svg
    globe.svg
    next.svg
    vercel.svg
    window.svg
src/
    app/
        favicon.ico
        globals.css
        layout.tsx
        page.tsx
        api/
            account/
                delete_account/
                    route.ts
                login/
                    route.ts
                logout/
                    route.ts
                signup/
                    route.ts
    lib/
        auth.ts
        db.ts
        mongodb.ts
```

### 主要功能

- **用户注册**：通过 `/api/account/signup` 接口注册新用户，支持管理员账户创建。
- **用户登录**：通过 `/api/account/login` 接口登录用户，返回 JWT 并设置 HttpOnly Cookie。
- **用户注销**：通过 `/api/account/logout` 接口清除用户的登录状态。
- **删除用户**：通过 `/api/account/delete_account` 接口删除用户，仅限管理员权限。

### 技术栈

- **前端框架**：Next.js
- **数据库**：MongoDB
- **认证**：基于 JWT 的身份验证
- **样式**：CSS Modules

### 环境变量

在项目根目录下创建 `.env` 文件，并添加以下环境变量：

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_KEY=your_secure_admin_key
```

### 本地开发

1. 克隆项目：
   ```bash
   git clone <repository-url>
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 打开浏览器访问：
   ```
   http://localhost:3000
   ```

### 部署

1. 构建项目：
   ```bash
   npm run build
   ```

2. 启动生产服务器：
   ```bash
   npm start
   ```

### 注意事项

- 确保在生产环境中使用 HTTPS，以保护用户数据。
- 管理员账户的创建需要提供正确的 `ADMIN_KEY`。

### 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

### 许可证

MIT License
