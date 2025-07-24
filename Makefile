# Makefile for Attaqwa Masjid Digital Ecosystem
# Provides convenient commands for Docker operations

.PHONY: help dev prod build clean logs health backup restore test

# Default target
help: ## Show this help message
	@echo "Attaqwa Masjid Digital Ecosystem - Docker Commands"
	@echo "=================================================="
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development Commands
dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔗 API: http://localhost:3001"
	@echo "🗄️  Database Admin: http://localhost:8080"
	@echo "📧 Email Testing: http://localhost:8025"

dev-build: ## Build and start development environment
	@echo "🔨 Building development environment..."
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "✅ Development environment built and started!"

dev-down: ## Stop development environment
	@echo "🛑 Stopping development environment..."
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
	@echo "✅ Development environment stopped!"

# Production Commands
prod: ## Start production environment
	@echo "🚀 Starting production environment..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "✅ Production environment started!"
	@echo "🌐 Application: http://localhost"
	@echo "📊 Monitoring: http://localhost:3300"

prod-build: ## Build and start production environment
	@echo "🔨 Building production environment..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "✅ Production environment built and started!"

prod-down: ## Stop production environment
	@echo "🛑 Stopping production environment..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
	@echo "✅ Production environment stopped!"

# Build Commands
build: ## Build all Docker images
	@echo "🔨 Building all Docker images..."
	@docker-compose build --no-cache
	@echo "✅ All images built successfully!"

build-api: ## Build API service only
	@echo "🔨 Building API service..."
	@docker-compose build --no-cache api
	@echo "✅ API service built!"

build-web: ## Build web service only
	@echo "🔨 Building web service..."
	@docker-compose build --no-cache web
	@echo "✅ Web service built!"

# Utility Commands
logs: ## View logs from all services
	@docker-compose logs -f

logs-api: ## View API service logs
	@docker-compose logs -f api

logs-web: ## View web service logs
	@docker-compose logs -f web

logs-db: ## View database logs
	@docker-compose logs -f postgres

health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@docker-compose ps
	@echo ""
	@echo "🔍 Detailed health status:"
	@docker inspect --format='{{.Name}}: {{.State.Health.Status}}' $$(docker-compose ps -q) 2>/dev/null || echo "Health checks not available for all services"

# Database Commands
db-migrate: ## Run database migrations
	@echo "🗄️  Running database migrations..."
	@docker-compose exec api npm run db:migrate
	@echo "✅ Database migrations completed!"

db-seed: ## Seed database with initial data
	@echo "🌱 Seeding database..."
	@docker-compose exec api npm run db:seed
	@echo "✅ Database seeded successfully!"

db-reset: ## Reset database (WARNING: This will delete all data)
	@echo "⚠️  WARNING: This will delete all database data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		echo "🗄️  Resetting database..."; \
		docker-compose exec api npm run db:reset; \
		echo "✅ Database reset completed!"; \
	else \
		echo ""; \
		echo "❌ Database reset cancelled."; \
	fi

backup: ## Create database backup
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@docker-compose exec postgres pg_dump -U attaqwa_user attaqwa_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup created in backups/ directory!"

restore: ## Restore database from backup (specify BACKUP_FILE=filename)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Please specify BACKUP_FILE=filename"; \
		echo "Available backups:"; \
		ls -la backups/; \
		exit 1; \
	fi
	@echo "🔄 Restoring database from $(BACKUP_FILE)..."
	@docker-compose exec -T postgres psql -U attaqwa_user attaqwa_db < backups/$(BACKUP_FILE)
	@echo "✅ Database restored successfully!"

# Testing Commands
test: ## Run all tests
	@echo "🧪 Running all tests..."
	@docker-compose exec api npm test
	@docker-compose exec web npm test
	@echo "✅ All tests completed!"

test-api: ## Run API tests only
	@echo "🧪 Running API tests..."
	@docker-compose exec api npm test
	@echo "✅ API tests completed!"

test-web: ## Run web tests only
	@echo "🧪 Running web tests..."
	@docker-compose exec web npm test
	@echo "✅ Web tests completed!"

lint: ## Run linting on all packages
	@echo "🔍 Running linting..."
	@docker-compose exec api npm run lint
	@docker-compose exec web npm run lint
	@echo "✅ Linting completed!"

