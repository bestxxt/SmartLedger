FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 4000

# Push DB schema and start server
CMD npx prisma db push && npm run start
