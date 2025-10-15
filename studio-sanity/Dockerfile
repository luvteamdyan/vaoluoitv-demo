# Use Node.js 20 slim as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install serve package globally
RUN npm install -g serve

# Copy built files
COPY dist ./dist
COPY static ./static
COPY package.json ./

# Create non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs sanity

# Change ownership of app directory
RUN chown -R sanity:nodejs /app

# Switch to non-root user
USER sanity

# Expose port
EXPOSE 3333

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3333

# Start the server
CMD ["serve", "-s", "dist", "-l", "3333"]