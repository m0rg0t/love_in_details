# syntax=docker/dockerfile:1.7

FROM node:24.18.1-bookworm-slim AS builder

WORKDIR /app
ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci --include=dev --include=optional

COPY . .
RUN npm run build

FROM nginx:1.31.6-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1
