output "db_instance_id" {
  description = "ID of the RDS instance"
  value       = aws_db_instance.main.id
}

output "db_instance_arn" {
  description = "ARN of the RDS instance"
  value       = aws_db_instance.main.arn
}

output "db_instance_endpoint" {
  description = "Connection endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_address" {
  description = "Address of the RDS instance"
  value       = aws_db_instance.main.address
}

output "db_instance_port" {
  description = "Port of the RDS instance"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "Name of the database"
  value       = aws_db_instance.main.db_name
}

output "db_username" {
  description = "Master username"
  value       = var.database_username
  sensitive   = true
}

output "db_password_ssm_parameter" {
  description = "SSM parameter name containing database password"
  value       = aws_ssm_parameter.db_password.name
}

output "db_host_ssm_parameter" {
  description = "SSM parameter name containing database host"
  value       = aws_ssm_parameter.db_host.name
}

output "db_port_ssm_parameter" {
  description = "SSM parameter name containing database port"
  value       = aws_ssm_parameter.db_port.name
}

output "db_name_ssm_parameter" {
  description = "SSM parameter name containing database name"
  value       = aws_ssm_parameter.db_name.name
}

output "db_username_ssm_parameter" {
  description = "SSM parameter name containing database username"
  value       = aws_ssm_parameter.db_username.name
}
