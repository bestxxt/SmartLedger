# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# We accept build arguments to set Vite env vars
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG COMMIT_HASH
ENV VITE_APP_VERSION=$COMMIT_HASH

RUN npm run build

# Serve stage using Caddy
FROM caddy:2-alpine

# Copy the built assets from builder
COPY --from=builder /app/dist /srv

# Copy our Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443
