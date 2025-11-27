# ==============================================
# NestJS / Node.js 20 Dockerfile
# Production-ready multi-stage build
# ==============================================

FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main"]
