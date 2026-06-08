# Multi-stage build untuk development & production

# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# ==========================================
# Stage 2: Builder (for production build)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Terima build arguments dari docker-compose
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_ROOT_DOMAIN
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_TENANT_DOMAIN

# Jadikan env agar Next.js membacanya saat build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_TENANT_DOMAIN=$NEXT_PUBLIC_TENANT_DOMAIN

# Build aplikasi
RUN npm run build

# ==========================================
# Stage 3: Development & Production Runtime
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Set timezone
ENV TZ=Asia/Jakarta

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy built files (untuk production)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start script yang detect environment
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then node server.js; else npm run dev; fi"]