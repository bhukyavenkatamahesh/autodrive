variable "subscription_id" {
  description = "Azure subscription ID."
  type        = string
}

variable "location" {
  description = "Primary Azure region for the resource group and most resources."
  type        = string
  default     = "centralindia"
}

variable "project" {
  description = "Short name used as a prefix for all resources."
  type        = string
  default     = "autodrive"
}

variable "environment" {
  description = "Environment tag (prod, dev, etc.)."
  type        = string
  default     = "prod"
}

variable "postgres_admin_login" {
  description = "Postgres flexible server admin username."
  type        = string
  default     = "autodriveadmin"
}

variable "aks_node_count" {
  description = "Number of worker nodes in the default AKS pool."
  type        = number
  default     = 1
}

variable "aks_node_size" {
  description = "VM size for AKS worker nodes. B-series fits Azure for Students quotas."
  type        = string
  default     = "Standard_B2s"
}
