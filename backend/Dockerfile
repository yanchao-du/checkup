# Multi-stage Dockerfile for NestJS Backend
# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app




# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Copy scripts directory for mockpass
COPY scripts ./scripts

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Verify build output exists
RUN ls -la /app/dist || (echo "ERROR: dist folder not created!" && exit 1)

# Stage 2: Production stage
FROM node:22-alpine AS production

# Install netcat for health checks
RUN apk add --no-cache netcat-openbsd

# Set working directory
WORKDIR /app

# Copy scripts directory for mockpass
COPY --from=builder /app/scripts ./scripts

# Copy package files for reference
COPY package*.json ./

# Copy production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled application from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy static files (CorpPass certificates)
COPY --from=builder /app/static ./static

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port (matches main.ts default)
EXPOSE 3344

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3344/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Start the application (NestJS builds to dist/src/main.js)
CMD ["node", "dist/src/main.js"]
