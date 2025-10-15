#!/bin/bash

# Build and push script for admin-dashboard Docker image
# Optimized for Ubuntu 24.04 VPS with linux/amd64

set -e

# Configuration
IMAGE_NAME="devlee21/admin-dashboard"
TAG="latest"
DOCKERFILE_PATH="."
PLATFORM="linux/amd64"

echo "🚀 Building Docker image for admin-dashboard..."
echo "📦 Image: ${IMAGE_NAME}:${TAG}"
echo "🏗️  Platform: ${PLATFORM}"

# Create buildx builder if it doesn't exist
if ! docker buildx ls | grep -q "admin-builder"; then
    echo "🔧 Creating buildx builder..."
    docker buildx create --name admin-builder --use
fi

# Build the image
echo "🏗️  Building image..."
docker buildx build \
    --platform ${PLATFORM} \
    -t ${IMAGE_NAME}:${TAG} \
    --load \
    ${DOCKERFILE_PATH}

echo "✅ Docker image built successfully!"
echo "📦 Image: ${IMAGE_NAME}:${TAG}"
echo "🏗️  Platform: ${PLATFORM}"

# Push to Docker Hub
echo "📤 Pushing image to Docker Hub..."
docker push ${IMAGE_NAME}:${TAG}

echo "🎉 Build and push process completed!"
echo ""
echo "📦 Image: ${IMAGE_NAME}:${TAG}"
echo "🏗️  Platform: ${PLATFORM}"
echo ""
echo "To run the container locally:"
echo "  docker run -p 8386:8386 ${IMAGE_NAME}:${TAG}"
echo ""
echo "To use with docker-compose:"
echo "  cd ../nextjs && docker-compose up vaoluoi-admin-dashboard"
echo ""
echo "To deploy to production:"
echo "  cd ../nextjs && docker-compose -f docker-compose.prod.yml up vaoluoi-admin-dashboard"
echo ""
echo "Environment variables should be passed via docker-compose or docker run:"
echo "  - NEXT_PUBLIC_BACKEND_URL"
echo "  - NEXT_PUBLIC_MATCH_URL"
echo "  - NEXT_PUBLIC_STREAM_KEY_URL"
echo "  - NEXT_PUBLIC_UPLOAD_URL"
echo "  - NEXT_PUBLIC_ADS_CONFIG_URL"
