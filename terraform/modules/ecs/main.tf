# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-${var.environment}-cluster"
      Environment = var.environment
    }
  )
}

# IAM Role for ECS EC2 Instances
resource "aws_iam_role" "ecs_instance" {
  name_prefix = "${var.project_name}-ecs-instance-"

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

resource "aws_iam_role_policy_attachment" "ecs_instance" {
  role       = aws_iam_role.ecs_instance.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs" {
  name_prefix = "${var.project_name}-ecs-"
  role        = aws_iam_role.ecs_instance.name

  tags = var.tags
}

# Get latest ECS-optimized AMI
data "aws_ami" "ecs" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Launch Template for ECS EC2 Instances
resource "aws_launch_template" "ecs" {
  name_prefix   = "${var.project_name}-ecs-"
  image_id      = data.aws_ami.ecs.id
  instance_type = var.ecs_instance_type

  iam_instance_profile {
    arn = aws_iam_instance_profile.ecs.arn
  }

  vpc_security_group_ids = [var.ecs_security_group_id]

  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config
    echo ECS_ENABLE_CONTAINER_METADATA=true >> /etc/ecs/ecs.config
  EOF
  )

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = merge(
      var.tags,
      {
        Name        = "${var.project_name}-ecs-instance"
        Environment = var.environment
      }
    )
  }

  tags = var.tags
}

# Auto Scaling Group for ECS EC2 Instances
resource "aws_autoscaling_group" "ecs" {
  name_prefix         = "${var.project_name}-ecs-"
  vpc_zone_identifier = var.private_subnet_ids
  desired_capacity    = var.ecs_instance_desired_count
  max_size            = var.ecs_instance_max_count
  min_size            = var.ecs_instance_min_count

  launch_template {
    id      = aws_launch_template.ecs.id
    version = "$Latest"
  }

  health_check_type         = "EC2"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "${var.project_name}-ecs-instance"
    propagate_at_launch = true
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = "true"
    propagate_at_launch = true
  }

  dynamic "tag" {
    for_each = var.tags
    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }
}

# ECS Capacity Provider for EC2 Auto Scaling
resource "aws_ecs_capacity_provider" "ec2" {
  name = "${var.project_name}-ec2"

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.ecs.arn
    managed_termination_protection = "ENABLED"

    managed_scaling {
      maximum_scaling_step_size = 2
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = 100
    }
  }

  tags = var.tags
}

# ECS Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = [aws_ecs_capacity_provider.ec2.name]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.ec2.name
  }
}

# CloudWatch Log Group for ECS
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution" {
  name_prefix = "${var.project_name}-ecs-exec-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Additional permissions for task execution role (SSM, Secrets Manager)
