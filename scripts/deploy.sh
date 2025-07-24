#!/bin/bash

# Production Deployment Script for Attaqwa Masjid Digital Ecosystem
# This script handles safe production deployments with rollback capabilities

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/var/log/attaqwa-deploy.log"
BACKUP_DIR="/backups/attaqwa"
DEPLOYMENT_ENV="${1:-production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not accessible"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed or not accessible"
        exit 1
    fi
}

# Validate environment
validate_environment() {
    log "Validating deployment environment: $DEPLOYMENT_ENV"
    
    case $DEPLOYMENT_ENV in
        production|staging|development)
            log "✅ Valid environment: $DEPLOYMENT_ENV"
            ;;
        *)
            error "Invalid environment: $DEPLOYMENT_ENV. Must be production, staging, or development"
            exit 1
            ;;
    esac
    
    # Check if environment file exists
    if [[ ! -f "$PROJECT_ROOT/.env.$DEPLOYMENT_ENV" ]]; then
        error "Environment file not found: .env.$DEPLOYMENT_ENV"
        exit 1
    fi
    
    # Validate required environment variables
    source "$PROJECT_ROOT/.env.$DEPLOYMENT_ENV"
    
    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "FRONTEND_URL"
        "NEXT_PUBLIC_API_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    success "Environment validation completed"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        exit 1
    fi
    
    # Check available disk space (minimum 5GB)
    available_space=$(df / | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 5242880 ]]; then
        error "Insufficient disk space. At least 5GB required"
        exit 1
    fi
    
    # Check if services are accessible
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        log "Checking current service health..."
        
        # Check if services are running
        if docker-compose ps | grep -q "Up"; then
            log "Current services are running"
        else
            warning "No services currently running"
        fi
    fi
    
    success "Pre-deployment checks completed"
}

# Create backup before deployment
create_backup() {
    log "Creating backup before deployment..."
    
    # Create backup directory
    backup_timestamp=$(date +%Y%m%d_%H%M%S)
    current_backup_dir="$BACKUP_DIR/$backup_timestamp"
    mkdir -p "$current_backup_dir"
    
    # Database backup
    if docker-compose ps postgres | grep -q "Up"; then
        log "Creating database backup..."
        docker-compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$current_backup_dir/database.sql"
        success "Database backup created"
    fi
    
    # File system backup (uploads, etc.)
    if [[ -d "$PROJECT_ROOT/uploads" ]]; then
        log "Creating file system backup..."
        tar -czf "$current_backup_dir/uploads.tar.gz" -C "$PROJECT_ROOT" uploads
        success "File system backup created"
    fi
    
    # Configuration backup
    log "Creating configuration backup..."
    cp "$PROJECT_ROOT/.env.$DEPLOYMENT_ENV" "$current_backup_dir/"
    cp "$PROJECT_ROOT/docker-compose.yml" "$current_backup_dir/"
    if [[ -f "$PROJECT_ROOT/docker-compose.$DEPLOYMENT_ENV.yml" ]]; then
        cp "$PROJECT_ROOT/docker-compose.$DEPLOYMENT_ENV.yml" "$current_backup_dir/"
    fi
    
    # Store current git commit
    git rev-parse HEAD > "$current_backup_dir/git_commit.txt"
    
    success "Backup created at $current_backup_dir"
    echo "$current_backup_dir" > /tmp/attaqwa_last_backup
}