typecheck: ## Run TypeScript type checking
	@echo "🔍 Running type checks..."
	@docker-compose exec api npm run typecheck
	@docker-compose exec web npm run typecheck
	@echo "✅ Type checking completed!"

# Maintenance Commands
clean: ## Clean up Docker resources
	@echo "🧹 Cleaning up Docker resources..."
	@docker-compose down -v --remove-orphans
	@docker system prune -f
	@docker volume prune -f
	@echo "✅ Cleanup completed!"

clean-all: ## Clean up everything including images
	@echo "🧹 Cleaning up all Docker resources..."
	@docker-compose down -v --remove-orphans --rmi all
	@docker system prune -af
	@docker volume prune -f
	@echo "✅ Complete cleanup finished!"

update: ## Update to latest images
	@echo "📦 Updating to latest images..."
	@docker-compose pull
	@docker-compose build --no-cache
	@echo "✅ Update completed!"

restart: ## Restart all services
	@echo "🔄 Restarting all services..."
	@docker-compose restart
	@echo "✅ All services restarted!"

restart-api: ## Restart API service only
	@echo "🔄 Restarting API service..."
	@docker-compose restart api
	@echo "✅ API service restarted!"

restart-web: ## Restart web service only
	@echo "🔄 Restarting web service..."
	@docker-compose restart web
	@echo "✅ Web service restarted!"

# Islamic Feature Commands
prayer-times: ## Test prayer times API
	@echo "🕌 Testing Prayer Times API..."
	@curl -s "http://localhost:3001/api/islamic/prayer-times?latitude=40.7128&longitude=-74.0060" | jq '.' || echo "Please install jq for formatted output"

qibla: ## Test Qibla direction API
	@echo "🧭 Testing Qibla Direction API..."
	@curl -s "http://localhost:3001/api/islamic/qibla-direction?latitude=40.7128&longitude=-74.0060" | jq '.' || echo "Please install jq for formatted output"

# Monitoring Commands
stats: ## Show Docker container statistics
	@echo "📊 Container Statistics:"
	@docker stats --no-stream

monitor: ## Start monitoring dashboard
	@echo "📊 Starting monitoring dashboard..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d grafana prometheus loki
	@echo "✅ Monitoring dashboard started at http://localhost:3300"

# Security Commands
security-scan: ## Run security scan on images
	@echo "🔒 Running security scan..."
	@docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image attaqwa-api:latest || echo "Trivy not available, skipping security scan"
	@docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image attaqwa-web:latest || echo "Trivy not available, skipping security scan"

# Development Helpers
shell-api: ## Open shell in API container
	@docker-compose exec api sh

shell-web: ## Open shell in web container
	@docker-compose exec web sh

shell-db: ## Open database shell
	@docker-compose exec postgres psql -U attaqwa_user attaqwa_db

# Quick Setup Commands
setup: ## Quick setup for new developers
	@echo "🚀 Setting up Attaqwa Masjid development environment..."
	@echo "📋 Copying environment variables..."
	@cp -n .env.example .env || echo ".env already exists"
	@echo "🔨 Building development environment..."
	@make dev-build
	@echo "🗄️  Running database migrations..."
	@sleep 10 # Wait for database to be ready
	@make db-migrate
	@echo "🌱 Seeding database..."
	@make db-seed
	@echo "✅ Setup completed!"
	@echo ""
	@echo "🎉 Welcome to Attaqwa Masjid Digital Ecosystem!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔗 API: http://localhost:3001"
	@echo "🗄️  Database Admin: http://localhost:8080"
	@echo ""
	@echo "🤲 May Allah bless your contribution to the Muslim community!"

# Docker compose shortcuts
up: dev ## Alias for dev command
down: dev-down ## Alias for dev-down command
ps: ## Show running containers
	@docker-compose ps

# Environment info
info: ## Show environment information
	@echo "🏗️  Attaqwa Masjid Digital Ecosystem"
	@echo "===================================="
	@echo "Docker version: $$(docker --version)"
	@echo "Docker Compose version: $$(docker-compose --version)"
	@echo "Current environment: $$(grep NODE_ENV .env 2>/dev/null || echo 'Not set')"
	@echo "Services status:"
	@docker-compose ps