resource "aws_iam_role_policy" "ecs_task_execution_ssm" {
  name_prefix = "${var.project_name}-ecs-exec-ssm-"
  role        = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter/${var.project_name}/${var.environment}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:${var.project_name}/${var.environment}/*"
      }
    ]
  })
}

# Attach ECR read policy to execution role
resource "aws_iam_role_policy_attachment" "ecs_task_execution_ecr" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = var.ecr_read_policy_arn
}

# IAM Role for ECS Tasks (application runtime permissions)
resource "aws_iam_role" "ecs_task" {
  name_prefix = "${var.project_name}-ecs-task-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Task definition for Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend-${var.environment}"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${var.backend_image_url}:${var.backend_image_tag}"
      essential = true
      memory    = var.backend_memory

      portMappings = [
        {
          containerPort = 3344
          hostPort      = 0 # Dynamic port mapping
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3344"
        },
        {
          name  = "CORS_ORIGIN"
          value = var.cors_origin
        },
        {
          name  = "CORPPASS_CLIENT_ID"
          value = var.corppass_client_id
        },
        {
          name  = "CORPPASS_ISSUER"
          value = var.corppass_issuer
        },
        {
          name  = "CORPPASS_AUTHORIZE_URL"
          value = var.corppass_authorize_url
        },
        {
          name  = "CORPPASS_TOKEN_URL"
          value = var.corppass_token_url
        },
        {
          name  = "CORPPASS_JWKS_URL"
          value = var.corppass_jwks_url
        },
        {
          name  = "CORPPASS_CALLBACK_URL"
          value = var.corppass_callback_url
        },
        {
          name  = "CORPPASS_FRONTEND_CALLBACK_URL"
          value = var.corppass_frontend_callback_url
        }
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = var.database_url_ssm_parameter
        },
        {
          name      = "JWT_SECRET"
          valueFrom = var.jwt_secret_ssm_parameter
        },
        {
          name      = "CORPPASS_CLIENT_SECRET"
          valueFrom = var.corppass_client_secret_ssm_parameter
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3344/v1/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-backend-${var.environment}"
      Environment = var.environment
      Component   = "backend"
    }
  )
}

# Task definition for Frontend
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-frontend-${var.environment}"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "${var.frontend_image_url}:${var.frontend_image_tag}"
      essential = true
      memory    = var.frontend_memory

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 0 # Dynamic port mapping
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "VITE_API_URL"
          value = var.backend_api_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 40
      }
    }
  ])

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-frontend-${var.environment}"
      Environment = var.environment
      Component   = "frontend"
    }
  )
}

# Task definition for MockPass (dev/test only)
resource "aws_ecs_task_definition" "mockpass" {
  count = var.enable_mockpass ? 1 : 0

  family                   = "${var.project_name}-mockpass-${var.environment}"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "mockpass"
      image     = "${var.backend_image_url}:${var.backend_image_tag}"
      essential = true
      memory    = var.mockpass_memory

      entryPoint = ["sh"]
      command    = ["/app/scripts/start-mockpass.sh"]

      portMappings = [
        {
          containerPort = 5156
          hostPort      = 0 # Dynamic port mapping
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "development"
        },
        {
          name  = "PORT"
          value = "5156"
        },
        {
          name  = "SHOW_LOGIN_PAGE"
          value = "true"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "mockpass"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:5156/corppass/v2/.well-known/keys || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 40
      }
    }
  ])

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-mockpass-${var.environment}"
      Environment = var.environment
      Component   = "mockpass"
    }
  )
}
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count

  ordered_placement_strategy {
    type  = "binpack"
    field = "memory"
  }

  service_registries {
    registry_arn = aws_service_discovery_service.backend.arn
  }

  enable_execute_command = var.enable_ecs_exec

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-backend-${var.environment}"
      Environment = var.environment
      Component   = "backend"
    }
  )
}

# ECS Service for Frontend
resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-frontend-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count

  ordered_placement_strategy {
    type  = "binpack"
    field = "memory"
  }

  service_registries {
    registry_arn = aws_service_discovery_service.frontend.arn
  }

  enable_execute_command = var.enable_ecs_exec

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-frontend-${var.environment}"
      Environment = var.environment
      Component   = "frontend"
    }
  )
}

# Service Discovery Namespace
resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "${var.project_name}.local"
  description = "Private DNS namespace for ${var.project_name}"
  vpc         = var.vpc_id

  tags = var.tags
}

# Service Discovery Service for Backend
resource "aws_service_discovery_service" "backend" {
  name = "backend"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = merge(
    var.tags,
    {
      Component = "backend"
    }
  )
}

# Service Discovery Service for Frontend
resource "aws_service_discovery_service" "frontend" {
  name = "frontend"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = merge(
    var.tags,
    {
      Component = "frontend"
    }
  )
}

# Service Discovery Service for MockPass (dev/test only)
resource "aws_service_discovery_service" "mockpass" {
  count = var.enable_mockpass ? 1 : 0

  name = "mockpass"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = merge(
    var.tags,
    {
      Component = "mockpass"
    }
  )
}

# ECS Service for MockPass (dev/test only)
resource "aws_ecs_service" "mockpass" {
  count = var.enable_mockpass ? 1 : 0

  name            = "${var.project_name}-mockpass-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.mockpass[0].arn
  desired_count   = 1

  ordered_placement_strategy {
    type  = "binpack"
    field = "memory"
  }

  service_registries {
    registry_arn = aws_service_discovery_service.mockpass[0].arn
  }

  enable_execute_command = var.enable_ecs_exec

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-mockpass-${var.environment}"
      Environment = var.environment
      Component   = "mockpass"
    }
  )
}
resource "aws_appautoscaling_target" "backend" {
  count = var.enable_autoscaling ? 1 : 0

  max_capacity       = var.backend_max_count
  min_capacity       = var.backend_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy for Backend (CPU)
resource "aws_appautoscaling_policy" "backend_cpu" {
  count = var.enable_autoscaling ? 1 : 0

  name               = "${var.project_name}-backend-cpu-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend[0].resource_id
  scalable_dimension = aws_appautoscaling_target.backend[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = var.autoscaling_cpu_threshold
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Auto Scaling Policy for Backend (Memory)
resource "aws_appautoscaling_policy" "backend_memory" {
  count = var.enable_autoscaling ? 1 : 0

  name               = "${var.project_name}-backend-memory-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend[0].resource_id
  scalable_dimension = aws_appautoscaling_target.backend[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value       = var.autoscaling_memory_threshold
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Auto Scaling Target for Frontend
resource "aws_appautoscaling_target" "frontend" {
  count = var.enable_autoscaling ? 1 : 0

  max_capacity       = var.frontend_max_count
  min_capacity       = var.frontend_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy for Frontend (CPU)
resource "aws_appautoscaling_policy" "frontend_cpu" {
  count = var.enable_autoscaling ? 1 : 0

  name               = "${var.project_name}-frontend-cpu-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend[0].resource_id
  scalable_dimension = aws_appautoscaling_target.frontend[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = var.autoscaling_cpu_threshold
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
