# 🚀 Coolify Deployment Guide for Masjid At-Taqwa Platform

This guide provides comprehensive instructions for deploying the Masjid At-Taqwa Islamic community platform to Coolify.

## 📋 Prerequisites

1. **Coolify Instance**: Coolify v4+ installed and running
2. **Domain**: A domain name configured for your application
3. **Database**: PostgreSQL database (can be provisioned through Coolify)
4. **Redis**: Redis cache instance (can be provisioned through Coolify)

## 🎯 Quick Deploy

### Step 1: Create New Project in Coolify

1. Log into your Coolify dashboard
2. Click "New Project" 
3. Select "Docker" as the deployment type
4. Choose your server/destination

### Step 2: Configure Git Repository

1. Add your Git repository URL:
   ```
   https://github.com/your-username/attaqwa-masjid.git
   ```

2. Set the branch to deploy (e.g., `main` or `production`)

3. Configure build settings:
   - **Dockerfile Path**: `Dockerfile.coolify`
   - **Build Context**: `.`
   - **Port Mapping**: `3000,3001`

### Step 3: Environment Variables

Add these required environment variables in Coolify:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@postgres:5432/attaqwa

# Security
JWT_SECRET=your-secure-jwt-secret-min-32-chars
NEXTAUTH_SECRET=your-secure-nextauth-secret

# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# Islamic Services APIs
PRAYER_TIMES_API_KEY=your-aladhan-api-key
ISLAMIC_FINDER_API_KEY=your-islamic-finder-key
QURAN_API_KEY=your-quran-api-key

# Redis Cache
REDIS_URL=redis://redis:6379

# Optional: Monitoring
GRAFANA_API_KEY=your-grafana-key
ENABLE_MONITORING=true

# Features
ENABLE_ARABIC_CONTENT=true
ENABLE_PRAYER_NOTIFICATIONS=true
ENABLE_FAMILY_ACCOUNTS=true
ENABLE_RAMADAN_MODE=auto

# Database Migrations
RUN_MIGRATIONS=true
```

### Step 4: Database Setup

#### Option A: Use Coolify Database Service

1. In Coolify, add a new service: PostgreSQL
2. Configure:
   ```
   Database Name: attaqwa
   Username: attaqwa
   Password: [secure-password]
   ```
3. Note the internal connection string

#### Option B: External Database

Use your existing PostgreSQL instance and update `DATABASE_URL`

### Step 5: Redis Cache Setup

#### Option A: Use Coolify Redis Service

1. Add Redis service in Coolify
2. Use default configuration
3. Note the internal connection URL

#### Option B: External Redis

Update `REDIS_URL` with your Redis instance

### Step 6: Deploy

1. Click "Deploy" in Coolify
2. Monitor the build logs
3. Wait for health checks to pass

## 🔧 Advanced Configuration

### Custom Domain Setup

1. In Coolify, go to Settings → Domains
2. Add your domains:
   ```
   Web: attaqwa.yourdomain.com
   API: api.attaqwa.yourdomain.com
   ```
3. Configure SSL (automatic with Let's Encrypt)

### Proxy Configuration

For the unified Dockerfile with both services:

```nginx
# Web application (port 3000)
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# API service (port 3001)
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
}
```

### Health Checks

The application includes built-in health checks:
- Web: `http://localhost:3000/api/health`
- API: `http://localhost:3001/health`

Configure in Coolify:
```yaml
health_check:
  test: curl -f http://localhost:3000/api/health && curl -f http://localhost:3001/health
  interval: 30s
  timeout: 10s
  retries: 3
```

### Resource Limits

Recommended settings for production:

```yaml
resources:
  limits:
    cpus: '2'
    memory: 2G
  reservations:
    cpus: '0.5'
    memory: 512M
```

### Scaling for Ramadan

During Ramadan, increase resources:

