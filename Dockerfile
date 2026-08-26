# syntax=docker/dockerfile:1.7
# ============================================================
# admin-web · Vite 6 + React 19 + TS 多阶段镜像
# 构建 context = admin-web 仓库根（源码 + open/ submodule 的 packages workspace）
# 用法:
#   docker build -t ghcr.io/huntercat-digital/admin-web:<tag> .
# ============================================================

# —— Stage 1: build ——
FROM node:22-alpine AS builder
WORKDIR /app

# pnpm 由 corepack 启用，与项目 package.json 的 packageManager 字段对齐
RUN corepack enable

# 先复制 workspace 元数据 + 各包 package.json 最大化依赖层缓存
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc* ./
COPY open/packages/types/package.json open/packages/types/package.json
COPY open/packages/api-client/package.json open/packages/api-client/package.json
COPY open/packages/ui/package.json open/packages/ui/package.json
RUN pnpm config set registry https://registry.npmmirror.com \
    && pnpm install --frozen-lockfile || pnpm install

# 再复制源码并构建（workspace 包直接消费 src，无需预构建）
COPY open/packages ./open/packages
COPY src ./src
COPY index.html public tsconfig*.json vite.config.ts vitest.config.ts eslint.config.js nginx.conf ./

# Vite 编译期变量：构建产物的 API 基础路径
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ARG VITE_EDITION=generic
ENV VITE_EDITION=${VITE_EDITION}

RUN pnpm --filter @lieshoucloud/admin-web build

# —— Stage 2: runtime · nginx serve ——
FROM nginx:1.27-alpine AS runtime

# 去掉 nginx 默认配置，加入我们的 SPA + API 反代配置
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 把构建产物复制到 nginx 静态目录
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx alpine 已经是非 root，我们保留默认行为但显式声明
EXPOSE 80

# 简单的健康检查（更精细的可由 compose 覆盖）
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
