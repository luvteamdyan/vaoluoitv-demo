# Admin Dashboard Docker Deployment

## 🐳 Docker Image Information

- **Image Name**: `devlee21/admin-dashboard:latest`
- **Base Image**: `node:20-alpine`
- **Architecture**: linux/amd64 (optimized for Ubuntu 24.04 VPS)
- **Port**: 8386
- **Production Domain**: `admin.vaoluoitv.net`

## 🚀 Quick Start

### Development
```bash
cd ../nextjs
docker-compose up vaoluoi-admin-dashboard
```

### Production
```bash
cd ../nextjs
docker-compose -f docker-compose.prod.yml up vaoluoi-admin-dashboard
```

## 🔧 Build and Push

### Build and Push to Docker Hub
```bash
./build-multiarch.sh
```

### Local Build Only
```bash
docker build -t devlee21/admin-dashboard:latest .
```

## 📋 Environment Variables

**Important**: Environment variables are NOT hardcoded in the Docker image. They must be passed at runtime via docker-compose or docker run commands.

### Required Environment Variables

The following environment variables should be configured in your docker-compose or deployment:

- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`
- `NEXT_PUBLIC_BACKEND_URL=https://api.vaoluoitv.com/api/v1`
- `NEXT_PUBLIC_MATCH_URL=https://api.vaoluoitv.com/api/v1`
- `NEXT_PUBLIC_STREAM_KEY_URL=https://api.vaoluoitv.com/api/v1`
- `NEXT_PUBLIC_UPLOAD_URL=https://api.vaoluoitv.com/api/v1`
- `NEXT_PUBLIC_ADS_CONFIG_URL=https://api.vaoluoitv.com/api/v1`

### Example docker run with environment variables:
```bash
docker run -p 8386:8386 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_BACKEND_URL=https://api.vaoluoitv.com/api/v1 \
  -e NEXT_PUBLIC_MATCH_URL=https://api.vaoluoitv.com/api/v1 \
  -e NEXT_PUBLIC_STREAM_KEY_URL=https://api.vaoluoitv.com/api/v1 \
  -e NEXT_PUBLIC_UPLOAD_URL=https://api.vaoluoitv.com/api/v1 \
  -e NEXT_PUBLIC_ADS_CONFIG_URL=https://api.vaoluoitv.com/api/v1 \
  devlee21/admin-dashboard:latest
```

## 🏗️ Docker Configuration

### Security Features
- Non-root user (nextjs:nodejs)
- dumb-init for proper signal handling
- Multi-stage build for minimal attack surface
- Alpine Linux base for smaller footprint

### Health Check
- HTTP check on port 8386
- Interval: 30s
- Timeout: 10s
- Retries: 3
- Start period: 40s

### Resource Limits
- **Development**: 512MB RAM, 0.5 CPU
- **Production**: 1GB RAM, 1 CPU

## 🌐 Network Configuration

### Development
- Port: `8386:8386`
- Networks: `vaoluoi-network`, `luck8_luck8-network`

### Production
- Domain: `admin.vaoluoitv.net`
- SSL/TLS with Let's Encrypt
- Traefik reverse proxy

## 🔍 Troubleshooting

### Environment Variables Not Working
If environment variables are not being recognized:
1. Ensure variables are passed via docker-compose or docker run
2. Check that NEXT_PUBLIC_* variables are properly set
3. Verify container logs: `docker logs vaoluoi-admin-dashboard`

### Build Issues
1. Ensure Docker Buildx is available
2. Check internet connection for package downloads
3. Verify Dockerfile syntax
4. Make sure you're on linux/amd64 platform

### Runtime Issues
1. Check container logs: `docker logs vaoluoi-admin-dashboard`
2. Verify port 8386 is not in use
3. Check network connectivity
4. Verify environment variables are set correctly

## 📁 File Structure

```
admin-dashboard/
├── Dockerfile              # Multi-stage Docker build (optimized for linux/amd64)
├── .dockerignore           # Docker build context exclusions
├── next.config.ts          # Next.js configuration with standalone output
├── build-multiarch.sh      # Build and push script for linux/amd64
└── DOCKER_README.md        # This file
```

## 🔄 Update Process

1. Make code changes
2. Run build script: `./build-multiarch.sh`
3. Update docker-compose files if needed
4. Deploy: `docker-compose up -d vaoluoi-admin-dashboard`

## 📊 Monitoring

- Health check endpoint: `http://localhost:8386/`
- Container status: `docker ps`
- Resource usage: `docker stats vaoluoi-admin-dashboard`
- Environment variables: Check container environment with `docker exec -it <container> env`
