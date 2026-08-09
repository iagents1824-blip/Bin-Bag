# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY crates/frontend/package.json crates/frontend/package-lock.json ./
RUN npm ci

# Copy source files
COPY crates/frontend/ .

# Build the app
RUN npm run build

# Serve stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY crates/frontend/package.json crates/frontend/package-lock.json ./
RUN npm ci --omit=dev

# Copy the built React assets
COPY --from=builder /app/dist /app/dist

# Copy backend files
COPY crates/frontend/server.cjs ./
COPY crates/frontend/agent.cjs ./

# Start the Express backend (which runs the agent and serves the app)
CMD ["node", "server.cjs"]
