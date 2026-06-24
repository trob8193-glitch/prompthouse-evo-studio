FROM node:22-alpine AS builder

WORKDIR /app

# Install native build dependencies for SQLite / leveldown if needed
RUN apk add --no-cache python3 make g++ 

COPY package*.json ./
RUN npm ci

COPY . .

# Multi-stage build for a smaller production image
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV BRIDGE_PORT=3001

COPY --from=builder /app /app

EXPOSE 3001

CMD ["npm", "run", "start"]
