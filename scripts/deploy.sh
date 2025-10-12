#!/bin/bash

# Deployment script for Guanacaste Real Estate Platform
# Handles staging and production deployments with rollback capabilities

set -euo pipefail

# Configuration
PROJECT_NAME="guanacaste-real"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-your-registry.com/guanacaste}"
ENVIRONMENT="${1:-staging}"
ROLLBACK="${ROLLBACK:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        staging|production)
            log_info "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
            exit 1
            ;;
    esac
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running"
        exit 1
    fi

    # Check if required environment variables are set
    required_vars=("DOCKER_REGISTRY" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done

    # Run tests
    log_info "Running test suite..."
    if ! npm run test:ci; then
        log_error "Tests failed. Aborting deployment."
        exit 1
    fi

    # Security scan
    log_info "Running security scan..."
    if ! npm run security:scan; then
        log_warning "Security scan found issues. Review before proceeding."
    fi

    log_success "Pre-deployment checks passed"
}

# Build Docker image
build_image() {
    local tag="${DOCKER_REGISTRY}:${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
    local latest_tag="${DOCKER_REGISTRY}:${ENVIRONMENT}-latest"

    log_info "Building Docker image: $tag"

    # Build with build cache
    docker build \
        --target runtime \
        --tag "$tag" \
        --tag "$latest_tag" \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        --cache-from "$latest_tag" \
        --label "org.opencontainers.image.created=$(date -Iseconds)" \
        --label "org.opencontainers.image.revision=$(git rev-parse HEAD)" \
        --label "org.opencontainers.image.version=$(git describe --tags --always)" \
        .

    # Push to registry
    log_info "Pushing image to registry..."
    docker push "$tag"
    docker push "$latest_tag"

    echo "$tag" > .deploy-tag
    log_success "Image built and pushed: $tag"
}

# Deploy to AWS ECS
deploy_to_ecs() {
    local image_tag
    image_tag=$(cat .deploy-tag)

    log_info "Deploying to ECS cluster: guanacaste-$ENVIRONMENT"

    # Update ECS service
    aws ecs update-service \
        --cluster "guanacaste-$ENVIRONMENT" \
        --service "guanacaste-web" \
        --force-new-deployment \
        --region us-east-1

    # Wait for deployment to complete
    log_info "Waiting for deployment to complete..."
    aws ecs wait services-stable \
        --cluster "guanacaste-$ENVIRONMENT" \
        --services "guanacaste-web" \
        --region us-east-1

    log_success "ECS deployment completed"
}

# Run smoke tests
run_smoke_tests() {
    local base_url

    case $ENVIRONMENT in
        staging)
            base_url="https://staging.guanacastereal.com"
            ;;
        production)
            base_url="https://guanacastereal.com"
            ;;
    esac

    log_info "Running smoke tests against $base_url"

    # Health check
    if ! curl -f --max-time 30 "$base_url/api/health"; then
        log_error "Health check failed"
        return 1
    fi

    # Basic page load
    if ! curl -f --max-time 30 "$base_url" >/dev/null; then
        log_error "Basic page load failed"
        return 1
    fi

    # API endpoints
    if ! curl -f --max-time 30 "$base_url/api/health/ready"; then
        log_error "Readiness check failed"
        return 1
    fi

    log_success "Smoke tests passed"
}

# Rollback deployment
rollback_deployment() {
    log_warning "Rolling back deployment..."

    # Get previous task definition
    local previous_task_def
    previous_task_def=$(aws ecs describe-services \
        --cluster "guanacaste-$ENVIRONMENT" \
        --services "guanacaste-web" \
        --region us-east-1 \
        --query 'services[0].taskDefinition' \
        --output text)

    # Rollback to previous version
    aws ecs update-service \
        --cluster "guanacaste-$ENVIRONMENT" \
        --service "guanacaste-web" \
        --task-definition "$previous_task_def" \
        --force-new-deployment \
        --region us-east-1

    log_success "Rollback initiated"
}

# Send notifications
send_notifications() {
    local status="$1"
    local message="$2"

    log_info "Sending deployment notifications..."

    # Send to Slack (if configured)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Guanacaste Deployment: $status\\n$message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi

    # Create GitHub deployment status
    if [[ -n "${GITHUB_TOKEN:-}" ]]; then
        curl -X POST \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/${GITHUB_REPOSITORY}/deployments/${GITHUB_RUN_ID}/statuses" \
            -d "{\"state\":\"$status\",\"description\":\"$message\"}"
    fi
}

# Main deployment function
main() {
    log_info "Starting deployment to $ENVIRONMENT environment"

    # Validate environment
    validate_environment

    # Handle rollback
    if [[ "$ROLLBACK" == "true" ]]; then
        rollback_deployment
        send_notifications "inactive" "Deployment rolled back"
        exit 0
    fi

    # Pre-deployment checks
    pre_deployment_checks

    # Build and push image
    build_image

    # Deploy to ECS
    deploy_to_ecs

    # Run smoke tests
    if ! run_smoke_tests; then
        log_error "Smoke tests failed. Initiating rollback..."
        rollback_deployment
        send_notifications "failure" "Deployment failed - rolled back"
        exit 1
    fi

    # Success
    log_success "Deployment to $ENVIRONMENT completed successfully!"
    send_notifications "success" "Deployment completed successfully"

    # Cleanup
    rm -f .deploy-tag
}

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --rollback)
            ROLLBACK=true
            shift
            ;;
        --environment=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Usage: $0 [staging|production] [--rollback]"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"