output "instance_id" {
  description = "ID of the nginx EC2 instance"
  value       = aws_instance.nginx.id
}

output "instance_private_ip" {
  description = "Private IP of nginx instance"
  value       = aws_instance.nginx.private_ip
}

output "instance_public_ip" {
  description = "Public IP of nginx instance (Elastic IP)"
  value       = aws_eip.nginx.public_ip
}

output "public_dns" {
  description = "Public DNS of nginx instance"
  value       = aws_eip.nginx.public_dns
}

output "iam_role_name" {
  description = "Name of IAM role for nginx instance"
  value       = aws_iam_role.nginx.name
}

output "iam_role_arn" {
  description = "ARN of IAM role for nginx instance"
  value       = aws_iam_role.nginx.arn
}
