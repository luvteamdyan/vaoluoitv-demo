# Smart Redeploy with Portainer API (Optimized)

## Tổng quan

Workflow này được thiết kế để tự động phát hiện thay đổi trong các service, sau đó chỉ redeploy những service có thay đổi thông qua Portainer API, giúp tối ưu hóa thời gian deployment và giảm thiểu downtime.

## Tính năng chính

### 🔍 **Change Detection**
- Tự động phát hiện thay đổi trong từng service dựa trên file paths
- Chỉ redeploy những service có thay đổi thực sự
- Hỗ trợ manual trigger với options linh hoạt

### 🚀 **Optimized Redeployment**
- **Pull latest image** trước khi recreate container
- **Individual container recreation** thay vì recreate toàn bộ stack
- **Minimal downtime** - chỉ ảnh hưởng đến service có thay đổi
- **Zero impact** trên các service khác

### 🛠️ **Portainer API Integration**
- Sử dụng Portainer API để quản lý containers
- Pull image mới nhất từ Docker Hub
- Recreate container với configuration giữ nguyên
- Health check và status monitoring

## Cấu trúc Workflow

### 1. **detect-changes** Job
```yaml
- Phát hiện thay đổi trong các service
- Xác định services cần redeploy
- Set action type (auto_redeploy, force_redeploy, manual_redeploy, skip_redeploy)
```

### 2. **skip-redeploy** Job (Conditional)
```yaml
- Chạy khi không có service nào thay đổi
- Hiển thị thông báo skip deployment
```

### 3. **redeploy-with-portainer** Job (Conditional)
```yaml
- Chạy khi có services cần redeploy
- Thực hiện optimized redeployment
```

## Services được hỗ trợ

| Service | Container Pattern | Image Name |
|---------|------------------|------------|
| api_gateway | api_gateway-prod | devlee21/api_gateway |
| secure_api_service | secure_api_service-prod | devlee21/secure_api_service |
| upload_service | upload_service-prod | devlee21/upload_service |
| crawler_worker_service | crawler_worker_service-prod | devlee21/crawler_worker_service |
| game_service | game_service-prod | devlee21/game_service |
| admin_dashboard | admin_dashboard-prod | devlee21/admin-dashboard |
| studio_sanity | studio_sanity-prod | devlee21/studio_sanity |
| minigames_fe | minigames_fe-prod | devlee21/minigames_fe |
| nextjs | nextjs-prod | devlee21/nextjs |

## Triggers

### 1. **Automatic Trigger**
```yaml
on:
  push:
    branches:
      - 'release/**'
```
- Tự động chạy khi push code lên branch `release/**`
- Chỉ redeploy services có thay đổi

### 2. **Manual Trigger**
```yaml
on:
  workflow_dispatch:
    inputs:
      force_redeploy: boolean
      specific_services: string
```

**Options:**
- `force_redeploy: true` - Redeploy tất cả services
- `specific_services: "api_gateway,upload_service"` - Redeploy services cụ thể

## Quy trình Redeployment

### Bước 1: Change Detection
```bash
# Sử dụng dorny/paths-filter để detect changes
- api_gateway: 'api_gateway/**'
- upload_service: 'upload_service/**'
# ... các service khác
```

### Bước 2: Portainer API Connection
```bash
# Test connection
GET /api/endpoints/{endpointId}
# Get containers list
GET /api/endpoints/{endpointId}/docker/containers/json?all=true
```

### Bước 3: Individual Service Redeployment
```bash
# Cho mỗi service có thay đổi:

# 1. Pull latest image
POST /api/endpoints/{endpointId}/docker/images/create?fromImage={imageName}:latest

# 2. Get container details
GET /api/endpoints/{endpointId}/docker/containers/{containerId}/json

# 3. Stop container
POST /api/endpoints/{endpointId}/docker/containers/{containerId}/stop?t=30

# 4. Remove container
DELETE /api/endpoints/{endpointId}/docker/containers/{containerId}?v=true

# 5. Create new container with latest image
POST /api/endpoints/{endpointId}/docker/containers/create

# 6. Start new container
POST /api/endpoints/{endpointId}/docker/containers/{newContainerId}/start
```

