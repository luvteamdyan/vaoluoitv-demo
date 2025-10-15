# API Gateway Docker Deployment

## 🐳 Docker Image Information

- **Image Name**: `devlee21/api-gateway:latest`
- **Base Image**: `node:20-alpine`
- **Architecture**: linux/amd64 (optimized for Ubuntu 24.04 VPS)
- **Port**: 3000
- **Production Domain**: `api.vaoluoitv.com`

## 🚀 Quick Start

### Development
```bash
cd ../nextjs
docker-compose up vaoluoi-api-gateway
```

### Production
```bash
cd ../nextjs
docker-compose -f docker-compose.prod.yml up vaoluoi-api-gateway
```

## 🔧 Build and Push

### Build and Push to Docker Hub
```bash
./build-docker.sh
```

### Local Build Only
```bash
docker build -t devlee21/api-gateway:latest .
```

## 📋 Environment Variables

**Important**: Environment variables are NOT hardcoded in the Docker image. They must be passed at runtime via docker-compose or docker run commands.

### Required Environment Variables

The following environment variables should be configured in your docker-compose or deployment:

- `NODE_ENV=production`
- `PORT=3000`
- `MONGODB_URI=mongodb://localhost:27017/vaoluoi`
- `REDIS_URL=redis://localhost:6379`
- `JWT_SECRET=your-jwt-secret-key`
- `RECAPTCHA_SECRET_KEY=your-recaptcha-secret`
- `CORS_ORIGIN=https://vaoluoitv.net,https://admin.vaoluoitv.net`

### Example docker run with environment variables:
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e MONGODB_URI=mongodb://mongo:27017/vaoluoi \
  -e REDIS_URL=redis://redis:6379 \
  -e JWT_SECRET=your-jwt-secret-key \
  -e RECAPTCHA_SECRET_KEY=your-recaptcha-secret \
  -e CORS_ORIGIN=https://vaoluoitv.net,https://admin.vaoluoitv.net \
  devlee21/api-gateway:latest
```

## 🏗️ Docker Configuration

### Security Features
- Non-root user (nestjs:nodejs)
- dumb-init for proper signal handling
- Multi-stage build for minimal attack surface
- Alpine Linux base for smaller footprint

### Health Check
- HTTP check on port 3000
- Interval: 30s
- Timeout: 10s
- Retries: 3
- Start period: 40s

### Resource Limits
- **Development**: 1GB RAM, 1 CPU
- **Production**: 2GB RAM, 2 CPU

## 🌐 Network Configuration

### Development
- Port: `3000:3000`
- Networks: `vaoluoi-network`, `luck8_luck8-network`

### Production
- Domain: `api.vaoluoitv.com`
- SSL/TLS with Let's Encrypt
- Traefik reverse proxy

## 🔍 Troubleshooting

### Environment Variables Not Working
If environment variables are not being recognized:
1. Ensure variables are passed via docker-compose or docker run
2. Check that all required environment variables are properly set
3. Verify container logs: `docker logs vaoluoi-api-gateway`

### Build Issues
1. Ensure Docker Buildx is available
2. Check internet connection for package downloads
3. Verify Dockerfile syntax
4. Make sure you're on linux/amd64 platform

### Runtime Issues
1. Check container logs: `docker logs vaoluoi-api-gateway`
2. Verify port 3000 is not in use
3. Check network connectivity
4. Verify environment variables are set correctly
5. Check MongoDB and Redis connectivity

### Health Check Issues
1. Verify the `/health` endpoint is accessible
2. Check if the application is running properly
3. Ensure port 3000 is exposed and accessible

## 📁 File Structure

```
api_gateway/
├── Dockerfile              # Multi-stage Docker build (optimized for linux/amd64)
├── .dockerignore           # Docker build context exclusions
├── build-docker.sh         # Build and push script for linux/amd64
├── package.json            # NestJS application dependencies
└── DOCKER_README.md        # This file
```

## 🔄 Update Process

1. Make code changes
2. Run build script: `./build-docker.sh`
3. Update docker-compose files if needed
4. Deploy: `docker-compose up -d vaoluoi-api-gateway`

## 📊 Monitoring

- Health check endpoint: `http://localhost:3000/health`
- API documentation: `http://localhost:3000/api`
- Container status: `docker ps`
- Resource usage: `docker stats vaoluoi-api-gateway`
- Environment variables: Check container environment with `docker exec -it <container> env`

## 🔧 Development

### Local Development with Docker
```bash
# Build and run locally
docker build -t api-gateway-local .
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e MONGODB_URI=mongodb://localhost:27017/vaoluoi \
  -e REDIS_URL=redis://localhost:6379 \
  api-gateway-local
```

### Debugging
```bash
# Access container shell
docker exec -it <container-name> sh

# View logs
docker logs -f <container-name>

# Check environment variables
docker exec -it <container-name> env
```
