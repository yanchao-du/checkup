output "backend_repository_url" {
  description = "URL of the backend ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}

output "backend_repository_arn" {
  description = "ARN of the backend ECR repository"
  value       = aws_ecr_repository.backend.arn
}

output "frontend_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "frontend_repository_arn" {
  description = "ARN of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.arn
}

output "ecr_read_policy_arn" {
  description = "ARN of IAM policy for reading from ECR"
  value       = aws_iam_policy.ecr_read.arn
}

output "ecr_push_policy_arn" {
  description = "ARN of IAM policy for pushing to ECR"
  value       = aws_iam_policy.ecr_push.arn
}
