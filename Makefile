# Makefile for E-commerce Project

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

# Default environment
ENV ?= dev

.PHONY: help install start stop restart logs clean reset-db migrate seed status backup restore

help: ## Show this help message
	@echo "$(BLUE)E-commerce Project Management$(NC)"
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies and setup environment
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install
	@echo "$(YELLOW)Copying environment file...$(NC)"
	cp .env.example .env.local
	@echo "$(GREEN)Installation complete! Please update .env.local with your configuration.$(NC)"

start: ## Start all services
	@echo "$(YELLOW)Starting services in $(ENV) environment...$(NC)"
ifeq ($(ENV),prod)
	docker-compose up -d
else
	docker-compose -f docker-compose.dev.yml up -d
endif
	@echo "$(GREEN)Services started successfully!$(NC)"
	@make status

stop: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
ifeq ($(ENV),prod)
	docker-compose down
else
	docker-compose -f docker-compose.dev.yml down
endif
	@echo "$(GREEN)Services stopped successfully!$(NC)"

restart: stop start ## Restart all services

logs: ## View logs from all services
	@echo "$(YELLOW)Showing logs (press Ctrl+C to exit)...$(NC)"
ifeq ($(ENV),prod)
	docker-compose logs -f
else
	docker-compose -f docker-compose.dev.yml logs -f
endif

logs-db: ## View database logs only
	@echo "$(YELLOW)Showing database logs...$(NC)"
ifeq ($(ENV),prod)
	docker-compose logs -f postgres
else
	docker-compose -f docker-compose.dev.yml logs -f postgres
endif

clean: ## Remove all containers, volumes, and images
	@echo "$(RED)Warning: This will remove all data! Press Ctrl+C to cancel or Enter to continue...$(NC)"
	@read
	docker-compose -f docker-compose.yml down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"

reset-db: ## Reset database (WARNING: This will delete all data!)
	@echo "$(RED)Warning: This will delete all database data! Press Ctrl+C to cancel or Enter to continue...$(NC)"
	@read
	@echo "$(YELLOW)Resetting database...$(NC)"
ifeq ($(ENV),prod)
	docker-compose down postgres
	docker volume rm $$(docker volume ls -q | grep postgres)
	docker-compose up -d postgres
else
	docker-compose -f docker-compose.dev.yml down postgres
	docker volume rm $$(docker volume ls -q | grep postgres_dev)
	docker-compose -f docker-compose.dev.yml up -d postgres
endif
	@echo "$(GREEN)Database reset complete!$(NC)"

migrate: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(NC)"
	npx prisma generate
	npx prisma db push
	@echo "$(GREEN)Migrations complete!$(NC)"

migrate-reset: ## Reset and re-run migrations
	@echo "$(YELLOW)Resetting migrations...$(NC)"
	npx prisma migrate reset --force
	@echo "$(GREEN)Migration reset complete!$(NC)"

seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(NC)"
	npx prisma db seed
	@echo "$(GREEN)Database seeded successfully!$(NC)"

status: ## Show status of all services
	@echo "$(BLUE)Service Status:$(NC)"
ifeq ($(ENV),prod)
	docker-compose ps
else
	docker-compose -f docker-compose.dev.yml ps
endif
	@echo ""
	@echo "$(BLUE)Access URLs:$(NC)"
ifeq ($(ENV),prod)
	@echo "  $(GREEN)pgAdmin:$(NC)      http://localhost:8080"
	@echo "  $(GREEN)Redis Commander:$(NC) http://localhost:8081"
	@echo "  $(GREEN)PostgreSQL:$(NC)  localhost:5432"
	@echo "  $(GREEN)Redis:$(NC)       localhost:6379"
else
	@echo "  $(GREEN)pgAdmin:$(NC)      http://localhost:8082"
	@echo "  $(GREEN)Redis Commander:$(NC) http://localhost:8083"
	@echo "  $(GREEN)MailHog:$(NC)     http://localhost:8025"
	@echo "  $(GREEN)PostgreSQL:$(NC)  localhost:5433"
	@echo "  $(GREEN)Redis:$(NC)       localhost:6380"
endif

backup: ## Create database backup
	@echo "$(YELLOW)Creating database backup...$(NC)"
	mkdir -p backups
ifeq ($(ENV),prod)
	docker exec ecommerce_postgres pg_dump -U postgres ecommerce_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
else
	docker exec ecommerce_postgres_dev pg_dump -U postgres ecommerce_db_dev > backups/backup_dev_$$(date +%Y%m%d_%H%M%S).sql
endif
	@echo "$(GREEN)Backup created successfully!$(NC)"

restore: ## Restore database from backup (specify BACKUP_FILE=filename)
ifndef BACKUP_FILE
	@echo "$(RED)Error: Please specify BACKUP_FILE=filename$(NC)"
	@echo "Example: make restore BACKUP_FILE=backups/backup_20231120_143022.sql"
	@exit 1
endif
	@echo "$(YELLOW)Restoring database from $(BACKUP_FILE)...$(NC)"
ifeq ($(ENV),prod)
	docker exec -i ecommerce_postgres psql -U postgres -d ecommerce_db < $(BACKUP_FILE)
else
	docker exec -i ecommerce_postgres_dev psql -U postgres -d ecommerce_db_dev < $(BACKUP_FILE)
endif
	@echo "$(GREEN)Database restored successfully!$(NC)"

dev-setup: install start migrate seed ## Complete development setup
	@echo "$(GREEN)Development environment setup complete!$(NC)"
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Update .env.local with your configuration"
	@echo "  2. Run 'npm run dev' to start the Next.js application"
	@echo "  3. Access pgAdmin at http://localhost:8082"

prod-setup: ## Production environment setup
	@echo "$(YELLOW)Setting up production environment...$(NC)"
	ENV=prod make start
	ENV=prod make migrate
	@echo "$(GREEN)Production environment setup complete!$(NC)"

test-db: ## Test database connection
	@echo "$(YELLOW)Testing database connection...$(NC)"
ifeq ($(ENV),prod)
	docker exec ecommerce_postgres psql -U postgres -d ecommerce_db -c "SELECT version();"
else
	docker exec ecommerce_postgres_dev psql -U postgres -d ecommerce_db_dev -c "SELECT version();"
endif
	@echo "$(GREEN)Database connection successful!$(NC)"

monitoring: ## Show resource usage
	@echo "$(BLUE)Container Resource Usage:$(NC)"
	docker stats --no-stream

update: ## Update all images
	@echo "$(YELLOW)Updating Docker images...$(NC)"
	docker-compose pull
	docker-compose -f docker-compose.dev.yml pull
	@echo "$(GREEN)Images updated successfully!$(NC)"