# General
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "checkup"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "owner_email" {
  description = "Email of project owner"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Networking
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24"]
}

variable "nat_instance_type" {
  description = "Instance type for NAT instance"
  type        = string
  default     = "t3.micro"
}

variable "nat_instance_ami" {
  description = "AMI ID for NAT instance"
  type        = string
  default     = "" # Will use latest Amazon Linux 2 if not specified
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
}

variable "ssh_cidr_blocks" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = [] # Restrict to your IP in production
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC flow logs"
  type        = bool
  default     = false # Set to true if needed for security auditing
}

# ECR
variable "enable_ecr_scanning" {
  description = "Enable ECR image scanning"
  type        = bool
  default     = true
}

variable "ecr_retention_count" {
  description = "Number of images to retain in ECR"
  type        = number
  default     = 10
}

# RDS
variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "rds_postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16.1"
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "checkup"
}

variable "database_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
}

variable "rds_backup_retention_days" {
  description = "Number of days to retain RDS backups"
  type        = number
  default     = 7
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = false # Set to true for production
}

variable "rds_skip_final_snapshot" {
  description = "Skip final snapshot when destroying RDS"
  type        = bool
  default     = false # Set to true for dev/testing environments
}

variable "rds_deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = true
}

variable "enable_rds_cloudwatch_logs" {
  description = "Enable CloudWatch logs for RDS"
  type        = bool
  default     = true
}

variable "enable_rds_performance_insights" {
  description = "Enable Performance Insights for RDS"
  type        = bool
  default     = false # Free tier has 7 days retention
}

# ECS
variable "backend_image_tag" {
  description = "Backend container image tag"
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Frontend container image tag"
  type        = string
  default     = "latest"
}

variable "backend_cpu" {
  description = "CPU units for backend task"
  type        = number
  default     = 256 # 0.25 vCPU
}

variable "backend_memory" {
  description = "Memory for backend task in MB"
  type        = number
  default     = 512 # 0.5 GB
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 1
}

variable "backend_min_count" {
  description = "Minimum number of backend tasks"
  type        = number
  default     = 1
}

variable "backend_max_count" {
  description = "Maximum number of backend tasks"
  type        = number
  default     = 10
}

variable "frontend_cpu" {
  description = "CPU units for frontend task"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend task in MB"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 1
}

variable "frontend_min_count" {
  description = "Minimum number of frontend tasks"
  type        = number
  default     = 1
}

variable "frontend_max_count" {
  description = "Maximum number of frontend tasks"
  type        = number
  default     = 10
}

variable "enable_ecs_autoscaling" {
  description = "Enable auto-scaling for ECS services"
  type        = bool
  default     = true
}

variable "ecs_autoscaling_cpu_threshold" {
  description = "CPU utilization threshold for auto-scaling"
  type        = number
  default     = 70
}

variable "ecs_autoscaling_memory_threshold" {
  description = "Memory utilization threshold for auto-scaling"
  type        = number
  default     = 80
}

variable "ecs_log_retention_days" {
  description = "CloudWatch logs retention in days"
  type        = number
  default     = 7
}

variable "enable_container_insights" {
  description = "Enable Container Insights"
  type        = bool
  default     = false # Additional cost beyond free tier
}

variable "enable_ecs_exec" {
  description = "Enable ECS Exec for debugging"
  type        = bool
  default     = false # Enable only when needed for troubleshooting
}

# EC2 nginx
variable "nginx_instance_type" {
  description = "Instance type for nginx proxy"
  type        = string
  default     = "t3.micro"
}

variable "nginx_root_volume_size" {
  description = "Root volume size for nginx instance in GB"
  type        = number
  default     = 20
}

variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

# Monitoring
variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = false # Additional cost
}

variable "enable_cloudwatch_alarms" {
  description = "Enable CloudWatch alarms"
  type        = bool
  default     = true
}

# CorpPass Configuration
variable "enable_mockpass" {
  description = "Enable MockPass for CorpPass simulation (dev/test only, disable for production)"
  type        = bool
  default     = true # Enable by default for dev environment
}

variable "cors_origin" {
  description = "CORS origin URL for frontend (e.g., https://your-domain.com)"
  type        = string
  default     = "" # Will be set based on nginx public DNS if empty
}

variable "corppass_client_id" {
  description = "CorpPass OAuth client ID (register your app with Singapore CorpPass)"
  type        = string
  default     = "checkup-app"
}

variable "corppass_issuer" {
  description = "CorpPass OIDC issuer URL (production: https://corppass.gov.sg)"
  type        = string
  default     = "https://corppass.gov.sg/corppass/v2"
}

variable "corppass_authorize_url" {
  description = "CorpPass authorization endpoint URL"
  type        = string
  default     = "https://corppass.gov.sg/corppass/v2/auth"
}

variable "corppass_token_url" {
  description = "CorpPass token endpoint URL"
  type        = string
  default     = "https://corppass.gov.sg/corppass/v2/token"
}

variable "corppass_jwks_url" {
  description = "CorpPass JWKS endpoint URL"
  type        = string
  default     = "https://corppass.gov.sg/corppass/v2/.well-known/keys"
}

variable "corppass_callback_url" {
  description = "CorpPass OAuth callback URL for backend (will be constructed from nginx DNS)"
  type        = string
  default     = "" # Will be set based on nginx public DNS
}

variable "corppass_frontend_callback_url" {
  description = "CorpPass frontend callback URL (will be constructed from nginx DNS)"
  type        = string
  default     = "" # Will be set based on nginx public DNS
}

variable "ecs_instance_type" {
  description = "EC2 instance type for ECS cluster nodes (e.g., t2.micro for free tier)"
  type        = string
}
