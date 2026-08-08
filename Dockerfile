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

# Install express for serving static files
RUN npm install express

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /app/dist

# Create a simple express server to serve the static files and handle SPA routing
RUN echo "const express = require('express'); \
const path = require('path'); \
const app = express(); \
app.use(express.static(path.join(__dirname, 'dist'))); \
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html'))); \
const port = process.env.PORT || 8080; \
app.listen(port, '0.0.0.0', () => console.log('Server is running on port ' + port));" > server.js

CMD ["node", "server.js"]
