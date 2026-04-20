resource "random_string" "suffix" {
  length  = 5
  upper   = false
  special = false
}

resource "random_password" "postgres" {
  length           = 24
  special          = true
  override_special = "!#$%&*-_=+"
}

locals {
  name_prefix = "${var.project}-${var.environment}"
  suffix      = random_string.suffix.result

  common_tags = {
    project     = var.project
    environment = var.environment
    managed_by  = "terraform"
  }
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "autodrive" {
  name     = "rg-${local.name_prefix}"
  location = var.location
  tags     = local.common_tags
}
