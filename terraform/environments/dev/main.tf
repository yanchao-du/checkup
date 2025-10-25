terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # Backend configuration for storing Terraform state in S3
  # Run `terraform init` after creating the S3 bucket
  backend "s3" {
    bucket         = "checkup-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "checkup-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = var.owner_email
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# JWT Secret in SSM Parameter Store
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/${var.project_name}/${var.environment}/jwt/secret"
  description = "JWT secret for authentication"
  type        = "SecureString"
  value       = random_password.jwt_secret.result

  tags = {
    Component = "auth"
  }
}

# Networking Module
module "networking" {
  source = "../../modules/networking"

  project_name         = var.project_name
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs

  nat_instance_type = var.nat_instance_type
  nat_instance_ami  = var.nat_instance_ami
  key_name          = var.key_name
  ssh_cidr_blocks   = var.ssh_cidr_blocks

  enable_flow_logs = var.enable_vpc_flow_logs

  tags = var.common_tags
}

# ECR Module
module "ecr" {
  source = "../../modules/ecr"

  project_name           = var.project_name
  enable_image_scanning  = var.enable_ecr_scanning
  image_retention_count  = var.ecr_retention_count

  tags = var.common_tags
}

# RDS Module
module "rds" {
  source = "../../modules/rds"

  project_name         = var.project_name
  environment          = var.environment
  database_subnet_ids  = module.networking.database_subnet_ids
  security_group_id    = module.networking.security_group_rds

  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_allocated_storage
  postgres_version        = var.rds_postgres_version
  database_name           = var.database_name
  database_username       = var.database_username
  backup_retention_days   = var.rds_backup_retention_days
  multi_az                = var.rds_multi_az
  skip_final_snapshot     = var.rds_skip_final_snapshot
  deletion_protection     = var.rds_deletion_protection

  enable_cloudwatch_logs      = var.enable_rds_cloudwatch_logs
  enable_performance_insights = var.enable_rds_performance_insights
  enable_cloudwatch_alarms    = var.enable_cloudwatch_alarms

  tags = var.common_tags

  depends_on = [module.networking]
}

# ECS Module
module "ecs" {
  source = "../../modules/ecs"

  project_name       = var.project_name
  environment        = var.environment
  aws_region         = data.aws_region.current.name
  aws_account_id     = data.aws_caller_identity.current.account_id
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  ecs_security_group_id = module.networking.security_group_ecs_tasks
  ecr_read_policy_arn   = module.ecr.ecr_read_policy_arn

  # Database SSM parameters
  db_host_ssm_parameter     = module.rds.db_host_ssm_parameter
  db_port_ssm_parameter     = module.rds.db_port_ssm_parameter
  db_name_ssm_parameter     = module.rds.db_name_ssm_parameter
  db_username_ssm_parameter = module.rds.db_username_ssm_parameter
  db_password_ssm_parameter = module.rds.db_password_ssm_parameter
  jwt_secret_ssm_parameter  = aws_ssm_parameter.jwt_secret.name

  # Container images
  backend_image_url  = module.ecr.backend_repository_url
  backend_image_tag  = var.backend_image_tag
  frontend_image_url = module.ecr.frontend_repository_url
  frontend_image_tag = var.frontend_image_tag
  backend_api_url    = "http://${module.ec2_nginx.public_dns}"

  # Task configuration
  backend_cpu            = var.backend_cpu
  backend_memory         = var.backend_memory
  backend_desired_count  = var.backend_desired_count
  backend_min_count      = var.backend_min_count
  backend_max_count      = var.backend_max_count

  frontend_cpu           = var.frontend_cpu
  frontend_memory        = var.frontend_memory
  frontend_desired_count = var.frontend_desired_count
  frontend_min_count     = var.frontend_min_count
  frontend_max_count     = var.frontend_max_count

  # Auto-scaling
  enable_autoscaling           = var.enable_ecs_autoscaling
  autoscaling_cpu_threshold    = var.ecs_autoscaling_cpu_threshold
  autoscaling_memory_threshold = var.ecs_autoscaling_memory_threshold

  # Monitoring
  log_retention_days       = var.ecs_log_retention_days
  enable_container_insights = var.enable_container_insights
  enable_ecs_exec          = var.enable_ecs_exec

  tags = var.common_tags

  depends_on = [module.networking, module.ecr, module.rds]
}

# EC2 nginx Module
module "ec2_nginx" {
  source = "../../modules/ec2-nginx"

  project_name      = var.project_name
  environment       = var.environment
  public_subnet_id  = module.networking.public_subnet_ids[0]
  security_group_id = module.networking.security_group_nginx
  key_name          = var.key_name

  instance_type          = var.nginx_instance_type
  root_volume_size       = var.nginx_root_volume_size
  backend_service_dns    = "backend.${module.ecs.service_discovery_namespace_name}"
  frontend_service_dns   = "frontend.${module.ecs.service_discovery_namespace_name}"
  domain_name            = var.domain_name

  enable_detailed_monitoring = var.enable_detailed_monitoring
  enable_cloudwatch_alarms   = var.enable_cloudwatch_alarms

  tags = var.common_tags

  depends_on = [module.networking, module.ecs]
}
