# Data source for latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance for nginx reverse proxy
resource "aws_instance" "nginx" {
  ami                    = var.ami_id != "" ? var.ami_id : data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [var.security_group_id]
  key_name               = var.key_name

  user_data = templatefile("${path.module}/user_data.sh", {
    backend_service_dns  = var.backend_service_dns
    frontend_service_dns = var.frontend_service_dns
    domain_name          = var.domain_name
  })

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size
    delete_on_termination = true
    encrypted             = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  monitoring = var.enable_detailed_monitoring

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-nginx-${var.environment}"
      Environment = var.environment
      Component   = "nginx"
    }
  )
}

# Elastic IP for nginx instance
resource "aws_eip" "nginx" {
  instance = aws_instance.nginx.id
  domain   = "vpc"

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-nginx-eip-${var.environment}"
      Environment = var.environment
    }
  )

  depends_on = [aws_instance.nginx]
}

# CloudWatch Alarms for nginx instance
resource "aws_cloudwatch_metric_alarm" "nginx_cpu" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-nginx-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors nginx EC2 CPU utilization"

  dimensions = {
    InstanceId = aws_instance.nginx.id
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "nginx_status" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-nginx-status-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Maximum"
  threshold           = "0"
  alarm_description   = "This metric monitors nginx EC2 instance status checks"

  dimensions = {
    InstanceId = aws_instance.nginx.id
  }

  tags = var.tags
}

# IAM Role for nginx instance (for CloudWatch logs, SSM, etc.)
resource "aws_iam_role" "nginx" {
  name_prefix = "${var.project_name}-nginx-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Attach SSM managed instance policy
resource "aws_iam_role_policy_attachment" "nginx_ssm" {
  role       = aws_iam_role.nginx.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach CloudWatch agent policy
resource "aws_iam_role_policy_attachment" "nginx_cloudwatch" {
  role       = aws_iam_role.nginx.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Instance profile for nginx
resource "aws_iam_instance_profile" "nginx" {
  name_prefix = "${var.project_name}-nginx-"
  role        = aws_iam_role.nginx.name

  tags = var.tags
}

# Update instance to use IAM instance profile
resource "aws_ec2_instance_state" "nginx" {
  instance_id = aws_instance.nginx.id
  state       = "running"
}
