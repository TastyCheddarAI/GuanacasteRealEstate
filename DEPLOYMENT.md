# 🚀 Deployment Infrastructure - Guanacaste Real Estate Platform

This document outlines the comprehensive deployment infrastructure for the Guanacaste Real Estate Platform, including CI/CD pipelines, containerization, monitoring, and production deployment strategies.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [CI/CD Pipeline](#cicd-pipeline)
- [Containerization](#containerization)
- [Deployment Environments](#deployment-environments)
- [Monitoring & Observability](#monitoring--observability)
- [Security](#security)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

The platform uses a microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js Web   │    │     Supabase     │    │    Redis Cache  │
│    Application  │◄──►│   Database/API   │◄──►│   & Sessions    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Prometheus     │    │     Grafana     │
│  Load Balancer  │    │   Monitoring     │    │   Dashboards    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

- **Web Application**: Next.js 14 with TypeScript, React, and Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Cache**: Redis for session storage and API response caching
- **Reverse Proxy**: Nginx with SSL termination and load balancing
- **Monitoring**: Prometheus + Grafana + Loki stack
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions with automated testing and deployment

## 📋 Prerequisites

### System Requirements

- Docker & Docker Compose
- Node.js 18+
- AWS CLI (for production deployment)
- GitHub account with repository access

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Application
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis
REDIS_URL=redis://localhost:6379

# Monitoring
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3000
```

## 🛠️ Local Development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/guanacaste-real.git
   cd guanacaste-real
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development environment**
   ```bash
   # Start all services
   npm run docker:up

   # Or start individual services
   npm run dev                    # Next.js development server
   docker-compose up redis       # Redis only
   docker-compose up prometheus  # Monitoring stack
   ```

4. **Run tests**
   ```bash
   npm run test:unit           # Unit tests
   npm run test:integration    # Integration tests
   npm run test:e2e           # End-to-end tests
   npm run test:performance   # Performance tests
   ```

### Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run type-check      # TypeScript type checking
npm run lint            # Code linting

# Testing
npm run test            # Run all tests
npm run test:ci         # CI test suite with coverage

# Database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with test data
npm run db:reset        # Reset database

# Docker
npm run docker:build    # Build Docker image
npm run docker:run      # Run Docker container
npm run docker:up       # Start all Docker services
npm run docker:down     # Stop all Docker services
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Quality Assurance**
   - TypeScript type checking
   - ESLint code linting
   - Security vulnerability scanning
   - Unit and integration tests

2. **Security Scanning**
   - Trivy container vulnerability scanning
   - Dependency vulnerability checks
   - SAST (Static Application Security Testing)

3. **Build & Test**
   - Docker image building
   - Container testing
   - Performance testing

4. **Deployment**
   - Staging deployment
   - Production deployment with canary releases
   - Automated rollback on failures

### Deployment Environments

#### Staging Environment
```bash
npm run deploy:staging
```
- Automatic deployment on `develop` branch pushes
- Full test suite execution
- Smoke tests against staging URL
- Manual approval required for production

#### Production Environment
```bash
npm run deploy:production
```
- Automatic deployment on `main` branch pushes
- Blue-green deployment strategy
- Comprehensive smoke tests
- Automated rollback on failures

#### Rollback
```bash
npm run deploy:rollback
```
- Instant rollback to previous stable version
- Zero-downtime rollback process
- Automatic notification of rollback

## 🐳 Containerization

### Docker Configuration

The application uses multi-stage Docker builds for optimization:

```dockerfile
# Builder stage - dependencies and compilation
FROM node:18-alpine AS builder
RUN npm ci --only=production
COPY . .
RUN npm run build

# Runtime stage - production image
FROM node:18-alpine AS runtime
COPY --from=builder /app/apps/web/.next ./apps/web/.next
USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Docker Compose Services

```yaml
services:
  web:        # Main application
  redis:      # Caching and sessions
  nginx:      # Reverse proxy and load balancer
  prometheus: # Metrics collection
  grafana:    # Monitoring dashboards
  loki:       # Log aggregation
  promtail:   # Log shipping
```

### Container Management

```bash
# Build and run locally
docker-compose up --build

# Scale services
docker-compose up --scale web=3

# View logs
docker-compose logs -f web

# Execute commands in containers
docker-compose exec web npm run health:check
```

## 🌍 Deployment Environments

### Environment Configuration

Each environment has specific configuration:

- **Development**: Local development with hot reload
- **Staging**: Mirror of production for testing
- **Production**: Live environment with full monitoring

### Infrastructure as Code

The infrastructure is defined using:

- **Docker Compose**: Local development environment
- **AWS ECS**: Production container orchestration
- **CloudFormation**: Infrastructure provisioning
- **GitHub Actions**: CI/CD pipeline automation

### Scaling Strategy

- **Horizontal Scaling**: ECS service auto-scaling based on CPU/memory
- **Load Balancing**: Application Load Balancer with health checks
- **CDN**: CloudFront for static asset delivery
- **Database**: Supabase with connection pooling

## 📊 Monitoring & Observability

### Metrics Collection

The platform collects comprehensive metrics:

- **Application Metrics**: Response times, error rates, throughput
- **System Metrics**: CPU, memory, disk usage
- **Business Metrics**: Property views, lead conversions
- **Custom Metrics**: Cache hit rates, database query performance

### Monitoring Stack

#### Prometheus
- Scrapes metrics from all services
- Alerting rules for critical issues
- Long-term metrics storage

#### Grafana
- Pre-built dashboards for application monitoring
- Custom panels for business metrics
- Alert visualization and management

#### Loki
- Centralized log aggregation
- Structured logging with metadata
- Correlation with metrics

### Health Checks

Multiple health check endpoints:

```bash
# Basic health check
curl http://localhost:3000/api/health

# Readiness check
curl http://localhost:3000/api/health/ready

# Detailed health report
curl http://localhost:3000/api/health

# Prometheus metrics
curl http://localhost:3000/api/health/metrics
```

### Alerting

Critical alerts configured:

- Application downtime
- High error rates (>5%)
- Slow response times (>2s P95)
- Database connection issues
- Memory/CPU threshold breaches

## 🔒 Security

### Security Measures

- **Input Validation**: All user inputs validated and sanitized
- **Rate Limiting**: API endpoints protected with configurable limits
- **CSRF Protection**: One-time tokens for state-changing operations
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **SSL/TLS**: End-to-end encryption with Let's Encrypt certificates

### Security Scanning

Automated security scanning:

```bash
# Dependency vulnerabilities
npm run security:audit

# Container vulnerabilities
npm run security:scan

# SAST (Static Application Security Testing)
# Integrated into CI/CD pipeline
```

### Access Control

- **Role-Based Access**: Admin, Realtor, Buyer, Owner roles
- **API Authentication**: JWT tokens with refresh mechanism
- **Database Security**: Row Level Security (RLS) in Supabase
- **Network Security**: VPC isolation and security groups

## 💾 Backup & Recovery

### Database Backups

Automated backup strategy:

```bash
# Daily backups
npm run db:backup

# Point-in-time recovery
supabase db restore --timestamp "2024-01-01T12:00:00Z"
```

### Disaster Recovery

- **Multi-region deployment** capability
- **Automated failover** for critical services
- **Data replication** across availability zones
- **Backup retention** for 30 days

### Business Continuity

- **99.9% uptime SLA** target
- **Automated incident response** workflows
- **Communication protocols** for outages
- **Post-mortem analysis** for all incidents

## 🔧 Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check logs
npm run docker:logs

# Verify environment variables
cat .env

# Test database connection
npm run health:check
```

#### High Memory Usage
```bash
# Check memory metrics
curl http://localhost:9090/api/v1/query?query=process_resident_memory_bytes

# Restart services
docker-compose restart web
```

#### Slow Performance
```bash
# Check performance metrics
npm run health:metrics

# Analyze slow queries
# Check Grafana dashboards
```

### Debug Commands

```bash
# Full system health check
npm run health:check

# Database connection test
npm run db:migrate

# Cache status
docker-compose exec redis redis-cli ping

# Monitoring stack status
docker-compose ps
```

### Support

For deployment issues:

1. Check the monitoring dashboards
2. Review application logs
3. Check infrastructure status
4. Contact the DevOps team

---

## 🚀 Quick Deployment

For a complete production deployment:

```bash
# 1. Configure environment
cp .env.example .env.production
# Edit .env.production with production values

# 2. Run full test suite
npm run test:ci

# 3. Build and deploy
npm run deploy:production

# 4. Verify deployment
npm run health:check
npm run health:ready

# 5. Monitor
# Access Grafana at http://your-domain:3001
```

The platform is now ready for production deployment with enterprise-grade infrastructure, monitoring, and security! 🎉