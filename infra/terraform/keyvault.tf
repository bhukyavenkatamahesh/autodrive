resource "azurerm_key_vault" "autodrive" {
  name                       = "kv-${var.project}-${local.suffix}"
  location                   = azurerm_resource_group.autodrive.location
  resource_group_name        = azurerm_resource_group.autodrive.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  purge_protection_enabled   = false
  soft_delete_retention_days = 7
  rbac_authorization_enabled = true
  tags                       = local.common_tags
}

resource "azurerm_role_assignment" "kv_current_user" {
  scope                = azurerm_key_vault.autodrive.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "kv_aks_secrets_user" {
  scope                = azurerm_key_vault.autodrive.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_kubernetes_cluster.autodrive.kubelet_identity[0].object_id
}

resource "azurerm_key_vault_secret" "postgres_url" {
  name         = "postgres-url"
  value        = "postgresql://${var.postgres_admin_login}:${random_password.postgres.result}@${azurerm_postgresql_flexible_server.autodrive.fqdn}:5432/${azurerm_postgresql_flexible_server_database.autodrive.name}?sslmode=require"
  key_vault_id = azurerm_key_vault.autodrive.id
  depends_on   = [azurerm_role_assignment.kv_current_user]
}

resource "azurerm_key_vault_secret" "postgres_password" {
  name         = "postgres-admin-password"
  value        = random_password.postgres.result
  key_vault_id = azurerm_key_vault.autodrive.id
  depends_on   = [azurerm_role_assignment.kv_current_user]
}

resource "azurerm_key_vault_secret" "app_insights" {
  name         = "appinsights-connection-string"
  value        = azurerm_application_insights.autodrive.connection_string
  key_vault_id = azurerm_key_vault.autodrive.id
  depends_on   = [azurerm_role_assignment.kv_current_user]
}

resource "random_password" "jwt_secret" {
  length  = 48
  special = false
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-secret"
  value        = random_password.jwt_secret.result
  key_vault_id = azurerm_key_vault.autodrive.id
  depends_on   = [azurerm_role_assignment.kv_current_user]
}
