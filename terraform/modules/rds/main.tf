# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.database_subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-db-subnet-group"
    }
  )
}

# Random password for RDS
resource "random_password" "db_password" {
  length  = 32
  special = true
  # Exclude characters that might cause issues in connection strings
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store DB credentials in Parameter Store
resource "aws_ssm_parameter" "db_host" {
  name        = "/${var.project_name}/${var.environment}/db/host"
  description = "RDS database host"
  type        = "String"
  value       = aws_db_instance.main.address

  tags = var.tags
}

resource "aws_ssm_parameter" "db_port" {
  name        = "/${var.project_name}/${var.environment}/db/port"
  description = "RDS database port"
  type        = "String"
  value       = tostring(aws_db_instance.main.port)

  tags = var.tags
}

resource "aws_ssm_parameter" "db_name" {
  name        = "/${var.project_name}/${var.environment}/db/name"
  description = "RDS database name"
  type        = "String"
  value       = var.database_name

  tags = var.tags
}

resource "aws_ssm_parameter" "db_username" {
  name        = "/${var.project_name}/${var.environment}/db/username"
  description = "RDS database username"
  type        = "SecureString"
  value       = var.database_username

  tags = var.tags
}

resource "aws_ssm_parameter" "db_password" {
  name        = "/${var.project_name}/${var.environment}/db/password"
  description = "RDS database password"
  type        = "SecureString"
  value       = random_password.db_password.result

  tags = var.tags
}

# DATABASE_URL for NestJS/Prisma (postgresql://user:pass@host:port/dbname)
resource "aws_ssm_parameter" "database_url" {
  name        = "/${var.project_name}/${var.environment}/db/url"
  description = "Full DATABASE_URL connection string for Prisma/NestJS"
  type        = "SecureString"
  # value       = "postgresql://${var.database_username}:${random_password.db_password.result}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.database_name}"
  value = "postgresql://${var.database_username}:${urlencode(random_password.db_password.result)}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.database_name}"

  tags = var.tags
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-${var.environment}"
  engine         = "postgres"
  engine_version = var.postgres_version

  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.database_name
  username = var.database_username
  password = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]

  # Backup configuration
  backup_retention_period = var.backup_retention_days
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window

  # Free tier optimizations
  multi_az               = var.multi_az
  publicly_accessible    = false
  skip_final_snapshot    = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.project_name}-${var.environment}-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  deletion_protection = var.deletion_protection

  # Performance Insights (free tier available)
  enabled_cloudwatch_logs_exports = var.enable_cloudwatch_logs ? ["postgresql", "upgrade"] : []
  performance_insights_enabled    = var.enable_performance_insights
  performance_insights_retention_period = var.enable_performance_insights ? 7 : null

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  # Parameter group
  parameter_group_name = var.parameter_group_name != "" ? var.parameter_group_name : "default.postgres${split(".", var.postgres_version)[0]}"

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-${var.environment}-rds"
      Environment = var.environment
    }
  )
}

# CloudWatch Alarms for RDS
resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "database_storage" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-rds-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "2000000000" # 2GB in bytes
  alarm_description   = "This metric monitors RDS free storage space"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "database_memory" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-rds-memory"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "256000000" # 256MB in bytes
  alarm_description   = "This metric monitors RDS freeable memory"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = var.tags
}
