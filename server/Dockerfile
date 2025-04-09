# 构建阶段
FROM docker.1ms.run/node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN npm config set registry https://registry.npmmirror.com
RUN pnpm install
COPY . .
RUN pnpm build

# 生产阶段
FROM docker.1ms.run/node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]