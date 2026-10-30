FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Set environment and expose port
ENV NODE_ENV=production
EXPOSE 10000

# Start server
CMD ["npm", "start"]
