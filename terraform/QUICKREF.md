# Terraform Quick Reference

## Essential Commands

### Initial Setup
```bash
# Create S3 backend (one-time)
aws s3api create-bucket --bucket checkup-terraform-state --region us-east-1
aws dynamodb create-table --table-name checkup-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region us-east-1

# Initialize Terraform
cd terraform/environments/dev
terraform init
```

### Deploy Infrastructure
```bash
# Review changes
terraform plan

# Apply changes
terraform apply

# Auto-approve (use with caution)
terraform apply -auto-approve
```

### Build and Deploy Application
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(terraform output -raw backend_repository_url | cut -d'/' -f1)

# Build and push backend
cd ../../../backend
docker build -t $(terraform -chdir=terraform/environments/dev output -raw backend_repository_url):latest .
docker push $(terraform -chdir=terraform/environments/dev output -raw backend_repository_url):latest

# Build and push frontend
cd ../frontend
docker build -t $(terraform -chdir=terraform/environments/dev output -raw frontend_repository_url):latest .
docker push $(terraform -chdir=terraform/environments/dev output -raw frontend_repository_url):latest

# Deploy to ECS
cd ../terraform/environments/dev
aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw backend_service_name) \
  --force-new-deployment --region us-east-1
aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw frontend_service_name) \
  --force-new-deployment --region us-east-1
```

### Start/Stop Services (Cost Saving)
```bash
# Use the management script
cd terraform
./manage-infra.sh start   # Start all services
./manage-infra.sh stop    # Stop all services
./manage-infra.sh status  # Check status
./manage-infra.sh cost    # Show cost estimates

# Or manually:
# Stop ECS services
aws ecs update-service --cluster CLUSTER_NAME --service SERVICE_NAME \
  --desired-count 0 --region us-east-1

# Stop RDS
aws rds stop-db-instance --db-instance-identifier checkup-dev --region us-east-1

# Stop EC2 instances
aws ec2 stop-instances --instance-ids INSTANCE_ID --region us-east-1

# Start (reverse above commands with start and --desired-count 1)
```

### Monitoring
```bash
# View outputs
terraform output

# Get application URL
terraform output application_url

# View ECS logs
aws logs tail /ecs/checkup-dev --follow --region us-east-1

# View nginx logs
aws logs tail /aws/ec2/nginx/access --follow --region us-east-1

# Check ECS service status
aws ecs describe-services --cluster $(terraform output -raw ecs_cluster_name) \
  --services $(terraform output -raw backend_service_name) --region us-east-1

# List running tasks
aws ecs list-tasks --cluster $(terraform output -raw ecs_cluster_name) --region us-east-1
```

### SSH Access
```bash
# SSH to nginx instance
ssh -i ~/.ssh/checkup-dev.pem ec2-user@$(terraform output -raw nginx_public_ip)

# Check nginx status
sudo systemctl status nginx

# View nginx config
sudo cat /etc/nginx/conf.d/app.conf

# Restart nginx
sudo systemctl restart nginx
```

### Troubleshooting
```bash
# Validate Terraform config
terraform validate

# Format Terraform files
terraform fmt -recursive

# Show current state
terraform show

# List resources
terraform state list

# Check specific resource
terraform state show module.ecs.aws_ecs_service.backend

# Refresh state
terraform refresh

# View logs for stopped tasks
aws ecs list-tasks --cluster CLUSTER --desired-status STOPPED --region us-east-1
```

### Cleanup
```bash
# Destroy all infrastructure
terraform destroy

# Destroy specific resource
terraform destroy -target=module.ecs
```

## Common Issues

### Issue: ECS tasks keep stopping
**Check**: ECS task logs for errors
```bash
aws logs tail /ecs/checkup-dev --follow
```
**Common causes**: Database connection, missing environment variables, image pull errors

### Issue: nginx not responding
**Check**: nginx instance status and logs
```bash
ssh -i ~/.ssh/KEY.pem ec2-user@NGINX_IP
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Issue: Terraform state lock
**Fix**: Remove DynamoDB lock entry
```bash
aws dynamodb delete-item --table-name checkup-terraform-locks \
  --key '{"LockID":{"S":"checkup-terraform-state/dev/terraform.tfstate"}}' \
  --region us-east-1
```

### Issue: High costs
**Check**: Running resources
```bash
# List EC2 instances
aws ec2 describe-instances --filters "Name=tag:Project,Values=checkup" \
  --query 'Reservations[].Instances[].[InstanceId,State.Name,InstanceType]' \
  --output table --region us-east-1

# List ECS services
aws ecs list-services --cluster $(terraform output -raw ecs_cluster_name) \
  --region us-east-1

# Stop unused services (see Start/Stop section above)
```

## File Locations

```
terraform/
├── manage-infra.sh           # Management script
├── README.md                 # Full documentation
├── modules/
│   ├── networking/           # VPC, subnets, NAT, security groups
│   ├── ecr/                  # Container registries
│   ├── rds/                  # PostgreSQL database
│   ├── ecs/                  # ECS cluster and services
│   └── ec2-nginx/            # nginx reverse proxy
└── environments/
    └── dev/
        ├── main.tf           # Module orchestration
        ├── variables.tf      # Variable definitions
        ├── outputs.tf        # Outputs
        └── terraform.tfvars  # Your config (gitignored)
```

## Cost Estimates

### Part-time (3 days/month, ~72 hours)
- Running: ~$1.50 (72 hours × $0.02/hour)
- Stopped: ~$5.60 (27 days × $0.20/day)
- **Total: ~$7/month**

### Full-time (24/7, 720 hours)
- **Total: ~$15-25/month**
  - NAT instance: ~$6
  - ECS Fargate: ~$8-12
  - Data transfer: ~$2-4
  - RDS, nginx EC2: Free tier

## Security Checklist

- [ ] Restrict `ssh_cidr_blocks` to your IP only
- [ ] Use strong SSH key pair
- [ ] Never commit terraform.tfvars
- [ ] Enable deletion protection for production RDS
- [ ] Enable Multi-AZ for production
- [ ] Use AWS Secrets Manager for production secrets
- [ ] Enable VPC Flow Logs for production
- [ ] Review security group rules regularly
- [ ] Enable CloudTrail for audit logs
- [ ] Set up AWS Budget alerts

## Useful AWS CLI Commands

```bash
# Get current region
aws configure get region

# List all ECS clusters
aws ecs list-clusters --region us-east-1

# Describe ECS cluster
aws ecs describe-clusters --clusters CLUSTER_NAME --region us-east-1

# List all RDS instances
aws rds describe-db-instances --region us-east-1

# List all ECR repositories
aws ecr describe-repositories --region us-east-1

# Get ECR login command
aws ecr get-login-password --region us-east-1

# List S3 buckets
aws s3 ls

# View CloudWatch alarms
aws cloudwatch describe-alarms --region us-east-1
```

## Next Steps

1. Set up CI/CD with GitHub Actions
2. Configure custom domain and SSL
3. Implement monitoring and alerting
4. Set up automated backups
5. Create disaster recovery plan
6. Implement blue-green deployments
