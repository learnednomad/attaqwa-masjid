# Docker Configuration for Attaqwa Masjid Digital Ecosystem

This directory contains Docker configurations for the complete Islamic community platform.

## 🏗️ Architecture Overview

The Docker setup includes:
- **PostgreSQL**: Primary database with Islamic content schema
- **Redis**: Session storage and caching
- **API**: Hono.js backend with JWT authentication
- **Web**: Next.js frontend with Islamic design
- **Nginx**: Reverse proxy with SSL termination
- **Monitoring**: Grafana, Prometheus, Loki stack (production)

## 🚀 Quick Start

### Development Environment

```bash
# Clone the repository
git clone https://github.com/learnednomad/attaqwa-masjid.git
cd attaqwa-masjid

# Copy environment variables
cp .env.example .env

# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f web api
```

**Development URLs:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Database Admin: http://localhost:8080 (Adminer)
- Email Testing: http://localhost:8025 (Mailhog)

### Production Environment

```bash
# Copy and configure production environment
cp .env.example .env
# Edit .env with production values

# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check service health
docker-compose ps
```

**Production URLs:**
- Application: https://your-domain.com
- Admin Dashboard: https://your-domain.com/admin
- Monitoring: http://localhost:3300 (Grafana)
- Metrics: http://localhost:9090 (Prometheus)

## 📋 Services

### Core Services

#### PostgreSQL Database
- **Image**: postgres:14-alpine
- **Port**: 5432
- **Volume**: postgres_data
- **Features**: Optimized for Islamic content, automatic backups

#### Redis Cache
- **Image**: redis:7-alpine
- **Port**: 6379
- **Volume**: redis_data
- **Features**: Session storage, API caching, rate limiting

#### API Backend (Hono.js)
- **Build**: packages/api/Dockerfile
- **Port**: 3001
- **Features**: JWT auth, Islamic APIs, rate limiting
- **Health Check**: `/api/health`

#### Web Frontend (Next.js)
- **Build**: packages/web/Dockerfile
- **Port**: 3000
- **Features**: Islamic UI, prayer times, admin dashboard
- **Health Check**: `/api/health`

### Production Services

#### Nginx Reverse Proxy
- **Image**: nginx:alpine
- **Ports**: 80, 443
- **Features**: SSL termination, rate limiting, security headers
- **Config**: docker/nginx/

#### Monitoring Stack
- **Grafana**: Dashboards and visualization
- **Prometheus**: Metrics collection
- **Loki**: Log aggregation
- **Promtail**: Log shipping

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
POSTGRES_DB=attaqwa_db
POSTGRES_USER=attaqwa_user
POSTGRES_PASSWORD=secure_password

# Authentication
JWT_SECRET=your-jwt-secret-key

# URLs
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com

# Features
NEXT_PUBLIC_ENABLE_EDUCATION_MODULE=true
NEXT_PUBLIC_DEFAULT_CITY="Your City"
```

### Docker Compose Files

- **docker-compose.yml**: Base configuration
- **docker-compose.dev.yml**: Development overrides
- **docker-compose.prod.yml**: Production configuration

### Nginx Configuration

- **nginx.conf**: Main configuration
- **conf.d/production.conf**: SSL and production settings
- **ssl/**: SSL certificates directory

## 🔒 Security

### Production Security Features

- **SSL/TLS**: Automatic HTTPS redirect
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Rate Limiting**: API and authentication endpoints
- **CORS**: Restricted to allowed origins
- **IP Filtering**: Optional admin IP whitelist

### Secrets Management

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Generate secure database password
openssl rand -base64 24
```

## 📊 Monitoring

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# View specific service health
docker inspect --format='{{.State.Health.Status}}' attaqwa-api
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api web

# Follow logs with timestamps
docker-compose logs -f -t api
```

### Metrics

Production monitoring includes:
- **Application metrics**: Response times, error rates
- **System metrics**: CPU, memory, disk usage
- **Islamic features**: Prayer time requests, user engagement
- **Security metrics**: Failed login attempts, rate limit hits

## 🚀 Deployment

### Local Development

```bash
# Start development environment
make dev

# Stop development environment
make dev-down

# View logs
make logs

# Clean up
make clean
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale web=3 --scale api=2
```

### SSL Certificate Setup

```bash
# Create SSL directory
mkdir -p docker/ssl

# Copy your SSL certificates
cp fullchain.pem docker/ssl/
cp privkey.pem docker/ssl/
cp chain.pem docker/ssl/

# Or use Let's Encrypt
certbot certonly --webroot -w ./docker/ssl -d your-domain.com
```

## 🔧 Maintenance

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U attaqwa_user attaqwa_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U attaqwa_user attaqwa_db < backup.sql
```

### Log Rotation

```bash
# Configure log rotation in production
cat > /etc/logrotate.d/docker-attaqwa << EOF
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    postrotate
        docker kill --signal=USR1 $(docker ps -q)
    endscript
}
EOF
```

### Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild custom images
docker-compose build --no-cache

# Update with zero downtime
docker-compose up -d --no-deps --build api
docker-compose up -d --no-deps --build web
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U attaqwa_user

# View database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### API Issues
```bash
# Check API health
curl http://localhost:3001/api/health

# View API logs
docker-compose logs api

# Restart API service
docker-compose restart api
```

#### SSL Certificate Issues
```bash
# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Verify certificate
openssl x509 -in docker/ssl/fullchain.pem -text -noout
```

### Performance Optimization

#### Database Performance
```bash
# Monitor database connections
docker-compose exec postgres psql -U attaqwa_user -d attaqwa_db -c "SELECT * FROM pg_stat_activity;"

# Analyze slow queries
docker-compose exec postgres psql -U attaqwa_user -d attaqwa_db -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

#### Memory Usage
```bash
# Monitor container memory usage
docker stats

# Limit container memory
# Add to docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 512M
```

## 📞 Support

For Docker-related issues:

1. Check service logs: `docker-compose logs [service]`
2. Verify configuration: `docker-compose config`
3. Test connectivity: `docker-compose exec [service] ping [target]`
4. Review [troubleshooting guide](../README.md#troubleshooting)

## 🤲 Islamic Considerations

The Docker configuration supports Islamic features:
- **Prayer Times**: Cached appropriately with timezone support
- **Arabic Content**: Proper font rendering and RTL support
- **Islamic Calendar**: Efficient date calculations and caching
- **Community Features**: Optimized for Muslim community usage patterns

---

**بارك الله فيك (Barakallahu feek) - May Allah bless you**