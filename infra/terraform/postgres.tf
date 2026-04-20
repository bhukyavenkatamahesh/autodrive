resource "azurerm_postgresql_flexible_server" "autodrive" {
  name                          = "psql-${var.project}-${local.suffix}"
  resource_group_name           = azurerm_resource_group.autodrive.name
  location                      = azurerm_resource_group.autodrive.location
  version                       = "16"
  administrator_login           = var.postgres_admin_login
  administrator_password        = random_password.postgres.result
  sku_name                      = "B_Standard_B1ms"
  storage_mb                    = 32768
  backup_retention_days         = 7
  public_network_access_enabled = true
  zone                          = "1"

  authentication {
    password_auth_enabled = true
  }

  tags = local.common_tags

  lifecycle {
    ignore_changes = [zone, high_availability[0].standby_availability_zone]
  }
}

resource "azurerm_postgresql_flexible_server_database" "autodrive" {
  name      = "autodrive"
  server_id = azurerm_postgresql_flexible_server.autodrive.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Allows other Azure services (incl. AKS egress) to reach Postgres.
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.autodrive.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# TEMPORARY: lets you run migrations/seeds from a laptop.
# Tighten or remove before the demo — replace with specific /32 rules.
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_all_temp" {
  name             = "allow-all-temp-for-bootstrap"
  server_id        = azurerm_postgresql_flexible_server.autodrive.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "255.255.255.255"
}
