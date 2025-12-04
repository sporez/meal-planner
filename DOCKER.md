# Docker Deployment Guide

This application has been containerized and can run anywhere with Docker installed, with zero dependency management.

## Quick Start

```bash
# Build and start the container
docker compose up -d

# View logs
docker compose logs -f

# Stop the container
docker compose down
```

The app will be available at `http://localhost:3000`

## What's Included

### Single Container Architecture
- **Multi-stage build** optimizes image size
- **Frontend**: Built React app served as static files
- **Backend**: Node.js/Express API serving both frontend and API endpoints
- **Database**: SQLite with persistent volume storage
- **Port**: Configured to run on port 3000 (configurable in docker-compose.yml)

### File Structure
- `Dockerfile`: Multi-stage build configuration
- `docker-compose.yml`: Service orchestration and configuration
- `.dockerignore`: Excludes unnecessary files from build context

## Configuration

### Change Port
Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Change 8080 to your desired host port
```

### Database Persistence
The SQLite database is stored in a Docker volume named `meal-data`. This ensures your data persists even if you remove the container.

To backup your data:
```bash
# Find the volume location
docker volume inspect meal-data

# Or backup directly
docker compose exec meal-planner cp /app/data/meal-planner.db /tmp/backup.db
docker compose cp meal-planner:/tmp/backup.db ./backup.db
```

## Advanced Usage

### Build without starting
```bash
docker compose build
```

### View container status
```bash
docker compose ps
```

### Access container shell
```bash
docker compose exec meal-planner sh
```

### Remove everything (including data)
```bash
docker compose down -v  # -v removes volumes too
```

## Production Deployment

### Environment Variables
You can override settings in docker-compose.yml:
```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - DB_PATH=/app/data/meal-planner.db
```

### Health Checks
The container includes health checks that verify the API is responding:
```bash
docker compose ps  # Shows health status
```

### Resource Limits (optional)
Add to docker-compose.yml service:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```

## Deploying Elsewhere

### Export and Import
```bash
# Save image to file
docker save meal-planner:latest | gzip > meal-planner.tar.gz

# Load on another machine
gunzip -c meal-planner.tar.gz | docker load
```

### Cloud Deployment
This container is ready for:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Any Docker-compatible hosting

Just push to a container registry:
```bash
docker tag meal-planner:latest your-registry/meal-planner:latest
docker push your-registry/meal-planner:latest
```

## Troubleshooting

### Container won't start
```bash
docker compose logs meal-planner
```

### Database issues
The database is automatically initialized on first run. If you need to reset:
```bash
docker compose down -v  # This deletes the database!
docker compose up -d
```

### Port already in use
Change the host port in docker-compose.yml (first number in `3000:3000`)

### Rebuild after code changes
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```
