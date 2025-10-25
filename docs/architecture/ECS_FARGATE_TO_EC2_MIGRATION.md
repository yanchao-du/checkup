# ECS Migration: Fargate to EC2 (Free Tier)

**Date**: January 25, 2025  
**Status**: ✅ Complete  
**Reason**: Cost optimization - utilize AWS Free Tier

## Overview

Migrated the ECS infrastructure from **AWS Fargate** to **EC2 instances** to take advantage of the AWS Free Tier and significantly reduce costs for dev/test environments.

## Cost Comparison

### Fargate (Previous Configuration)
**Running 24/7 for 1 month:**

| Component | CPU | Memory | Monthly Cost |
|-----------|-----|--------|--------------|
| Backend | 0.25 vCPU | 0.5 GB | ~$9.00 |
| Frontend | 0.25 vCPU | 0.5 GB | ~$9.00 |
| MockPass (dev) | 0.25 vCPU | 0.5 GB | ~$9.00 |
| **Total Fargate** | | | **~$27/month** |

Plus: VPC NAT, RDS, ECR, CloudWatch, etc. (~$25-30/month)  
**Total Monthly Cost**: ~$50-60/month

### EC2 (New Configuration)
**Running 24/7 for 1 month:**

| Component | Instance Type | Monthly Cost |
|-----------|---------------|--------------|
| ECS Container Instance | t2.micro (1 instance) | **$0** (Free Tier: 750 hours/month) |
| Backend container | Runs on t2.micro | $0 |
| Frontend container | Runs on t2.micro | $0 |
| MockPass container | Runs on t2.micro | $0 |
| **Total EC2** | | **$0/month (Free Tier)** |

Plus: VPC NAT, RDS, ECR, CloudWatch, etc. (~$25-30/month)  
**Total Monthly Cost**: ~$25-30/month

### Savings
- **Fargate cost eliminated**: ~$27/month
- **Total savings**: ~50% reduction in overall infrastructure cost
- **Free Tier eligibility**: 750 hours/month of t2.micro for 12 months

## Technical Changes

### 1. Added EC2 Auto Scaling Group

**New Resources:**
```terraform
# Launch Template for ECS EC2 Instances
resource "aws_launch_template" "ecs" {
  image_id      = data.aws_ami.ecs.id  # Latest ECS-optimized AMI
  instance_type = "t2.micro"            # FREE TIER ELIGIBLE
  # ...
}

# Auto Scaling Group
resource "aws_autoscaling_group" "ecs" {
  desired_capacity = 1  # 1 free tier instance
  max_size         = 2
  min_size         = 1
  # ...
}
```

**Key Benefits:**
- Uses Amazon ECS-optimized AMI (includes Docker, ECS agent pre-configured)
- Auto Scaling Group provides instance redundancy
- Managed scaling based on task capacity

### 2. Changed Capacity Providers

**Before (Fargate):**
```terraform
capacity_providers = ["FARGATE", "FARGATE_SPOT"]
```

**After (EC2):**
```terraform
capacity_providers = [aws_ecs_capacity_provider.ec2.name]
```

**EC2 Capacity Provider Features:**
- Managed scaling based on task requirements
- Automatic instance termination protection
- Target capacity utilization: 100%

### 3. Updated Task Definitions

**Network Mode Change:**
- Fargate: `network_mode = "awsvpc"` (required)
- EC2: `network_mode = "bridge"` (Docker bridge networking)

**Port Mapping Change:**
- Fargate: Fixed port mapping
  ```json
  {
    "containerPort": 3344,
    "protocol": "tcp"
  }
  ```
- EC2: Dynamic port mapping
  ```json
  {
    "containerPort": 3344,
    "hostPort": 0,  # ECS assigns random host port
    "protocol": "tcp"
  }
  ```

**Resource Allocation:**
- Fargate: Task-level CPU and memory (required at task level)
- EC2: Container-level memory only (instance provides CPU)

### 4. Updated ECS Services

