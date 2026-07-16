FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install build tools for native sqlite3 compilation
RUN apk add --no-cache python3 make g++
RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 4000

# Push DB schema and start server
CMD npx prisma db push && npm run start
