output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "List of database subnet IDs"
  value       = aws_subnet.database[*].id
}

output "nat_instance_id" {
  description = "ID of NAT instance"
  value       = aws_instance.nat.id
}

output "nat_instance_public_ip" {
  description = "Public IP of NAT instance"
  value       = aws_eip.nat.public_ip
}

output "security_group_ecs_tasks" {
  description = "Security group ID for ECS tasks"
  value       = aws_security_group.ecs_tasks.id
}

output "security_group_rds" {
  description = "Security group ID for RDS"
  value       = aws_security_group.rds.id
}

output "security_group_nginx" {
  description = "Security group ID for nginx proxy"
  value       = aws_security_group.nginx.id
}

output "security_group_nat" {
  description = "Security group ID for NAT instance"
  value       = aws_security_group.nat.id
}
