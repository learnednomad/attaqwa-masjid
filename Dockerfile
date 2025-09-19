# Multi-stage Dockerfile for Hono.js API service
FROM node:22-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat openssl

# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY packages/api/package.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY turbo.json ./

# Install dependencies
RUN npm ci --frozen-lockfile

# Copy source code
COPY packages/api ./packages/api
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db

# Development stage
FROM base AS development

# Install curl for health checks and development dependencies
RUN apk add --no-cache curl
RUN npm install -g nodemon tsx

# Generate Prisma client for development
RUN cd packages/db && npx prisma generate

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=development

# Start development server with hot reload
CMD ["npm", "run", "dev", "--workspace=@attaqwa/api"]

# Build stage
FROM base AS builder

# Set environment
ENV NODE_ENV=production

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build the application
RUN npm run build --workspace=@attaqwa/api

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/api/package.json ./packages/api/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/db/package.json ./packages/db/

# Install production dependencies only
RUN npm ci --omit=dev --frozen-lockfile && npm cache clean --force

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/packages/api/dist ./packages/api/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder --chown=nodejs:nodejs /app/packages/db/node_modules/.prisma ./packages/db/node_modules/.prisma

# Copy environment files
COPY --chown=nodejs:nodejs packages/api/.env.example ./packages/api/.env

# Create logs directory
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "packages/api/dist/index.js"]