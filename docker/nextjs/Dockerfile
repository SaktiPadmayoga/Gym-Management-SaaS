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
COPY --from=builder /app/.next ./.next

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start script yang detect environment
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm start; else npm run dev; fi"]