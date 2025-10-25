#!/bin/bash
# Infrastructure Management Script
# Usage: ./manage-infra.sh [start|stop|status]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/environments/dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get infrastructure details
get_cluster_name() {
    terraform output -raw ecs_cluster_name 2>/dev/null
}

get_backend_service() {
    terraform output -raw backend_service_name 2>/dev/null
}

get_frontend_service() {
    terraform output -raw frontend_service_name 2>/dev/null
}

get_rds_instance() {
    echo "checkup-dev"
}

get_nginx_instance() {
    terraform output -json | jq -r '.nginx_instance_id.value // empty' 2>/dev/null
}

# Check if terraform is initialized
check_terraform() {
    if [ ! -d ".terraform" ]; then
        print_error "Terraform not initialized. Run 'terraform init' first."
        exit 1
    fi
}

# Start all services
start_services() {
    print_status "Starting infrastructure..."
    
    local cluster=$(get_cluster_name)
    local backend=$(get_backend_service)
    local frontend=$(get_frontend_service)
    local rds=$(get_rds_instance)
    local nginx=$(get_nginx_instance)
    
    # Start RDS
    print_status "Starting RDS database..."
    aws rds start-db-instance --db-instance-identifier "$rds" --region us-east-1 || print_warning "RDS might already be running"
    
    print_status "Waiting for RDS to become available (this may take 5-10 minutes)..."
    aws rds wait db-instance-available --db-instance-identifier "$rds" --region us-east-1
    print_status "RDS is now available"
    
    # Start EC2 instances if they exist
    if [ -n "$nginx" ]; then
        print_status "Starting nginx instance..."
        aws ec2 start-instances --instance-ids "$nginx" --region us-east-1
        
        print_status "Waiting for nginx instance to be running..."
        aws ec2 wait instance-running --instance-ids "$nginx" --region us-east-1
        print_status "nginx instance is now running"
    fi
    
    # Start ECS services
    print_status "Starting backend service..."
    aws ecs update-service \
        --cluster "$cluster" \
        --service "$backend" \
        --desired-count 1 \
        --region us-east-1 > /dev/null
    
    print_status "Starting frontend service..."
    aws ecs update-service \
        --cluster "$cluster" \
        --service "$frontend" \
        --desired-count 1 \
        --region us-east-1 > /dev/null
    
    print_status "All services started successfully!"
    print_status "Application URL: $(terraform output -raw application_url)"
    print_warning "ECS services may take 2-3 minutes to become healthy"
}

# Stop all services
stop_services() {
    print_status "Stopping infrastructure..."
    
    local cluster=$(get_cluster_name)
    local backend=$(get_backend_service)
    local frontend=$(get_frontend_service)
    local rds=$(get_rds_instance)
    local nginx=$(get_nginx_instance)
    
    # Stop ECS services
    print_status "Stopping backend service..."
    aws ecs update-service \
        --cluster "$cluster" \
        --service "$backend" \
        --desired-count 0 \
        --region us-east-1 > /dev/null
    
    print_status "Stopping frontend service..."
    aws ecs update-service \
        --cluster "$cluster" \
        --service "$frontend" \
        --desired-count 0 \
        --region us-east-1 > /dev/null
    
    # Wait for tasks to stop
    print_status "Waiting for ECS tasks to stop..."
    sleep 10
    
    # Stop EC2 instances
    if [ -n "$nginx" ]; then
        print_status "Stopping nginx instance..."
        aws ec2 stop-instances --instance-ids "$nginx" --region us-east-1 > /dev/null
    fi
    
    # Stop RDS
    print_status "Stopping RDS database..."
    aws rds stop-db-instance --db-instance-identifier "$rds" --region us-east-1 > /dev/null || print_warning "RDS might already be stopped"
    
    print_status "All services stopped successfully!"
    print_warning "RDS will automatically start again after 7 days of being stopped"
    print_status "Estimated cost while stopped: ~$0.20-0.50/day (RDS storage, EBS volumes)"
}

# Show status of all services
show_status() {
    print_status "Infrastructure Status"
    echo ""
    
    local cluster=$(get_cluster_name)
    local backend=$(get_backend_service)
    local frontend=$(get_frontend_service)
    local rds=$(get_rds_instance)
    
    # RDS Status
    echo "RDS Database:"
    aws rds describe-db-instances \
        --db-instance-identifier "$rds" \
        --region us-east-1 \
        --query 'DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address]' \
        --output table 2>/dev/null || echo "  Not found or not accessible"
    echo ""
    
    # ECS Services
    echo "ECS Services:"
    aws ecs describe-services \
        --cluster "$cluster" \
        --services "$backend" "$frontend" \
        --region us-east-1 \
        --query 'services[].[serviceName,status,runningCount,desiredCount]' \
        --output table 2>/dev/null || echo "  Not found or not accessible"
    echo ""
    
    # nginx Instance
    echo "nginx Instance:"
    terraform output -raw nginx_public_ip 2>/dev/null || echo "  Not available"
    echo ""
    
    # Application URL
    echo "Application URL:"
    terraform output -raw application_url 2>/dev/null || echo "  Not available"
    echo ""
}

# Show cost estimate
show_cost() {
    print_status "Cost Estimate"
    echo ""
    echo "When running (per hour):"
    echo "  - NAT Instance (t3.micro): ~$0.0084/hour"
    echo "  - nginx EC2 (t3.micro): Free tier (750 hrs/month)"
    echo "  - RDS db.t3.micro: Free tier (750 hrs/month)"
    echo "  - ECS Fargate: ~$0.01/hour (varies with usage)"
    echo "  - Total: ~$0.02/hour or ~$0.50/day"
    echo ""
    echo "When stopped:"
    echo "  - RDS storage: ~$0.115/day (20 GB at $1.73/GB/month)"
    echo "  - EBS volumes: ~$0.08/day"
    echo "  - Total: ~$0.20/day"
    echo ""
    echo "Part-time usage (3 days/month):"
    echo "  - Running: ~$1.50"
    echo "  - Stopped: ~$5.60"
    echo "  - Total: ~$7.10/month"
    echo ""
    echo "Full-time usage (720 hours/month):"
    echo "  - ~$15-25/month"
    echo ""
}

# Main script
main() {
    check_terraform
    
    case "${1:-}" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        status)
            show_status
            ;;
        cost)
            show_cost
            ;;
        *)
            echo "Usage: $0 {start|stop|status|cost}"
            echo ""
            echo "Commands:"
            echo "  start   - Start all infrastructure (RDS, EC2, ECS)"
            echo "  stop    - Stop all infrastructure to save costs"
            echo "  status  - Show current status of all services"
            echo "  cost    - Show cost estimates"
            exit 1
            ;;
    esac
}

main "$@"
