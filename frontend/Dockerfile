# ==============================================
# React + TypeScript Dockerfile
# Production-ready multi-stage build
# ==============================================

FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Development stage
FROM base AS development

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# Build stage
FROM base AS build

COPY . .

RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
