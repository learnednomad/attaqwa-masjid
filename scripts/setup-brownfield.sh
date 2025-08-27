#!/bin/bash

# Attaqwa Masjid Brownfield Integration Setup Script
# Comprehensive setup for production-ready Islamic services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Attaqwa Masjid Digital Ecosystem"
COMPOSE_FILE="docker-compose.enhanced.yml"
ENV_FILE=".env"

echo -e "${BLUE}🕌 $PROJECT_NAME - Brownfield Integration Setup${NC}"
echo "============================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Some development features may not work."
    fi
    
    # Check NPM
    if ! command -v npm &> /dev/null; then
        print_warning "NPM is not installed. Package management may not work."
    fi
    
    print_status "Prerequisites check completed."
}

# Environment setup
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example $ENV_FILE
            print_status "Created $ENV_FILE from .env.example"
        else
            print_error ".env.example not found. Creating minimal environment file."
            cat > $ENV_FILE << EOF
NODE_ENV=development
POSTGRES_DB=attaqwa_db
POSTGRES_USER=attaqwa_user
POSTGRES_PASSWORD=attaqwa_secure_2024!
REDIS_PASSWORD=redis_secure_password_2024
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
        fi
    fi
    
    # Generate secure secrets if using defaults
    if grep -q "your-super-secret-jwt-key-change-in-production" $ENV_FILE; then
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i.bak "s/your-super-secret-jwt-key-change-in-production-min-32-chars/$JWT_SECRET/" $ENV_FILE
        print_status "Generated secure JWT secret"
    fi
    
    print_status "Environment configuration completed."
}

# Database setup
setup_database() {
    print_status "Setting up database..."
    
    # Create init directory if it doesn't exist
    mkdir -p packages/db/init
    
    # Create basic init script if it doesn't exist
    if [ ! -f "packages/db/init/01-init.sql" ]; then
        cat > packages/db/init/01-init.sql << EOF
-- Attaqwa Masjid Database Initialization
-- Created by Brownfield Setup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Basic health check function
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE(status text, timestamp timestamp with time zone)
LANGUAGE sql
AS \$\$
SELECT 'healthy'::text, now()::timestamp with time zone;
\$\$;

-- Islamic services schema
CREATE SCHEMA IF NOT EXISTS islamic_services;

-- Prayer times cache table
CREATE TABLE IF NOT EXISTS islamic_services.prayer_times_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_key VARCHAR(100) NOT NULL,
    date_key DATE NOT NULL,
    prayer_data JSONB NOT NULL,
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(location_key, date_key)
);

