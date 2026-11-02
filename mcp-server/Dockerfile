FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Set environment and expose port (Render injects PORT at runtime)
ENV NODE_ENV=production
EXPOSE 10000

# Drop root privileges
USER node

# Start MCP server (SSE transport is enabled automatically when PORT is set)
CMD ["node", "index.js"]
