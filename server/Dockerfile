# 构建阶段
FROM docker.1ms.run/node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY pnpm-lock.yaml ./
COPY .env.local ./
COPY .env ./
COPY .env.docker ./
RUN npm install -g pnpm
RUN npm config set registry https://registry.npmmirror.com
RUN pnpm install
COPY . .
RUN pnpm build

# 生产阶段
FROM docker.1ms.run/node:18-slim
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends
ENV NODE_ENV=docker 
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.docker ./.env.docker
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/.env.local ./.env.local
EXPOSE 3000
CMD ["node", "dist/server.js"]