## Environment Variables Required

```yaml
secrets:
  PORTAINER_URL: "https://your-portainer-instance.com"
  PORTAINER_API_KEY: "your-portainer-api-key"
  PORTAINER_ENDPOINT_ID: "your-endpoint-id"
```

## Lợi ích so với workflow cũ

### ✅ **Tối ưu hóa**
- **Targeted deployment**: Chỉ redeploy services có thay đổi
- **Minimal downtime**: Không ảnh hưởng đến services khác
- **Faster execution**: Không cần recreate toàn bộ stack
- **Resource efficient**: Tiết kiệm tài nguyên server

### ✅ **Reliability**
- **Individual container management**: Mỗi service được xử lý riêng biệt
- **Error isolation**: Lỗi ở một service không ảnh hưởng service khác
- **Rollback capability**: Dễ dàng rollback từng service
- **Health monitoring**: Kiểm tra status sau khi deploy

### ✅ **Flexibility**
- **Manual control**: Có thể chọn services cụ thể để redeploy
- **Force deploy**: Có thể force redeploy tất cả services
- **Skip capability**: Tự động skip khi không có thay đổi
- **Detailed logging**: Log chi tiết cho từng bước

## Monitoring và Logging

### GitHub Actions Summary
- **Change Detection Results**: Hiển thị services nào có thay đổi
- **Redeploy Results**: Kết quả redeployment cho từng service
- **Container Status**: Status cuối cùng của containers
- **Error Details**: Chi tiết lỗi nếu có

### Portainer Dashboard
- **Container Status**: Theo dõi real-time trong Portainer UI
- **Image Versions**: Kiểm tra image versions đang chạy
- **Resource Usage**: Monitor CPU/Memory usage
- **Logs**: Xem logs của từng container

## Troubleshooting

### Common Issues

#### 1. **Container Not Found**
```bash
# Check container pattern mapping
# Verify container names in docker-compose.yml
# Check if container is running
```

#### 2. **Image Pull Failed**
```bash
# Check Docker Hub connectivity
# Verify image name and tag
# Check authentication if using private registry
```

#### 3. **Portainer API Connection Failed**
```bash
# Verify PORTAINER_URL
# Check PORTAINER_API_KEY
# Verify PORTAINER_ENDPOINT_ID
# Check network connectivity
```

#### 4. **Container Start Failed**
```bash
# Check container configuration
# Verify environment variables
# Check port conflicts
# Review container logs
```

## Best Practices

### 1. **Testing**
- Test workflow trong staging environment trước
- Verify container configurations
- Test rollback procedures

### 2. **Monitoring**
- Monitor deployment logs
- Set up alerts for failed deployments
- Track deployment frequency and success rate

### 3. **Security**
- Use secure API keys
- Limit API key permissions
- Monitor API usage

### 4. **Backup**
- Backup container configurations
- Document manual deployment procedures
- Keep rollback images available

## Migration từ Workflow Cũ

### Bước 1: Backup
```bash
# Backup current workflow files
cp .github/workflows/auto-deploy-portainer.yml .github/workflows/auto-deploy-portainer.yml.backup
```

### Bước 2: Test
```bash
# Test new workflow với specific services
# Sử dụng manual trigger với specific_services
```

### Bước 3: Deploy
```bash
# Thay thế workflow cũ
# Monitor first few deployments
# Verify all services working correctly
```

## Support

Nếu gặp vấn đề với workflow, hãy:
1. Check GitHub Actions logs
2. Verify Portainer API connectivity
3. Review container configurations
4. Check Docker Hub image availability

---

**Lưu ý**: Workflow này được thiết kế để tối ưu hóa deployment process và giảm thiểu downtime. Hãy test kỹ trong môi trường staging trước khi sử dụng trong production.
