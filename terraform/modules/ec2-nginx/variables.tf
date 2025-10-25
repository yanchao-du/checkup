variable "project_name" {
  description = "Project name to use for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "public_subnet_id" {
  description = "Public subnet ID for nginx instance"
  type        = string
}

variable "security_group_id" {
  description = "Security group ID for nginx instance"
  type        = string
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID for nginx instance (defaults to latest Amazon Linux 2)"
  type        = string
  default     = ""
}

variable "root_volume_size" {
  description = "Size of root volume in GB"
  type        = number
  default     = 20
}

variable "backend_service_dns" {
  description = "DNS name of backend service"
  type        = string
}

variable "frontend_service_dns" {
  description = "DNS name of frontend service"
  type        = string
}

variable "domain_name" {
  description = "Domain name for nginx (optional)"
  type        = string
  default     = ""
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = false
}

variable "enable_cloudwatch_alarms" {
  description = "Enable CloudWatch alarms"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