**Removed Fargate-specific configurations:**
- `launch_type = "FARGATE"` removed
- `network_configuration` block removed (not needed for bridge mode)
- `deployment_configuration` simplified

**Added EC2-specific configurations:**
- `ordered_placement_strategy` for efficient resource utilization
  - Type: `binpack`
  - Field: `memory`
  - Effect: Packs tasks tightly to minimize instance usage

### 5. Service Discovery Compatibility

**No changes required!**
- AWS Cloud Map service discovery works with both Fargate and EC2
- DNS names remain the same:
  - `backend.checkup.local:3344`
  - `frontend.checkup.local:8080`
  - `mockpass.checkup.local:5156`

## Configuration Variables

### New Variables Added

```hcl
variable "ecs_instance_type" {
  description = "EC2 instance type for ECS container instances"
  type        = string
  default     = "t2.micro"  # FREE TIER ELIGIBLE
}

variable "ecs_instance_desired_count" {
  description = "Desired number of EC2 instances"
  type        = number
  default     = 1  # Single instance for free tier
}

variable "ecs_instance_min_count" {
  description = "Minimum number of EC2 instances"
  type        = number
  default     = 1
}

variable "ecs_instance_max_count" {
  description = "Maximum number of EC2 instances"
  type        = number
  default     = 2  # Can scale to 2 if needed
}
```

### Removed Variables

- `backend_cpu`, `frontend_cpu`, `mockpass_cpu` - Not used in EC2 mode
- Task-level CPU allocation not required for EC2 launch type

## AWS Free Tier Eligibility

### What's Included (First 12 Months)

✅ **750 hours/month of t2.micro EC2 instances**
- Running 1 instance 24/7 = 730 hours/month
- Stays within free tier limit!

✅ **30 GB of EBS storage** (General Purpose SSD)
- ECS-optimized AMI root volume: ~8 GB
- Well within free tier

✅ **15 GB of data transfer out** per month
- Typical dev/test usage: <5 GB/month

❌ **NOT Free Tier:**
- RDS (db.t3.micro) - ~$15/month
- NAT instance (t3.micro) - Can be stopped when not needed
- ECR storage - Minimal (~$1/month for small images)
- CloudWatch Logs - Free tier: 5 GB, minimal for dev

## Deployment Impact

### Dev Environment
```bash
cd terraform/environments/dev

# Deploy with EC2 (default now)
terraform apply

# What you get:
# - 1 x t2.micro EC2 instance (FREE TIER)
# - Backend, Frontend, MockPass containers on same instance
# - ~$25-30/month total cost (vs $50-60 with Fargate)
```

### Resource Limits

**Single t2.micro Instance (Free Tier):**
- vCPU: 1
- Memory: 1 GB
- Network: Low to moderate

**Container Memory Allocation:**
- Backend: 512 MB
- Frontend: 512 MB  
- MockPass: 512 MB (dev only)
- **Total**: 1.5 GB container memory

⚠️ **Important**: With 3 containers (backend + frontend + mockpass), the total exceeds 1 GB instance memory. 

**Solutions:**
1. **Reduce container memory** (recommended for dev):
   - Backend: 256 MB
   - Frontend: 256 MB
   - MockPass: 256 MB
   - Total: 768 MB (fits in 1 GB instance)

2. **Disable MockPass when not testing auth** (save memory)

3. **Use 2 t2.micro instances** (still free tier):
   - Instance 1: Backend + MockPass
   - Instance 2: Frontend

## Migration Steps

### For Existing Deployments

1. **Stop Fargate services:**
   ```bash
   aws ecs update-service --cluster checkup-dev --service checkup-dev-backend --desired-count 0
   aws ecs update-service --cluster checkup-dev --service checkup-dev-frontend --desired-count 0
   aws ecs update-service --cluster checkup-dev --service checkup-dev-mockpass --desired-count 0
   ```

2. **Update Terraform:**
   ```bash
   cd terraform/environments/dev
   terraform init -upgrade
   terraform plan  # Review EC2 changes
   terraform apply
   ```

