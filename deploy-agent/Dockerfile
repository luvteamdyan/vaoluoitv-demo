FROM node:18-alpine

# Install docker CLI
RUN apk add --no-cache docker-cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application files
COPY . .

# Create non-root user with docker group access
RUN addgroup -g 1001 -S nodejs
RUN adduser -S deploy-agent -u 1001
# Create docker group (use system-assigned GID to avoid conflicts)
RUN addgroup -S docker || true
RUN adduser deploy-agent docker
USER deploy-agent

# Expose port
EXPOSE 5555

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5555/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]
