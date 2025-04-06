#!/bin/bash

# ==============================================
# 自动化部署脚本：上传项目到服务器并用 Docker 直接启动
# ==============================================

SERVER_IP=192.168.5.151
USERNAME=admin
LOCAL_DIR=.
REMOTE_DIR=/vol1/1000/ai-assistant/server  # 服务器目标路径
PASSWORD=h19950101

# ---------------------------
# 检查本地目录是否存在
# ---------------------------
if [ ! -d "$LOCAL_DIR" ]; then
    echo "错误：本地目录 $LOCAL_DIR 不存在！"
    exit 1
fi

# ---------------------------
# 检查 Dockerfile 是否存在
# ---------------------------
if [ ! -f "${LOCAL_DIR}/Dockerfile" ]; then
    echo "错误：${LOCAL_DIR}/Dockerfile 未找到！"
    exit 1
fi

# ---------------------------
# 打包本地项目（排除无关文件）
# ---------------------------
echo "打包项目文件..."
TAR_FILE="/tmp/app_$(date +%Y%m%d%H%M%S).tar.gz"
tar -czvf "$TAR_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='nodemon.json' \
    -C "$LOCAL_DIR" .

# ---------------------------
# 上传到服务器
# ---------------------------
echo "上传到服务器 ${SERVER_IP}..."
sshpass -p "${PASSWORD}" scp -o StrictHostKeyChecking=no "$TAR_FILE" "${USERNAME}@${SERVER_IP}:${TAR_FILE}"

if [ $? -ne 0 ]; then
    echo "错误：文件上传失败！"
    exit 1
fi

# ---------------------------
# 远程执行部署命令
# ---------------------------
echo "在服务器上执行部署..."
sshpass -p "${PASSWORD}" ssh -o StrictHostKeyChecking=no "${USERNAME}@${SERVER_IP}" << EOF
    set -e  # 遇到错误立即退出

     # 确保docker访问权限
    if ! groups | grep -q docker; then
        sudo usermod -aG docker \$USER
        newgrp docker || true
    fi

    # 创建目标目录
    mkdir -p "${REMOTE_DIR}"

    # 解压文件
    echo "解压文件..."
    tar -xzvf "${TAR_FILE}" -C "${REMOTE_DIR}"

    # 进入目录并构建 Docker 镜像
    echo "构建 Docker 镜像..."
    cd "${REMOTE_DIR}"
    
    # 停止并删除旧容器（如果存在）
    if [ \$(docker ps -aq -f name=ai-assistant) ]; then
        docker stop ai-assistant
        docker rm ai-assistant
    fi
    
    # 删除旧镜像（如果存在）
    if [ \$(docker images -q ai-assistant) ]; then
        docker rmi ai-assistant
    fi
    
    # 构建新镜像
    docker build -t ai-assistant .  --add-host=docker.io:114.114.114.114 --network host
    
    # 运行新容器
    echo "启动 Docker 容器..."
    docker run -d \
        --name ai-assistant \
        -p 3000:3000 \
        --restart unless-stopped \
        ai-assistant

    # 清理临时文件
    rm -f "${TAR_FILE}"

    echo "✅ 部署成功！"
EOF

if [ $? -eq 0 ]; then
    echo "访问应用: http://${SERVER_IP}:3000"
else
    echo "❌ 部署过程中出错！"
    exit 1
fi

# 清理本地临时文件
rm -f "$TAR_FILE"