# ─────────────────────────────────────────────────────────────────────────────
# DRDO DAMS — React Frontend Dockerfile (multi-stage)
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Stage 2: Serve via nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
