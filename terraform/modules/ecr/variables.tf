variable "project_name" {
  description = "Project name to use for resource naming"
  type        = string
}

variable "enable_image_scanning" {
  description = "Enable image scanning on push"
  type        = bool
  default     = true
}

variable "image_retention_count" {
  description = "Number of images to retain in repository"
  type        = number
  default     = 10
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
