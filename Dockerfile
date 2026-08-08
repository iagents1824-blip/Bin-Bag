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
FROM nginx:alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration to handle SPA routing (fallback to index.html)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
