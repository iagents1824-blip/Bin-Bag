# Use the official Rust image as a builder
FROM rust:1.87-slim-bookworm AS builder

# Install dependencies required for building Leptos and compiling Rust
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    gcc \
    musl-tools \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install wasm32 target
RUN rustup target add wasm32-unknown-unknown

# Install cargo-binstall for faster installations
RUN curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash

# Install cargo-leptos
RUN cargo binstall cargo-leptos -y

# Set working directory
WORKDIR /app

# Copy the entire workspace
COPY . .

# Build the application in release mode using cargo-leptos
# This compiles the frontend to WASM and the backend server binary.
RUN cd crates/frontend && cargo leptos build --release -vv

# ------------------------------------------------------------------------------
# Runtime stage
# ------------------------------------------------------------------------------
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the compiled server binary from the builder stage
# (cargo leptos places the binary in target/release or target/server/release depending on config, but normally target/release for the workspace)
COPY --from=builder /app/target/release/bin-bag-frontend /app/bin-bag-frontend

# Copy the generated site assets (WASM, CSS, JS, public files)
COPY --from=builder /app/crates/frontend/target/site /app/site

# Ensure migrations are available if the binary runs them automatically
COPY --from=builder /app/migrations /app/migrations

# Set environment variables for Leptos
ENV LEPTOS_SITE_ROOT="site"
ENV LEPTOS_SITE_ADDR="0.0.0.0:3000"
ENV LEPTOS_ENV="PROD"

# Expose the port the app runs on
EXPOSE 3000

# Run the server
CMD ["/app/bin-bag-frontend"]
