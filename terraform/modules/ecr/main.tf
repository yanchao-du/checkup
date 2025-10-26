# ECR Repository for Backend
resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = var.enable_image_scanning
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(
    var.tags,
    {
      Name      = "${var.project_name}-backend"
      Component = "backend"
    }
  )
}

# ECR Repository for Frontend
resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = var.enable_image_scanning
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(
    var.tags,
    {
      Name      = "${var.project_name}-frontend"
      Component = "frontend"
    }
  )
}

# Lifecycle Policy for Backend Repository
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.image_retention_count} images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = var.image_retention_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Lifecycle Policy for Frontend Repository
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.image_retention_count} images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = var.image_retention_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# IAM Policy for ECR Access (for ECS tasks and CI/CD)
data "aws_iam_policy_document" "ecr_read" {
  statement {
    sid    = "AllowPull"
    effect = "Allow"

    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:BatchCheckLayerAvailability",
    ]

    resources = [
      aws_ecr_repository.backend.arn,
      aws_ecr_repository.frontend.arn,
    ]
  }

  statement {
    sid    = "AllowAuth"
    effect = "Allow"

    actions = [
      "ecr:GetAuthorizationToken",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "ecr_read" {
  name_prefix = "${var.project_name}-ecr-read-"
  description = "Allow reading images from ECR repositories"
  policy      = data.aws_iam_policy_document.ecr_read.json

  tags = var.tags
}

# IAM Policy for ECR Push (for CI/CD)
data "aws_iam_policy_document" "ecr_push" {
  statement {
    sid    = "AllowPush"
    effect = "Allow"

    actions = [
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:BatchCheckLayerAvailability",
    ]

    resources = [
      aws_ecr_repository.backend.arn,
      aws_ecr_repository.frontend.arn,
    ]
  }

  statement {
    sid    = "AllowAuth"
    effect = "Allow"

    actions = [
      "ecr:GetAuthorizationToken",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "ecr_push" {
  name_prefix = "${var.project_name}-ecr-push-"
  description = "Allow pushing images to ECR repositories"
  policy      = data.aws_iam_policy_document.ecr_push.json

  tags = var.tags
}
