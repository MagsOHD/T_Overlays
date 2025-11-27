# ==============================================
# Makefile - Esports Tournament Platform
# Hybrid Laravel 11 / NestJS Architecture
# ==============================================

.PHONY: help setup up down restart logs clean install migrate seed test

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Esports Tournament Platform - Development Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ==============================================
# Docker Commands
# ==============================================

setup: ## Initial setup (first time only)
	@echo "$(BLUE)Setting up the project...$(NC)"
	@cp .env.example .env 2>/dev/null || echo ".env already exists"
	@docker-compose build
	@make install
	@make migrate
	@make seed
	@echo "$(GREEN)Setup complete!$(NC)"

up: ## Start all services
	@echo "$(BLUE)Starting all services...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)Services started!$(NC)"
	@echo ""
	@echo "$(YELLOW)Available services:$(NC)"
	@echo "  Frontend:        http://localhost:3000"
	@echo "  Laravel API:     http://localhost:8000"
	@echo "  NestJS WebSocket: ws://localhost:3001"
	@echo "  Nginx Gateway:   http://localhost:80"
	@echo "  pgAdmin:         http://localhost:5050"
	@echo "  Redis Commander: http://localhost:8081"

down: ## Stop all services
	@echo "$(BLUE)Stopping all services...$(NC)"
	@docker-compose down
	@echo "$(GREEN)Services stopped!$(NC)"

restart: ## Restart all services
	@make down
	@make up

logs: ## Show logs from all services
	@docker-compose logs -f

logs-laravel: ## Show Laravel logs
	@docker-compose logs -f laravel

logs-nestjs: ## Show NestJS logs
	@docker-compose logs -f nestjs

logs-frontend: ## Show Frontend logs
	@docker-compose logs -f frontend

# ==============================================
# Installation Commands
# ==============================================

install: ## Install all dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	@docker-compose exec laravel composer install
	@docker-compose exec nestjs npm install
	@docker-compose exec frontend npm install
	@echo "$(GREEN)Dependencies installed!$(NC)"

install-laravel: ## Install Laravel dependencies
	@docker-compose exec laravel composer install

install-nestjs: ## Install NestJS dependencies
	@docker-compose exec nestjs npm install

install-frontend: ## Install Frontend dependencies
	@docker-compose exec frontend npm install

# ==============================================
# Database Commands
# ==============================================

migrate: ## Run Laravel migrations
	@echo "$(BLUE)Running migrations...$(NC)"
	@docker-compose exec laravel php artisan migrate --force
	@echo "$(GREEN)Migrations complete!$(NC)"

migrate-fresh: ## Fresh migration (WARNING: drops all tables)
	@echo "$(RED)WARNING: This will drop all tables!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose exec laravel php artisan migrate:fresh --force; \
	fi

seed: ## Seed the database
	@echo "$(BLUE)Seeding database...$(NC)"
	@docker-compose exec laravel php artisan db:seed
	@echo "$(GREEN)Database seeded!$(NC)"

db-refresh: ## Fresh migration + seed
	@make migrate-fresh
	@make seed

# ==============================================
# Laravel Commands
# ==============================================

laravel-key: ## Generate Laravel APP_KEY
	@docker-compose exec laravel php artisan key:generate

laravel-cache: ## Clear all Laravel caches
	@docker-compose exec laravel php artisan cache:clear
	@docker-compose exec laravel php artisan config:clear
	@docker-compose exec laravel php artisan route:clear
	@docker-compose exec laravel php artisan view:clear

laravel-optimize: ## Optimize Laravel
	@docker-compose exec laravel php artisan optimize
	@docker-compose exec laravel php artisan config:cache
	@docker-compose exec laravel php artisan route:cache

laravel-admin: ## Create Filament admin user
	@docker-compose exec laravel php artisan make:filament-user

laravel-queue: ## Start Laravel queue worker
	@docker-compose exec laravel php artisan queue:work --verbose

laravel-tinker: ## Open Laravel Tinker REPL
	@docker-compose exec laravel php artisan tinker

# ==============================================
# Testing Commands
# ==============================================

test: ## Run all tests
	@make test-laravel
	@make test-nestjs
	@make test-frontend

test-laravel: ## Run Laravel tests
	@echo "$(BLUE)Running Laravel tests...$(NC)"
	@docker-compose exec laravel php artisan test

test-nestjs: ## Run NestJS tests
	@echo "$(BLUE)Running NestJS tests...$(NC)"
	@docker-compose exec nestjs npm run test

test-frontend: ## Run Frontend tests
	@echo "$(BLUE)Running Frontend tests...$(NC)"
	@docker-compose exec frontend npm run test -- --watchAll=false

# ==============================================
# Code Quality
# ==============================================

lint: ## Lint all code
	@docker-compose exec laravel ./vendor/bin/pint
	@docker-compose exec nestjs npm run lint
	@docker-compose exec frontend npm run lint

format: ## Format all code
	@docker-compose exec laravel ./vendor/bin/pint
	@docker-compose exec nestjs npm run format
	@docker-compose exec frontend npm run format

# ==============================================
# Shell Access
# ==============================================

shell-laravel: ## Shell into Laravel container
	@docker-compose exec laravel sh

shell-nestjs: ## Shell into NestJS container
	@docker-compose exec nestjs sh

shell-frontend: ## Shell into Frontend container
	@docker-compose exec frontend sh

shell-postgres: ## Shell into PostgreSQL container
	@docker-compose exec postgres psql -U esports_user -d esports_tournament

shell-redis: ## Shell into Redis container
	@docker-compose exec redis redis-cli

# ==============================================
# Monitoring
# ==============================================

stats: ## Show Docker container stats
	@docker stats

ps: ## Show running containers
	@docker-compose ps

# ==============================================
# Cleanup
# ==============================================

clean: ## Clean all containers, volumes, and networks
	@echo "$(RED)WARNING: This will remove all containers, volumes, and networks!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --remove-orphans; \
		docker system prune -af; \
	fi

clean-cache: ## Clean all caches
	@docker-compose exec laravel php artisan cache:clear
	@docker-compose exec laravel php artisan config:clear
	@docker-compose exec redis redis-cli FLUSHALL

# ==============================================
# Production
# ==============================================

build-prod: ## Build production images
	@echo "$(BLUE)Building production images...$(NC)"
	@docker-compose -f docker-compose.prod.yml build
	@echo "$(GREEN)Production images built!$(NC)"

deploy: ## Deploy to production
	@echo "$(BLUE)Deploying to production...$(NC)"
	@docker-compose -f docker-compose.prod.yml up -d
	@make laravel-optimize
	@echo "$(GREEN)Deployed!$(NC)"

# ==============================================
# Quick Start
# ==============================================

dev: ## Quick start development environment
	@make up
	@echo ""
	@echo "$(GREEN)Development environment is ready!$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Create admin user: make laravel-admin"
	@echo "  2. Start queue worker: make laravel-queue"
	@echo "  3. View logs: make logs"
