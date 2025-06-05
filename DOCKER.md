
# Docker Deployment Guide

## Quick Start

### Using Docker Hub (Recommended)

```bash
# Pull and run the latest image
docker run -p 3000:80 ghcr.io/yourusername/yourrepo:latest
```

### Using Docker Compose

```bash
# Clone the repository
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo

# Start with Docker Compose
docker-compose up -d

# Access the app at http://localhost:3000
```

### Building Locally

```bash
# Build the image
docker build -t geocoding-app .

# Run the container
docker run -p 3000:80 geocoding-app
```

## Configuration

### Environment Variables

The app can be configured using environment variables:

```bash
docker run -p 3000:80 \
  -e NODE_ENV=production \
  geocoding-app
```

### Custom Port

```bash
# Run on a different port (e.g., 8080)
docker run -p 8080:80 geocoding-app
```

## Production Deployment

### Using GitHub Container Registry

1. **Automatic Builds**: Push to your main branch triggers automatic Docker builds
2. **Pull Latest Image**: 
   ```bash
   docker pull ghcr.io/yourusername/yourrepo:latest
   ```

### Docker Compose for Production

```yaml
version: '3.8'
services:
  geocoding-app:
    image: ghcr.io/yourusername/yourrepo:latest
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

### Health Checks

The container includes health checks:
```bash
# Check container health
docker ps
# Look for "healthy" status
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the host port (`-p 8080:80`)
2. **Permission denied**: Run with `sudo` or add user to docker group
3. **Build fails**: Ensure all dependencies are in package.json

### Logs

```bash
# View container logs
docker logs <container-id>

# Follow logs in real-time
docker logs -f <container-id>
```

### Development

```bash
# Build for development
docker build -t geocoding-app:dev .

# Run with volume mounting for live development
docker run -p 3000:80 -v $(pwd):/app geocoding-app:dev
```

## Security

- Container runs as non-root user
- Security headers configured in Nginx
- No sensitive data in image layers
- Regular security updates via base image updates

## Scaling

For high-traffic deployments:

```bash
# Run multiple instances with load balancer
docker-compose -f docker-compose.prod.yml up --scale geocoding-app=3
```
