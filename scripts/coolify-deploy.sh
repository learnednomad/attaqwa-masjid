#!/bin/bash

# Coolify Deployment Script for Attaqwa Masjid Digital Ecosystem
# This script automates deployment to Coolify platform

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COOLIFY_API_URL="${COOLIFY_API_URL:-http://localhost:8000}"
COOLIFY_TOKEN="${COOLIFY_TOKEN:-}"
PROJECT_NAME="attaqwa-masjid"
ENVIRONMENT="${1:-production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if [[ -z "$COOLIFY_TOKEN" ]]; then
        error "COOLIFY_TOKEN environment variable is not set"
        error "Please set your Coolify API token: export COOLIFY_TOKEN=your_token_here"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        error "jq is required but not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        error "git is required but not installed"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Test Coolify API connection
test_coolify_connection() {
    log "Testing Coolify API connection..."
    
    response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $COOLIFY_TOKEN" \
        "$COOLIFY_API_URL/api/v1/servers" -o /tmp/coolify_test.json)
    
    if [[ "$response" == "200" ]]; then
        success "Connected to Coolify API successfully"
        rm -f /tmp/coolify_test.json
    else
        error "Failed to connect to Coolify API (HTTP $response)"
        error "Please check your COOLIFY_API_URL and COOLIFY_TOKEN"
        exit 1
    fi
}

# Create or update Coolify project
setup_coolify_project() {
    log "Setting up Coolify project..."
    
    # Check if project exists
    project_response=$(curl -s -H "Authorization: Bearer $COOLIFY_TOKEN" \
        "$COOLIFY_API_URL/api/v1/projects?name=$PROJECT_NAME")
    
    project_id=$(echo "$project_response" | jq -r '.data[0].id // empty')
    
    if [[ -z "$project_id" ]]; then
        log "Creating new project: $PROJECT_NAME"
        
        create_response=$(curl -s -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$PROJECT_NAME\",\"description\":\"Masjid At-Taqwa Digital Ecosystem\"}" \
            "$COOLIFY_API_URL/api/v1/projects")
        
        project_id=$(echo "$create_response" | jq -r '.id')
        
        if [[ "$project_id" == "null" || -z "$project_id" ]]; then
            error "Failed to create project"
            error "Response: $create_response"
            exit 1
        fi
        
        success "Created project with ID: $project_id"
    else
        success "Using existing project with ID: $project_id"
    fi
    
    echo "$project_id" > /tmp/coolify_project_id
}

