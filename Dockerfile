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

# Install the 'serve' package globally
RUN npm install -g serve

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /app/dist

# Serve the static files
# The 'serve' package automatically listens on process.env.PORT if available
CMD ["serve", "-s", "dist"]