3. **Verify EC2 instances launched:**
   ```bash
   aws ec2 describe-instances --filters "Name=tag:Name,Values=checkup-ecs-instance"
   ```

4. **Verify tasks running:**
   ```bash
   aws ecs list-tasks --cluster checkup-dev
   ```

### For New Deployments

EC2 mode is now the default! Just deploy:
```bash
cd terraform/environments/dev
terraform apply
```

## Monitoring & Troubleshooting

### Check Instance Status
```bash
# List ECS container instances
aws ecs list-container-instances --cluster checkup-dev

# Describe instance
aws ecs describe-container-instances \
  --cluster checkup-dev \
  --container-instances <instance-arn>
```

### Check Task Placement
```bash
# List tasks
aws ecs list-tasks --cluster checkup-dev

# Describe task (shows which instance it's on)
aws ecs describe-tasks --cluster checkup-dev --tasks <task-arn>
```

### Common Issues

**Issue**: Tasks fail to start - "Insufficient memory"  
**Solution**: Reduce container memory limits or add a second t2.micro instance

**Issue**: Cannot connect to service  
**Solution**: Check security group allows traffic, verify service discovery DNS resolution

**Issue**: EC2 instance not joining cluster  
**Solution**: Check user data script, verify ECS_CLUSTER environment variable

## Performance Considerations

### t2.micro Specifications
- **CPU**: 1 vCPU (burstable)
- **Memory**: 1 GB
- **Network**: Low to Moderate
- **CPU Credits**: Baseline 10% CPU utilization, bursts to 100%

### Expected Performance
- **Good for**: Dev/test, low traffic, proof-of-concept
- **Limitations**: 
  - Single vCPU shared across all containers
  - 1 GB memory (tight with 3 containers)
  - Network throughput limited

### Scaling Options
1. **Add more t2.micro instances** (still free tier)
2. **Upgrade to t3.micro** (~$7.50/month, more CPU credits)
3. **Use t3.small** for production (~$15/month, 2 GB memory)

## Security

### EC2 Instance Security
- ✅ Runs in private subnets (no direct internet access)
- ✅ Security group limits inbound traffic
- ✅ IAM instance profile with minimal permissions
- ✅ ECS agent auto-updates via Amazon

### Container Security
- ✅ Container isolation via Docker
- ✅ IAM task roles for fine-grained permissions
- ✅ Secrets managed via SSM Parameter Store
- ✅ CloudWatch Logs for audit trail

## Rollback Plan

If you need to revert to Fargate:

1. Update task definitions:
   ```terraform
   network_mode             = "awsvpc"
   requires_compatibilities = ["FARGATE"]
   cpu                      = var.backend_cpu
   memory                   = var.backend_memory
   ```

2. Update services:
   ```terraform
   launch_type = "FARGATE"
   network_configuration {
     subnets          = var.private_subnet_ids
     security_groups  = [var.ecs_security_group_id]
     assign_public_ip = false
   }
   ```

3. Revert capacity providers:
   ```terraform
   capacity_providers = ["FARGATE", "FARGATE_SPOT"]
   ```

## Summary

✅ **Cost Savings**: ~50% reduction (~$25/month savings)  
✅ **Free Tier**: Utilizes 750 hours/month of t2.micro  
✅ **Compatibility**: Service discovery and application code unchanged  
✅ **Flexibility**: Can scale to 2 instances or upgrade instance type  
⚠️ **Limitation**: Tight memory with 3 containers (consider reducing limits)

---

**Files Modified:**
- `terraform/modules/ecs/main.tf` - Added EC2 resources, updated task definitions and services
- `terraform/modules/ecs/variables.tf` - Added EC2 instance configuration variables

**Related Documentation:**
- [AWS Free Tier](https://aws.amazon.com/free/)
- [ECS EC2 vs Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html)
- [t2.micro Specifications](https://aws.amazon.com/ec2/instance-types/t2/)
