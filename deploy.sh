#!/bin/bash

# === 配置项 ===
REMOTE_USER=ubuntu
REMOTE_HOST=140.238.146.139
REMOTE_PATH=/home/ubuntu/ai-finance
SSH_KEY=~/.ssh/id_rsa  # 替换为你的 SSH 私钥路径


# === 打包所需文件（排除 node_modules 等）===
echo "📦 Syncing files to remote server..."
rsync -avz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=*.env \
  .next public package.json package-lock.json next.config.js \
  $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH \
  -e "ssh -i $SSH_KEY"

# === 可选：远程安装依赖并重启服务 ===
echo "🚀 Running post-deploy on server..."
ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST << EOF
  cd $REMOTE_PATH
  npm install --production
  pm2 restart ai-finance
EOF

echo "✅ Deployment completed!"