```yaml
resources:
  limits:
    cpus: '4'
    memory: 4G
  reservations:
    cpus: '1'
    memory: 1G
```

## 🕌 Islamic Features Configuration

### Prayer Times Fallback System

The platform includes a 5-layer fallback system. Configure priority:

```env
# Primary API
PRAYER_TIMES_PRIMARY=aladhan

# Fallback order
PRAYER_TIMES_FALLBACK_1=islamic_finder
PRAYER_TIMES_FALLBACK_2=local_calculation
PRAYER_TIMES_FALLBACK_3=manual_override
PRAYER_TIMES_FALLBACK_4=offline_cache
```

### Arabic Content Optimization

Enable RTL and Arabic optimization:

```env
ENABLE_ARABIC_CONTENT=true
ARABIC_FONT_CDN=https://fonts.googleapis.com/css2?family=Amiri
RTL_OPTIMIZATION=true
```

### Family Account Features

Configure family safety:

```env
ENABLE_FAMILY_ACCOUNTS=true
ENABLE_PARENTAL_CONTROLS=true
AGE_TIER_FILTERING=true
CONTENT_MODERATION=strict
```

## 📊 Monitoring Setup

### Enable Monitoring Stack

1. Deploy monitoring services:
   ```bash
   docker compose -f docker-compose.enhanced.yml --profile monitoring up -d
   ```

2. Configure Coolify webhook for alerts:
   ```env
   COOLIFY_WEBHOOK_URL=https://coolify.yourdomain.com/webhooks/alerts
   ALERT_CHANNELS=slack,email,webhook
   ```

3. Access dashboards:
   - Grafana: `https://monitoring.yourdomain.com`
   - Metrics: `https://metrics.yourdomain.com`

## 🔍 Troubleshooting

### Build Failures

1. Check Coolify build logs
2. Verify all environment variables are set
3. Ensure Dockerfile.coolify exists in repository

### Database Connection Issues

```bash
# Test connection from Coolify container
docker exec -it [container-id] psql $DATABASE_URL -c "SELECT 1"
```

### Prayer Times Not Loading

1. Verify API keys are valid
2. Check Redis cache is running
3. Review fallback system logs

### Performance Issues

1. Check resource usage in Coolify
2. Scale up if needed
3. Enable Redis caching
4. Review Nginx caching configuration

## 🚨 Production Checklist

- [ ] SSL certificates configured
- [ ] Database backups enabled
- [ ] Redis persistence configured
- [ ] Environment variables secured
- [ ] Health checks passing
- [ ] Monitoring enabled
- [ ] Prayer times API keys valid
- [ ] Arabic fonts loading correctly
- [ ] Family account features tested
- [ ] Ramadan mode configured

## 📞 Support

For deployment issues:
1. Check Coolify logs: Settings → Logs
2. Review application logs: `/app/logs/`
3. Test health endpoints manually
4. Verify all services are running

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Both health checks return 200 OK
- ✅ Prayer times display correctly
- ✅ Arabic content renders properly
- ✅ User authentication works
- ✅ Educational content loads
- ✅ Admin dashboard accessible
- ✅ Mobile API endpoints respond
- ✅ Redis cache hit rate > 80%

## 🔄 Updates and Maintenance

### Updating the Application

1. Push changes to Git repository
2. In Coolify, click "Redeploy"
3. Monitor deployment logs
4. Verify health checks after deployment

### Database Migrations

Migrations run automatically if `RUN_MIGRATIONS=true`. To run manually:

```bash
docker exec -it [container-id] npm run migrate --workspace=@attaqwa/db
```

### Backup Strategy

1. Enable Coolify automatic backups
2. Configure database backups:
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```
3. Backup Redis data:
   ```bash
   redis-cli --rdb /backup/redis_$(date +%Y%m%d).rdb
   ```

---

**Ma sha Allah!** Your Islamic community platform is now deployed on Coolify with enterprise-grade infrastructure! 🕌