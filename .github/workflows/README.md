# GitHub Actions Workflows

## Auto Deploy with Portainer API

Workflow tự động detect changes, build Docker images và deploy services thông qua Portainer API.

### Tính năng chính

- ✅ **Smart Change Detection**: Chỉ build và deploy services có thay đổi
- ✅ **Parallel Builds**: Build nhiều services song song để tăng tốc độ
- ✅ **Portainer API Integration**: Sử dụng Portainer API để redeploy services
- ✅ **Zero Downtime**: Không ảnh hưởng đến services khác đang chạy
- ✅ **Health Checks**: Kiểm tra sức khỏe services sau khi deploy
- ✅ **Manual Triggers**: Hỗ trợ deploy thủ công với options linh hoạt
- ✅ **Rollback Support**: Có thể rollback nếu deployment thất bại

### Trigger Events

#### Automatic Triggers
- **Push to main**: Deploy tất cả services có thay đổi
- **Push to develop**: Deploy tất cả services có thay đổi  
- **Push to release/***: Deploy tất cả services có thay đổi
- **Push to feature/***: Deploy tất cả services có thay đổi

#### Manual Triggers
- **Force Deploy All**: Deploy tất cả services (bỏ qua change detection)
- **Deploy Specific Services**: Chỉ deploy services được chỉ định

### Services được hỗ trợ

| Service | Docker Image | Container Name | Port | Health Check |
|---------|--------------|----------------|------|--------------|
| api_gateway | devlee21/api_gateway | api_gateway | 3000 | ✅ |
| secure_api_service | devlee21/secure_api_service | secure_api_service | 3001 | ✅ |
| upload_service | devlee21/upload_service | upload_service | 3002 | ✅ |
| crawler_worker_service | devlee21/crawler_worker_service | crawler_worker_service | 3004 | ✅ |
| game_service | devlee21/game_service | game_service | 3009 | ✅ |
| admin-dashboard | devlee21/admin-dashboard | admin_dashboard | 3006 | ✅ |
| studio-sanity | devlee21/studio_sanity | studio_sanity | 3333 | ❌ |
| minigames_fe | devlee21/minigames_fe | minigames_fe | 3007 | ❌ |
| nextjs | devlee21/nextjs | nextjs | 3008 | ❌ |

### Cách sử dụng

#### 1. Automatic Deployment
```bash
# Push code lên branch được hỗ trợ
git push origin main
# Workflow sẽ tự động detect changes và deploy
```

#### 2. Manual Deployment - Force Deploy All
1. Vào GitHub Actions tab
2. Chọn workflow "Auto Deploy with Portainer API"
3. Click "Run workflow"
4. Chọn branch
5. Check "Force deploy all services"
6. Click "Run workflow"

#### 3. Manual Deployment - Specific Services
1. Vào GitHub Actions tab
2. Chọn workflow "Auto Deploy with Portainer API"
3. Click "Run workflow"
4. Chọn branch
5. Nhập services cần deploy (comma-separated): `api_gateway,upload_service`
6. Click "Run workflow"

### Required Secrets

Đảm bảo các secrets sau được cấu hình trong GitHub repository:

```bash
# Docker Hub
DOCKER_USERNAME=devlee21
DOCKER_PASSWORD=your_dockerhub_password

# Portainer API
PORTAINER_URL=https://portainer.vaoluoitv.com
PORTAINER_API_KEY=your_portainer_api_key
PORTAINER_ENDPOINT_ID=your_endpoint_id
```

### Workflow Steps

#### 1. Detect Changes
- Sử dụng `dorny/paths-filter` để detect changes
- So sánh với commit trước đó
- Tạo matrix cho build và deploy

#### 2. Build and Push
- Build Docker images song song (max 3 parallel)
- Push lên Docker Hub với tags:
  - `latest`
  - `{branch}-{sha}`
  - `{branch}`

#### 3. Deploy with Portainer API
- Lấy danh sách containers từ Portainer
- Pull latest images
- Stop containers gracefully (30s timeout)
- Remove containers
- Docker Compose tự động recreate containers
- Wait for containers to be healthy

#### 4. Health Checks
- Kiểm tra health endpoints của services
- Retry mechanism (5 lần, mỗi lần cách 10s)
- Báo cáo kết quả health check

### Monitoring và Debugging

#### GitHub Actions Summary
Workflow tạo summary với thông tin:
- Services được detect changes
- Build results
- Deployment results
- Health check results

#### Logs
- Chi tiết từng bước trong workflow
- Error messages nếu có lỗi
- Container states và health status

### Troubleshooting

#### Common Issues

1. **Container not found**
   - Kiểm tra container name trong docker-compose.yml
   - Đảm bảo container đang chạy

2. **Image pull failed**
   - Kiểm tra Docker Hub credentials
   - Đảm bảo image đã được push thành công

3. **Health check failed**
   - Kiểm tra health endpoint URLs
   - Đảm bảo services đang chạy đúng port

4. **Portainer API errors**
   - Kiểm tra API key và endpoint ID
   - Đảm bảo Portainer service đang chạy

#### Debug Commands

```bash
# Check container status
docker ps -a | grep {service_name}

# Check container logs
docker logs {container_name}

# Check Portainer API
curl -H "X-API-Key: {api_key}" \
  {portainer_url}/api/endpoints/{endpoint_id}/docker/containers/json
```

### Best Practices

1. **Test trên feature branch trước khi merge**
2. **Monitor deployment logs**
3. **Verify health checks sau deployment**
4. **Keep Docker images optimized**
5. **Regular cleanup of old images**

### Security Considerations

- API keys được lưu trong GitHub Secrets
- Chỉ deploy từ trusted branches
- Health checks đảm bảo services hoạt động đúng
- Graceful shutdown để tránh data loss

### Performance Optimization

- Parallel builds (max 3 concurrent)
- Docker layer caching
- Multi-architecture builds (amd64, arm64)
- Efficient change detection
- Minimal container downtime
