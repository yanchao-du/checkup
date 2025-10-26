Apply complete! Resources: 20 added, 2 changed, 3 destroyed.

Outputs:

application_url = "http://ec2-34-192-204-98.compute-1.amazonaws.com"
aws_region = "us-east-1"
backend_repository_url = "244203483886.dkr.ecr.us-east-1.amazonaws.com/checkup-backend"
backend_service_name = "checkup-backend-dev"
db_endpoint = <sensitive>
db_name = "checkup"
deployment_instructions = <<EOT
    
========================================
DEPLOYMENT INSTRUCTIONS
========================================
    
1. Build and push Docker images to ECR:
       
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 244203483886.dkr.ecr.us-east-1.amazonaws.com/checkup-backend
       
   # Build and push backend
   cd backend
   docker build --platform linux/amd64 -t 244203483886.dkr.ecr.us-east-1.amazonaws.com/checkup-backend:latest .
   docker push 244203483886.dkr.ecr.us-east-1.amazonaws.com/checkup-backend:latest
       
   # Build and push frontend
   cd ../frontend
   docker build --platform linux/amd64 -t 244203483886.dkr.ecr.us-east-1.amazonaws.com/checkup-frontend:latest .
   docker push 244203483886.dkr.ecr.us-east-1.amazonaws.com/checkup-frontend:latest

   # Build and push mockpass
   cd ../backend
   docker build --platform linux/amd64 -f Dockerfile.mockpass -t 244203483886.dkr.ecr.us-east-1.amazonaws.com/checkup-mockpass:latest .
   docker push 244203483886.dkr.ecr.us-east-1.amazonaws.com/checkup-mockpass:latest
    
2. Update ECS services to use new images:
       
   aws ecs update-service --cluster checkup-dev --service checkup-backend-dev --force-new-deployment --region us-east-1
   aws ecs update-service --cluster checkup-dev --service checkup-frontend-dev --force-new-deployment --region us-east-1
    
3. Access your application:
       
   URL: http://ec2-34-192-204-98.compute-1.amazonaws.com
   API: http://ec2-34-192-204-98.compute-1.amazonaws.com/api
    
4. Monitor deployment:
       
   # Watch ECS services
   aws ecs describe-services --cluster checkup-dev --services checkup-backend-dev checkup-frontend-dev --region us-east-1
       
   # View logs
   aws logs tail /ecs/checkup-dev --follow --region us-east-1
    
5. SSH to nginx instance (if needed):
       
   ssh -i ~/.ssh/checkup-dev-key.pem ec2-user@34.192.204.98
    
========================================

EOT
ecs_cluster_name = "checkup-dev"
environment = "dev"
frontend_repository_url = "244203483886.dkr.ecr.us-east-1.amazonaws.com/checkup-frontend"
frontend_service_name = "checkup-frontend-dev"
nat_instance_public_ip = "98.86.228.140"
nginx_public_dns = "ec2-34-192-204-98.compute-1.amazonaws.com"
nginx_public_ip = "34.192.204.98"
project_name = "checkup"
vpc_id = "vpc-0df8c9aef7ac090ea"