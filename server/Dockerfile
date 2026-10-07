# Lightweight production Dockerfile for Splix Server (Railway, Koyeb, Docker)
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies with production caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY src ./src
COPY api ./api

ENV NODE_ENV=production
ENV PORT=4000

# Run as non-privileged node user for security
USER node

EXPOSE 4000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["node", "src/server.js"]