# Build and deploy
deploy() {
    log "Starting deployment for $DEPLOYMENT_ENV environment..."
    
    # Copy environment file
    cp "$PROJECT_ROOT/.env.$DEPLOYMENT_ENV" "$PROJECT_ROOT/.env"
    
    # Build images
    log "Building Docker images..."
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    elif [[ "$DEPLOYMENT_ENV" == "staging" ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    else
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
    fi
    
    # Stop current services gracefully
    log "Stopping current services..."
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml down --timeout 30
    elif [[ "$DEPLOYMENT_ENV" == "staging" ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml down --timeout 30
    else
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down --timeout 30
    fi
    
    # Start new services
    log "Starting new services..."
    if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    elif [[ "$DEPLOYMENT_ENV" == "staging" ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    fi
    
    success "Services started"
}

# Post-deployment checks
post_deployment_checks() {
    log "Running post-deployment checks..."
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Health checks
    max_attempts=12
    attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check API health
        if curl -f -s "http://localhost:3001/api/health" > /dev/null; then
            success "API is healthy"
            break
        else
            if [[ $attempt -eq $max_attempts ]]; then
                error "API health check failed after $max_attempts attempts"
                return 1
            fi
            warning "API not ready, waiting..."
            sleep 10
            ((attempt++))
        fi
    done
    
    # Check web application
    if curl -f -s "http://localhost:3000" > /dev/null; then
        success "Web application is accessible"
    else
        error "Web application is not accessible"
        return 1
    fi
    
    # Test Islamic features
    log "Testing Islamic features..."
    
    # Test prayer times API
    if curl -f -s "http://localhost:3001/api/islamic/prayer-times?latitude=40.7128&longitude=-74.0060" > /dev/null; then
        success "Prayer times API is working"
    else
        warning "Prayer times API test failed"
    fi
    
    # Test database connectivity
    if docker-compose exec -T postgres pg_isready -U "$POSTGRES_USER" > /dev/null; then
        success "Database is accessible"
    else
        error "Database connectivity check failed"
        return 1
    fi
    
    success "Post-deployment checks completed"
}

# Rollback function
rollback() {
    error "Deployment failed. Starting rollback..."
    
    if [[ -f "/tmp/attaqwa_last_backup" ]]; then
        last_backup=$(cat /tmp/attaqwa_last_backup)
        
        if [[ -d "$last_backup" ]]; then
            log "Rolling back to backup: $last_backup"
            
            # Stop current services
            if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
                docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
            else
                docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
            fi
            
            # Restore configuration
            cp "$last_backup/.env.$DEPLOYMENT_ENV" "$PROJECT_ROOT/.env"
            
            # Restore database
            if [[ -f "$last_backup/database.sql" ]]; then
                log "Restoring database..."
                docker-compose up -d postgres
                sleep 10
                docker-compose exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$last_backup/database.sql"
            fi
            
            # Restore files
            if [[ -f "$last_backup/uploads.tar.gz" ]]; then
                log "Restoring file system..."
                tar -xzf "$last_backup/uploads.tar.gz" -C "$PROJECT_ROOT"
            fi
            
            # Start services with previous configuration
            if [[ "$DEPLOYMENT_ENV" == "production" ]]; then
                docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            else
                docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
            fi
            
            success "Rollback completed"
        else
            error "Backup directory not found: $last_backup"
        fi
    else
        error "No backup information found for rollback"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Keep last 10 backups
    if [[ -d "$BACKUP_DIR" ]]; then
        find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | sort -r | tail -n +11 | xargs -r rm -rf
        success "Old backups cleaned up"
    fi
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🕌 Attaqwa Masjid Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    if [[ -n "${ALERT_EMAIL:-}" ]]; then
        echo "$message" | mail -s "Attaqwa Masjid Deployment $status" "$ALERT_EMAIL" || true
    fi
}

# Main execution
main() {
    log "🕌 Starting Attaqwa Masjid deployment process..."
    log "Environment: $DEPLOYMENT_ENV"
    log "Timestamp: $(date)"
    log "Git commit: $(git rev-parse HEAD)"
    
    # Trap for cleanup on error
    trap 'rollback; send_notification "FAILED" "Deployment failed and rollback initiated"; exit 1' ERR
    
    check_permissions
    validate_environment
    pre_deployment_checks
    create_backup
    deploy
    
    if post_deployment_checks; then
        cleanup_old_backups
        send_notification "SUCCESS" "Deployment completed successfully"
        success "🎉 Deployment completed successfully!"
        log "🕌 May Allah bless this deployment for the benefit of the Muslim community"
    else
        error "Post-deployment checks failed"
        exit 1
    fi
}

# Help function
show_help() {
    cat << EOF
Attaqwa Masjid Digital Ecosystem Deployment Script

Usage: $0 [ENVIRONMENT]

ENVIRONMENT:
    production  Deploy to production environment
    staging     Deploy to staging environment
    development Deploy to development environment

Examples:
    $0 production   # Deploy to production
    $0 staging      # Deploy to staging
    $0              # Deploy to production (default)

The script will:
1. Validate the environment and configuration
2. Create a backup of current state
3. Build and deploy new version
4. Run health checks
5. Rollback if deployment fails

Requirements:
- Docker and Docker Compose installed
- Appropriate .env.[environment] file configured
- Sufficient disk space (minimum 5GB)

Islamic Considerations:
- This deployment serves the Muslim community
- All features respect Islamic principles
- Prayer times and Islamic content are prioritized

بارك الله فيك (May Allah bless you)
EOF
}

# Handle arguments
case "${1:-production}" in
    -h|--help)
        show_help
        exit 0
        ;;
    production|staging|development)
        main
        ;;
    *)
        error "Invalid argument: $1"
        show_help
        exit 1
        ;;
esac