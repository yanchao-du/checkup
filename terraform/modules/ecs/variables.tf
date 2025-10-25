variable "project_name" {
  description = "Project name to use for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "ecr_read_policy_arn" {
  description = "ARN of ECR read policy"
  type        = string
}

# Database SSM Parameters
variable "db_host_ssm_parameter" {
  description = "SSM parameter name for database host"
  type        = string
}

variable "db_port_ssm_parameter" {
  description = "SSM parameter name for database port"
  type        = string
}

variable "db_name_ssm_parameter" {
  description = "SSM parameter name for database name"
  type        = string
}

variable "db_username_ssm_parameter" {
  description = "SSM parameter name for database username"
  type        = string
}

variable "db_password_ssm_parameter" {
  description = "SSM parameter name for database password"
  type        = string
}

variable "jwt_secret_ssm_parameter" {
  description = "SSM parameter name for JWT secret"
  type        = string
}

variable "database_url_ssm_parameter" {
  description = "SSM parameter name for full DATABASE_URL connection string"
  type        = string
}

variable "corppass_client_secret_ssm_parameter" {
  description = "SSM parameter name for CorpPass client secret"
  type        = string
}

# CorpPass Configuration
variable "cors_origin" {
  description = "CORS origin URL for frontend"
  type        = string
}

variable "corppass_client_id" {
  description = "CorpPass OAuth client ID"
  type        = string
}

variable "corppass_issuer" {
  description = "CorpPass OIDC issuer URL"
  type        = string
}

variable "corppass_authorize_url" {
  description = "CorpPass authorization endpoint URL"
  type        = string
}

variable "corppass_token_url" {
  description = "CorpPass token endpoint URL"
  type        = string
}

variable "corppass_jwks_url" {
  description = "CorpPass JWKS (JSON Web Key Set) endpoint URL"
  type        = string
}

variable "corppass_callback_url" {
  description = "CorpPass OAuth callback URL for backend"
  type        = string
}

variable "corppass_frontend_callback_url" {
  description = "CorpPass callback URL for frontend redirect"
  type        = string
}

# MockPass Configuration (for dev/testing environments)
variable "enable_mockpass" {
  description = "Enable MockPass service for CorpPass simulation (dev/test only)"
  type        = bool
  default     = false
}

variable "mockpass_cpu" {
  description = "CPU units for MockPass task - not used in EC2 mode"
  type        = number
  default     = 256
}

variable "mockpass_memory" {
  description = "Memory for MockPass task in MB"
  type        = number
  default     = 256  # Reduced for t2.micro free tier (1 GB total)
}

# Container Images
variable "backend_image_url" {
  description = "URL of backend container image"
  type        = string
}

variable "backend_image_tag" {
  description = "Tag of backend container image"
  type        = string
  default     = "latest"
}

variable "frontend_image_url" {
  description = "URL of frontend container image"
  type        = string
}

variable "frontend_image_tag" {
  description = "Tag of frontend container image"
  type        = string
  default     = "latest"
}

variable "backend_api_url" {
  description = "Backend API URL for frontend"
  type        = string
}

# Backend Task Configuration
variable "backend_cpu" {
  description = "CPU units for backend task (256, 512, 1024, etc.) - not used in EC2 mode"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memory for backend task in MB"
  type        = number
  default     = 256  # Reduced for t2.micro free tier (1 GB total)
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 1
}

variable "backend_min_count" {
  description = "Minimum number of backend tasks for autoscaling"
  type        = number
  default     = 1
}

variable "backend_max_count" {
  description = "Maximum number of backend tasks for autoscaling"
  type        = number
  default     = 10
}

# Frontend Task Configuration
variable "frontend_cpu" {
  description = "CPU units for frontend task - not used in EC2 mode"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend task in MB"
  type        = number
  default     = 256  # Reduced for t2.micro free tier (1 GB total)
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 1
}

variable "frontend_min_count" {
  description = "Minimum number of frontend tasks for autoscaling"
  type        = number
  default     = 1
}

variable "frontend_max_count" {
  description = "Maximum number of frontend tasks for autoscaling"
  type        = number
  default     = 10
}

# Auto Scaling
variable "enable_autoscaling" {
  description = "Enable auto scaling for ECS services"
  type        = bool
  default     = true
}

variable "autoscaling_cpu_threshold" {
  description = "CPU utilization threshold for scaling"
  type        = number
  default     = 70
}

variable "autoscaling_memory_threshold" {
  description = "Memory utilization threshold for scaling"
  type        = number
  default     = 80
}

# ECS EC2 Instance Configuration
variable "ecs_instance_type" {
  description = "EC2 instance type for ECS container instances"
  type        = string
  default     = "t2.micro" # Free tier eligible
}

variable "ecs_instance_desired_count" {
  description = "Desired number of EC2 instances in the ECS cluster"
  type        = number
  default     = 1
}

variable "ecs_instance_min_count" {
  description = "Minimum number of EC2 instances in the ECS cluster"
  type        = number
  default     = 1
}

variable "ecs_instance_max_count" {
  description = "Maximum number of EC2 instances in the ECS cluster"
  type        = number
  default     = 2
}

# Logging and Monitoring
variable "log_retention_days" {
  description = "CloudWatch logs retention in days"
  type        = number
  default     = 7
}

variable "enable_container_insights" {
  description = "Enable Container Insights for ECS cluster"
  type        = bool
  default     = false
}

variable "enable_ecs_exec" {
  description = "Enable ECS Exec for debugging"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
