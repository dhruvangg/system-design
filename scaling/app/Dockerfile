# ── Stage 1: install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package.json ./
RUN npm install --omit=dev

# ── Stage 2: production image ───────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Non-root user for security best-practice
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY server.js ./

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
