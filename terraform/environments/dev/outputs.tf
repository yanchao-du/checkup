# General outputs
output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

# Networking outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "nat_instance_public_ip" {
  description = "Public IP of NAT instance"
  value       = module.networking.nat_instance_public_ip
}

# ECR outputs
output "backend_repository_url" {
  description = "Backend ECR repository URL"
  value       = module.ecr.backend_repository_url
}

output "frontend_repository_url" {
  description = "Frontend ECR repository URL"
  value       = module.ecr.frontend_repository_url
}

# RDS outputs
output "db_endpoint" {
  description = "RDS database endpoint"
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "db_name" {
  description = "Database name"
  value       = module.rds.db_name
}

# ECS outputs
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "backend_service_name" {
  description = "Backend ECS service name"
  value       = module.ecs.backend_service_name
}

output "frontend_service_name" {
  description = "Frontend ECS service name"
  value       = module.ecs.frontend_service_name
}

# nginx outputs
output "application_url" {
  description = "Application URL (nginx public IP)"
  value       = "http://${module.ec2_nginx.public_dns}"
}

output "nginx_public_ip" {
  description = "nginx instance public IP"
  value       = module.ec2_nginx.instance_public_ip
}

output "nginx_public_dns" {
  description = "nginx instance public DNS"
  value       = module.ec2_nginx.public_dns
}

# Deployment instructions
output "deployment_instructions" {
  description = "Instructions for deploying the application"
  value       = <<-EOT
    
    ========================================
    DEPLOYMENT INSTRUCTIONS
    ========================================
    
    1. Build and push Docker images to ECR:
       
       # Login to ECR
       aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${module.ecr.backend_repository_url}
       
       # Build and push backend
       cd backend
       docker build -t ${module.ecr.backend_repository_url}:latest .
       docker push ${module.ecr.backend_repository_url}:latest
       
       # Build and push frontend
       cd ../frontend
       docker build -t ${module.ecr.frontend_repository_url}:latest .
       docker push ${module.ecr.frontend_repository_url}:latest
    
    2. Update ECS services to use new images:
       
       aws ecs update-service --cluster ${module.ecs.cluster_name} --service ${module.ecs.backend_service_name} --force-new-deployment --region ${var.aws_region}
       aws ecs update-service --cluster ${module.ecs.cluster_name} --service ${module.ecs.frontend_service_name} --force-new-deployment --region ${var.aws_region}
    
    3. Access your application:
       
       URL: http://${module.ec2_nginx.public_dns}
       API: http://${module.ec2_nginx.public_dns}/api
    
    4. Monitor deployment:
       
       # Watch ECS services
       aws ecs describe-services --cluster ${module.ecs.cluster_name} --services ${module.ecs.backend_service_name} ${module.ecs.frontend_service_name} --region ${var.aws_region}
       
       # View logs
       aws logs tail /ecs/${var.project_name}-${var.environment} --follow --region ${var.aws_region}
    
    5. SSH to nginx instance (if needed):
       
       ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${module.ec2_nginx.instance_public_ip}
    
    ========================================
    EOT
}
