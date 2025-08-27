# Validate Masjid At-Taqwa Infrastructure

## Task Overview
Validate the complete infrastructure setup for the Masjid At-Taqwa Digital Ecosystem against production readiness standards.

## Prerequisites
- Docker and Docker Compose installed
- Access to the attaqwa-masjid project repository
- PostgreSQL client tools for database validation
- curl or similar tools for API testing

## Validation Steps

### Step 1: Container Infrastructure Validation
```bash
# Start the enhanced infrastructure
docker compose -f docker-compose.enhanced.yml up -d

# Verify all services are healthy
docker compose -f docker-compose.enhanced.yml ps

# Check service logs for errors
docker compose -f docker-compose.enhanced.yml logs --tail=50
```

### Step 2: Database Validation
```bash
# Test PostgreSQL connectivity
docker exec attaqwa-postgres-enhanced pg_isready -U attaqwa_user -d attaqwa_db

# Verify Redis connectivity
docker exec attaqwa-redis-enhanced redis-cli --no-auth-warning -a redis_secure_password_2024 ping

# Test Islamic calendar cache
docker exec attaqwa-islamic-calendar redis-cli ping
```

### Step 3: API Services Validation
```bash
# Test API health endpoint
curl -f http://localhost:3001/health

# Test prayer times endpoint
curl -f http://localhost:3001/api/prayer-times

# Test authentication endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Step 4: Web Application Validation
```bash
# Test web application health
curl -f http://localhost:3000

# Test static assets loading
curl -I http://localhost:3000/_next/static/css/app.css

# Test API integration from frontend
curl -f http://localhost:3000/api/announcements
```

### Step 5: Islamic Services Validation
```bash
# Test prayer times monitoring service
docker exec attaqwa-prayer-monitor npx tsx src/scripts/prayer-times-monitor.ts status

# Verify prayer times fallback system
curl -f http://localhost:3001/api/prayer-times/fallback-test

# Test Islamic calendar integration
curl -f http://localhost:3001/api/islamic-calendar/current
```

### Step 6: Monitoring Stack Validation
```bash
# Verify Grafana accessibility (if monitoring profile enabled)
curl -f http://localhost:3300/login

# Check Prometheus metrics collection
curl -f http://localhost:9090/metrics

# Verify Loki log aggregation
curl -f http://localhost:3100/ready
```

### Step 7: Performance Validation
```bash
# Test database query performance
docker exec attaqwa-postgres-enhanced psql -U attaqwa_user -d attaqwa_db -c "
  EXPLAIN ANALYZE SELECT * FROM prayer_times WHERE date = CURRENT_DATE;
"

# Test Redis cache performance
docker exec attaqwa-redis-enhanced redis-cli --no-auth-warning -a redis_secure_password_2024 --latency-history

# Test API response times
time curl -s http://localhost:3001/api/prayer-times > /dev/null
```

### Step 8: Security Validation
```bash
# Verify no hardcoded secrets in containers
docker exec attaqwa-api-enhanced env | grep -E "(PASSWORD|SECRET|KEY)" | head -5

# Test SSL/TLS configuration (if HTTPS enabled)
curl -I --insecure https://localhost:443

# Verify container user permissions
docker exec attaqwa-api-enhanced whoami
```

### Step 9: Backup and Recovery Validation
```bash
# Test database backup creation
docker exec attaqwa-postgres-enhanced pg_dump -U attaqwa_user attaqwa_db > /tmp/backup_test.sql

# Test Redis data persistence
docker exec attaqwa-redis-enhanced redis-cli --no-auth-warning -a redis_secure_password_2024 BGSAVE

# Verify backup file creation
ls -la /tmp/backup_test.sql
```

### Step 10: Islamic Content Validation
```bash
# Test educational content API with age filtering
curl -f "http://localhost:3001/api/education/content?ageGroup=ELEMENTARY"

# Test prayer time accuracy
curl -f "http://localhost:3001/api/prayer-times/validate?city=NewYork&country=US"

# Verify Islamic calendar calculations
curl -f "http://localhost:3001/api/islamic-calendar/ramadan/2024"
```

## Expected Results

### Healthy Infrastructure Indicators:
- ✅ All containers start and reach healthy status
- ✅ API responds within 200ms for prayer times
- ✅ Database connections established successfully
- ✅ Prayer times monitoring service operational
- ✅ Islamic services fallback system functional
- ✅ No critical errors in logs
- ✅ Memory usage within acceptable limits
- ✅ Educational content filtering working correctly

### Performance Benchmarks:
- API response time: <200ms
- Web page load time: <3s
- Database query time: <100ms
- Container startup time: <60s
- Prayer times accuracy: 100% match with Islamic calculations

## Troubleshooting Common Issues

### Container Startup Issues:
```bash
# Check container logs for specific service
docker logs attaqwa-api-enhanced --tail=100

# Restart specific service
docker compose -f docker-compose.enhanced.yml restart api

# Check network connectivity
docker network ls
docker network inspect attaqwa-enhanced-network
```

### Database Connection Issues:
```bash
# Verify database credentials
docker exec attaqwa-postgres-enhanced env | grep POSTGRES

# Check database accessibility
docker exec attaqwa-postgres-enhanced netstat -ln | grep 5432

# Test connection from API container
docker exec attaqwa-api-enhanced nc -z postgres 5432
```

### Prayer Times Service Issues:
```bash
# Check external API connectivity
curl -f "https://api.aladhan.com/v1/timings/$(date +%d-%m-%Y)?latitude=40.7128&longitude=-74.0060&method=2"

# Verify fallback service
docker logs attaqwa-prayer-monitor --tail=50

# Test local calculation fallback
curl -f "http://localhost:3001/api/prayer-times/local-calculation?lat=40.7128&lng=-74.0060"
```

## Validation Completion

After completing all validation steps:

1. ✅ Document any issues found and their resolutions
2. ✅ Update the Attaqwa Infrastructure Checklist with validation results
3. ✅ Create summary report of infrastructure readiness
4. ✅ Schedule regular validation runs (weekly/monthly)
5. ✅ Brief community leadership on infrastructure status

## Next Steps

Upon successful validation:
- Proceed with production deployment planning
- Set up automated monitoring and alerting
- Schedule regular infrastructure health checks
- Document operational procedures for community volunteers
- Plan capacity scaling based on community growth

## Related Tasks
- `review-attaqwa-infrastructure.md` - Infrastructure review process
- `attaqwa-infrastructure-checklist.md` - Comprehensive validation checklist
- `deploy-attaqwa-production.md` - Production deployment procedures