-- Manual overrides table
CREATE TABLE IF NOT EXISTS islamic_services.manual_overrides (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_latitude DECIMAL(10, 6) NOT NULL,
    location_longitude DECIMAL(10, 6) NOT NULL,
    date_override DATE NOT NULL,
    prayer_times JSONB NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Service health tracking
CREATE TABLE IF NOT EXISTS islamic_services.service_health (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    is_healthy BOOLEAN NOT NULL,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
    consecutive_failures INTEGER DEFAULT 0,
    response_time INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(service_name)
);

-- Insert initial service health records
INSERT INTO islamic_services.service_health (service_name, is_healthy, consecutive_failures) 
VALUES 
    ('aladhan', true, 0),
    ('islamicfinder', true, 0),
    ('local', true, 0),
    ('offline', true, 0)
ON CONFLICT (service_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prayer_cache_location_date ON islamic_services.prayer_times_cache(location_key, date_key);
CREATE INDEX IF NOT EXISTS idx_prayer_cache_expires ON islamic_services.prayer_times_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_manual_overrides_location ON islamic_services.manual_overrides(location_latitude, location_longitude);
CREATE INDEX IF NOT EXISTS idx_manual_overrides_date ON islamic_services.manual_overrides(date_override);
CREATE INDEX IF NOT EXISTS idx_service_health_name ON islamic_services.service_health(service_name);

-- Grant permissions
GRANT USAGE ON SCHEMA islamic_services TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA islamic_services TO PUBLIC;
EOF
        print_status "Created database initialization script"
    fi
}

# Docker configuration
setup_docker_configs() {
    print_status "Setting up Docker configurations..."
    
    # Create docker directory structure
    mkdir -p docker/{nginx,postgres,redis,prometheus,grafana,loki}
    mkdir -p docker/grafana/{provisioning,dashboards,islamic-dashboards}
    mkdir -p docker/prometheus
    mkdir -p docker/loki
    
    # Enhanced Nginx configuration
    cat > docker/nginx/nginx.enhanced.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for" '
                   'rt=$request_time uct="$upstream_connect_time" '
                   'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    include /etc/nginx/conf.d/*.conf;
}
EOF

    # Enhanced site configuration
    cat > docker/nginx/conf.d/enhanced.conf << 'EOF'
# Upstream definitions
upstream api_backend {
    server api:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream web_backend {
    server web:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=web_limit:10m rate=200r/m;

# API server
server {
    listen 80;
    server_name api.attaqwa.local localhost;

    # Islamic API rate limiting
    location /api/prayer-times {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        # Islamic service headers
        proxy_set_header X-Islamic-Service "attaqwa-api";
        proxy_set_header X-Request-Context "nginx-proxy";
        
        # Caching for prayer times
        location ~* /api/prayer-times/(qibla|islamic-date)$ {
            proxy_cache_valid 200 1h;
            proxy_cache_use_stale error timeout invalid_header updating;
            add_header X-Cache-Status $upstream_cache_status;
        }
    }

    location / {
        limit_req zone=api_limit burst=50 nodelay;
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Web server
server {
    listen 80 default_server;
    server_name attaqwa.local localhost;

    # Mobile optimization
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        proxy_pass http://web_backend;
        proxy_cache_valid 200 1d;
        proxy_cache_use_stale error timeout invalid_header updating;
        add_header Cache-Control "public, immutable, max-age=86400";
        add_header X-Cache-Status $upstream_cache_status;
    }

    location / {
        limit_req zone=web_limit burst=100 nodelay;
        proxy_pass http://web_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Mobile headers
        proxy_set_header X-Mobile-Detected $mobile_detect;
        proxy_set_header X-Device-Type $device_type;
    }
}
EOF

    # Enhanced PostgreSQL configuration
    cat > docker/postgres/postgresql.enhanced.conf << 'EOF'
# PostgreSQL configuration optimized for Islamic services

# Connection settings
listen_addresses = '*'
port = 5432
max_connections = 200

# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Performance settings
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'ddl'
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Islamic services specific settings
timezone = 'UTC'
datestyle = 'iso, mdy'
default_text_search_config = 'pg_catalog.english'

# Replication (for production)
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 32
EOF

    # Enhanced Redis configuration
    cat > docker/redis/redis-enhanced.conf << 'EOF'
# Redis configuration optimized for Islamic services

# Network
bind 0.0.0.0
port 6379
timeout 300
keepalive 60

# Memory management
maxmemory 512mb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Persistence
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# Append only file
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Security
requirepass redis_secure_password_2024

# Performance
tcp-keepalive 300
tcp-backlog 511

# Islamic services cache namespaces
# prayer-times:*
# qibla:*
# hijri-dates:*
# islamic-events:*
EOF

    print_status "Docker configurations created."
}

# Monitoring setup
setup_monitoring() {
    print_status "Setting up monitoring configurations..."
    
    # Prometheus configuration
    cat > docker/prometheus/prometheus-enhanced.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files: []

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'attaqwa-api'
    static_configs:
      - targets: ['api:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'attaqwa-web'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 60s

  - job_name: 'prayer-monitor'
    static_configs:
      - targets: ['prayer-monitor:3002']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 60s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 60s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    scrape_interval: 30s
EOF

    # Loki configuration
    cat > docker/loki/loki-enhanced.yml << 'EOF'
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

ingester:
  wal:
    enabled: true
    dir: /loki/wal
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 1h
  max_chunk_age: 1h
  chunk_target_size: 1048576
  chunk_retain_period: 30s
  max_transfer_retries: 0

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    cache_ttl: 24h
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

compactor:
  working_directory: /loki/boltdb-shipper-compactor
  shared_store: filesystem

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s

ruler:
  storage:
    type: local
    local:
      directory: /loki/rules
  rule_path: /loki/rules-temp
  alertmanager_url: http://localhost:9093
  ring:
    kvstore:
      store: inmemory
  enable_api: true
EOF

    print_status "Monitoring configurations created."
}

# Start services
start_services() {
    print_status "Starting Attaqwa Masjid services..."
    
    # Build and start services
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    # Start core services first
    $COMPOSE_CMD -f $COMPOSE_FILE up -d postgres redis
    
    print_status "Waiting for database and cache to be ready..."
    sleep 30
    
    # Start application services
    $COMPOSE_CMD -f $COMPOSE_FILE up -d api web
    
    print_status "Waiting for application services to be ready..."
    sleep 30
    
    # Start prayer monitoring
    $COMPOSE_CMD -f $COMPOSE_FILE up -d prayer-monitor
    
    # Start reverse proxy
    $COMPOSE_CMD -f $COMPOSE_FILE up -d nginx
    
    # Start development tools if in development mode
    if [[ "${NODE_ENV:-development}" == "development" ]]; then
        $COMPOSE_CMD -f $COMPOSE_FILE --profile development up -d
    fi
    
    print_status "All services started successfully!"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    local services=("postgres" "redis" "api" "web")
    local failed=0
    
    for service in "${services[@]}"; do
        if docker ps --filter "name=attaqwa-$service" --filter "status=running" | grep -q $service; then
            print_status "✅ $service is running"
        else
            print_error "❌ $service is not running"
            failed=$((failed + 1))
        fi
    done
    
    # Test API health
    sleep 5
    if curl -f http://localhost:3001/health &> /dev/null; then
        print_status "✅ API health check passed"
    else
        print_error "❌ API health check failed"
        failed=$((failed + 1))
    fi
    
    # Test Web health  
    if curl -f http://localhost:3000 &> /dev/null; then
        print_status "✅ Web application is accessible"
    else
        print_error "❌ Web application is not accessible"
        failed=$((failed + 1))
    fi
    
    if [ $failed -eq 0 ]; then
        print_status "🎉 All health checks passed!"
        print_status ""
        print_status "🕌 Attaqwa Masjid Digital Ecosystem is ready!"
        print_status "   📱 Web App: http://localhost:3000"
        print_status "   🔧 API: http://localhost:3001"
        print_status "   🗄️  Database Admin: http://localhost:8080"
        print_status "   📊 Monitoring: http://localhost:3300"
        print_status ""
        print_status "🔍 Run 'npm run monitor:prayer-times:status' to check Islamic services"
        print_status "📜 View logs with: docker-compose -f $COMPOSE_FILE logs -f"
    else
        print_error "❌ $failed service(s) failed health check"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Starting brownfield integration setup...${NC}\n"
    
    check_prerequisites
    setup_environment
    setup_database
    setup_docker_configs
    setup_monitoring
    start_services
    health_check
    
    echo -e "\n${GREEN}🎉 Brownfield integration setup completed successfully!${NC}"
    echo -e "${BLUE}The Attaqwa Masjid Digital Ecosystem is now ready for development and production.${NC}"
}

# Execute main function
main "$@"