# Deploy database
deploy_database() {
    log "Deploying PostgreSQL database..."
    
    project_id=$(cat /tmp/coolify_project_id)
    
    db_payload=$(cat <<EOF
{
  "name": "attaqwa-postgres",
  "description": "PostgreSQL database for Attaqwa Masjid",
  "type": "postgresql",
  "version": "14",
  "environment": "$ENVIRONMENT",
  "project_id": "$project_id",
  "configuration": {
    "POSTGRES_DB": "attaqwa_db",
    "POSTGRES_USER": "attaqwa_user",
    "POSTGRES_PASSWORD": "$POSTGRES_PASSWORD"
  },
  "volumes": [
    {
      "source": "attaqwa_postgres_data",
      "target": "/var/lib/postgresql/data"
    }
  ],
  "networks": ["attaqwa-network"]
}
EOF
)
    
    db_response=$(curl -s -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$db_payload" \
        "$COOLIFY_API_URL/api/v1/databases")
    
    db_id=$(echo "$db_response" | jq -r '.id // empty')
    
    if [[ -n "$db_id" && "$db_id" != "null" ]]; then
        success "Database deployed with ID: $db_id"
        echo "$db_id" > /tmp/coolify_db_id
    else
        warning "Database deployment may have failed, checking existing..."
        # Try to find existing database
        existing_db=$(curl -s -H "Authorization: Bearer $COOLIFY_TOKEN" \
            "$COOLIFY_API_URL/api/v1/databases?project_id=$project_id&name=attaqwa-postgres")
        
        existing_db_id=$(echo "$existing_db" | jq -r '.data[0].id // empty')
        if [[ -n "$existing_db_id" ]]; then
            success "Using existing database with ID: $existing_db_id"
            echo "$existing_db_id" > /tmp/coolify_db_id
        else
            error "Failed to deploy or find database"
            exit 1
        fi
    fi
}

# Deploy Redis cache
deploy_redis() {
    log "Deploying Redis cache..."
    
    project_id=$(cat /tmp/coolify_project_id)
    
    redis_payload=$(cat <<EOF
{
  "name": "attaqwa-redis",
  "description": "Redis cache for Attaqwa Masjid",
  "type": "redis",
  "version": "7-alpine",
  "environment": "$ENVIRONMENT",
  "project_id": "$project_id",
  "configuration": {
    "REDIS_PASSWORD": "$REDIS_PASSWORD"
  },
  "volumes": [
    {
      "source": "attaqwa_redis_data",
      "target": "/data"
    }
  ],
  "networks": ["attaqwa-network"]
}
EOF
)
    
    redis_response=$(curl -s -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$redis_payload" \
        "$COOLIFY_API_URL/api/v1/databases")
    
    redis_id=$(echo "$redis_response" | jq -r '.id // empty')
    
    if [[ -n "$redis_id" && "$redis_id" != "null" ]]; then
        success "Redis deployed with ID: $redis_id"
    else
        warning "Redis deployment may have failed, continuing..."
    fi
}

# Deploy API service
deploy_api() {
    log "Deploying API service..."
    
    project_id=$(cat /tmp/coolify_project_id)
    
    api_payload=$(cat <<EOF
{
  "name": "attaqwa-api",
  "description": "Hono.js API for Attaqwa Masjid",
  "type": "application",
  "project_id": "$project_id",
  "environment": "$ENVIRONMENT",
  "source": {
    "type": "git",
    "repository": "https://github.com/learnednomad/attaqwa-masjid.git",
    "branch": "main",
    "dockerfile": "packages/api/Dockerfile"
  },
  "build": {
    "context": ".",
    "dockerfile": "packages/api/Dockerfile",
    "target": "production"
  },
  "environment_variables": [
    {
      "key": "NODE_ENV",
      "value": "production"
    },
    {
      "key": "PORT",
      "value": "3001"
    },
    {
      "key": "DATABASE_URL",
      "value": "$DATABASE_URL"
    },
    {
      "key": "JWT_SECRET",
      "value": "$JWT_SECRET"
    },
    {
      "key": "FRONTEND_URL",
      "value": "$FRONTEND_URL"
    },
    {
      "key": "REDIS_URL",
      "value": "$REDIS_URL"
    }
  ],
  "ports": [
    {
      "internal": 3001,
      "external": 3001,
      "protocol": "http"
    }
  ],
  "networks": ["attaqwa-network"],
  "health_check": {
    "path": "/api/health",
    "port": 3001,
    "interval": 30,
    "timeout": 10,
    "retries": 3
  }
}
EOF
)
    
    api_response=$(curl -s -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$api_payload" \
        "$COOLIFY_API_URL/api/v1/applications")
    
    api_id=$(echo "$api_response" | jq -r '.id // empty')
    
    if [[ -n "$api_id" && "$api_id" != "null" ]]; then
        success "API service deployed with ID: $api_id"
        echo "$api_id" > /tmp/coolify_api_id
    else
        error "Failed to deploy API service"
        error "Response: $api_response"
        exit 1
    fi
}

# Deploy web application
deploy_web() {
    log "Deploying web application..."
    
    project_id=$(cat /tmp/coolify_project_id)
    
    web_payload=$(cat <<EOF
{
  "name": "attaqwa-web",
  "description": "Next.js web app for Attaqwa Masjid",
  "type": "application",
  "project_id": "$project_id",
  "environment": "$ENVIRONMENT",
  "source": {
    "type": "git",
    "repository": "https://github.com/learnednomad/attaqwa-masjid.git",
    "branch": "main",
    "dockerfile": "packages/web/Dockerfile"
  },
  "build": {
    "context": ".",
    "dockerfile": "packages/web/Dockerfile",
    "target": "production"
  },
  "environment_variables": [
    {
      "key": "NODE_ENV",
      "value": "production"
    },
    {
      "key": "NEXT_PUBLIC_API_URL",
      "value": "$NEXT_PUBLIC_API_URL"
    },
    {
      "key": "NEXT_PUBLIC_APP_URL",
      "value": "$NEXT_PUBLIC_APP_URL"
    }
  ],
  "ports": [
    {
      "internal": 3000,
      "external": 80,
      "protocol": "http"
    }
  ],
  "networks": ["attaqwa-network"],
  "health_check": {
    "path": "/",
    "port": 3000,
    "interval": 30,
    "timeout": 10,
    "retries": 3
  }
}
EOF
)
    
    web_response=$(curl -s -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$web_payload" \
        "$COOLIFY_API_URL/api/v1/applications")
    
    web_id=$(echo "$web_response" | jq -r '.id // empty')
    
    if [[ -n "$web_id" && "$web_id" != "null" ]]; then
        success "Web application deployed with ID: $web_id"
        echo "$web_id" > /tmp/coolify_web_id
    else
        error "Failed to deploy web application"
        error "Response: $web_response"
        exit 1
    fi
}

# Start all services
start_services() {
    log "Starting all services..."
    
    if [[ -f /tmp/coolify_db_id ]]; then
        db_id=$(cat /tmp/coolify_db_id)
        log "Starting database service..."
        curl -s -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" \
            "$COOLIFY_API_URL/api/v1/databases/$db_id/start" > /dev/null
    fi
    
    if [[ -f /tmp/coolify_api_id ]]; then
        api_id=$(cat /tmp/coolify_api_id)
        log "Starting API service..."
        curl -s -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" \
            "$COOLIFY_API_URL/api/v1/applications/$api_id/start" > /dev/null
    fi
    
    if [[ -f /tmp/coolify_web_id ]]; then
        web_id=$(cat /tmp/coolify_web_id)
        log "Starting web application..."
        curl -s -X POST -H "Authorization: Bearer $COOLIFY_TOKEN" \
            "$COOLIFY_API_URL/api/v1/applications/$web_id/start" > /dev/null
    fi
    
    success "All services started"
}

# Monitor deployment status
monitor_deployment() {
    log "Monitoring deployment status..."
    
    max_attempts=30
    attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check API health
        if curl -f -s "$NEXT_PUBLIC_API_URL/api/health" > /dev/null; then
            success "API is healthy"
            break
        else
            if [[ $attempt -eq $max_attempts ]]; then
                error "API health check failed after $max_attempts attempts"
                return 1
            fi
            warning "API not ready, waiting..."
            sleep 30
            ((attempt++))
        fi
    done
    
    # Check web application
    if curl -f -s "$NEXT_PUBLIC_APP_URL" > /dev/null; then
        success "Web application is accessible"
    else
        warning "Web application accessibility check failed"
    fi
    
    success "Deployment monitoring completed"
}

# Cleanup temporary files
cleanup() {
    log "Cleaning up temporary files..."
    rm -f /tmp/coolify_project_id /tmp/coolify_db_id /tmp/coolify_api_id /tmp/coolify_web_id
}

# Show deployment summary
show_summary() {
    log "📋 Deployment Summary"
    echo "===================="
    echo "🕌 Project: $PROJECT_NAME"
    echo "🌍 Environment: $ENVIRONMENT"
    echo "🌐 Web Application: $NEXT_PUBLIC_APP_URL"
    echo "🔗 API Endpoint: $NEXT_PUBLIC_API_URL"
    echo "📊 Coolify Dashboard: $COOLIFY_API_URL"
    echo ""
    echo "🤲 May Allah bless this deployment for the benefit of the Muslim community!"
}

# Main execution
main() {
    log "🕌 Starting Attaqwa Masjid Coolify deployment..."
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $(date)"
    
    # Load environment variables
    if [[ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]]; then
        source "$PROJECT_ROOT/.env.$ENVIRONMENT"
    else
        error "Environment file not found: .env.$ENVIRONMENT"
        exit 1
    fi
    
    # Trap for cleanup
    trap cleanup EXIT
    
    check_prerequisites
    test_coolify_connection
    setup_coolify_project
    deploy_database
    deploy_redis
    deploy_api
    deploy_web
    start_services
    
    log "Waiting for services to initialize..."
    sleep 60
    
    if monitor_deployment; then
        show_summary
        success "🎉 Coolify deployment completed successfully!"
    else
        error "Deployment health checks failed"
        exit 1
    fi
}

# Help function
show_help() {
    cat << EOF
Attaqwa Masjid Coolify Deployment Script

Usage: $0 [ENVIRONMENT]

ENVIRONMENT:
    production  Deploy to production environment
    staging     Deploy to staging environment

Environment Variables Required:
    COOLIFY_TOKEN       Your Coolify API token
    COOLIFY_API_URL     Coolify server URL (default: http://localhost:8000)
    DATABASE_URL        PostgreSQL connection string
    JWT_SECRET          JWT secret key
    FRONTEND_URL        Frontend application URL
    REDIS_URL           Redis connection string

Examples:
    $0 production       # Deploy to production
    $0 staging          # Deploy to staging

The script will:
1. Create a Coolify project
2. Deploy PostgreSQL database
3. Deploy Redis cache
4. Deploy Hono.js API
5. Deploy Next.js web application
6. Start all services
7. Monitor deployment health

Islamic Considerations:
This deployment serves the Muslim community with:
- Prayer time services
- Islamic educational content
- Community management tools
- Respect for Islamic values and principles

بارك الله فيك (May Allah bless you)
EOF
}

# Handle arguments
case "${1:-production}" in
    -h|--help)
        show_help
        exit 0
        ;;
    production|staging)
        main
        ;;
    *)
        error "Invalid argument: $1"
        show_help
        exit 1
        ;;
esac