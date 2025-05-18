#!/bin/bash

# 定义远程服务器信息
REMOTE_HOST="root@swlws.site"
REMOTE_PATH="/root/swlws/chat"
REMOTE_WEB_PATH="/var/www/chat"

# 确保远程目录存在
ssh $REMOTE_HOST "mkdir -p $REMOTE_PATH"
ssh $REMOTE_HOST "rm -rf $REMOTE_WEB_PATH && mkdir -p $REMOTE_WEB_PATH"

# 同步文件到远程服务器
echo "正在同步文件到远程服务器..."
rsync -avz --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'deploy.sh' \
    ./ $REMOTE_HOST:$REMOTE_PATH/

# 在远程服务器上执行部署
echo "正在远程服务器上执行部署..."
ssh $REMOTE_HOST "cd $REMOTE_PATH && \
    # 移动文件到web目录
    mv ./html/* $REMOTE_WEB_PATH/ && \
    
    # 安装依赖
    npm install && \
    
    # 确保PM2已全局安装
    if ! command -v pm2 &> /dev/null; then
        echo '正在安装PM2...'
        npm install -g pm2
    fi && \
    
    # 停止已存在的实例（如果有）
    pm2 stop websocket-chat 2>/dev/null || true && \
    pm2 delete websocket-chat 2>/dev/null || true && \
    
    # 使用PM2启动应用
    pm2 start ecosystem.config.js && \
    
    # 保存PM2进程列表
    pm2 save && \
    
    # 显示运行状态
    pm2 status"

echo "部署完成！"