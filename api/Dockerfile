FROM node:20-alpine

WORKDIR /app

# Ensure production mode
ENV NODE_ENV=production

# Install runtime dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy app source
COPY server.js ./

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user and set permissions
RUN addgroup -g 1001 -S nodejs \
  && adduser -S node -u 1001 \
  && chown -R node:node /app
USER node

# Default port used by the app (overridable via PORT env)
EXPOSE 3001

# Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -fsS http://localhost:${PORT:-3001}/health || exit 1

# Start the API
CMD ["node", "server.js"]


