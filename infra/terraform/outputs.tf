output "resource_group" {
  value = azurerm_resource_group.autodrive.name
}

output "location" {
  value = azurerm_resource_group.autodrive.location
}

output "acr_login_server" {
  value = azurerm_container_registry.autodrive.login_server
}

output "acr_name" {
  value = azurerm_container_registry.autodrive.name
}

output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.autodrive.name
}

output "aks_get_credentials_command" {
  description = "Run this after apply to wire kubectl to the cluster."
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.autodrive.name} --name ${azurerm_kubernetes_cluster.autodrive.name} --overwrite-existing"
}

output "postgres_fqdn" {
  value = azurerm_postgresql_flexible_server.autodrive.fqdn
}

output "postgres_database" {
  value = azurerm_postgresql_flexible_server_database.autodrive.name
}

output "postgres_admin_login" {
  value = var.postgres_admin_login
}

output "key_vault_name" {
  value = azurerm_key_vault.autodrive.name
}

output "app_insights_connection_string" {
  value     = azurerm_application_insights.autodrive.connection_string
  sensitive = true
}

output "postgres_connection_string" {
  description = "Paste into local .env if you need to connect from your laptop."
  value       = "postgresql://${var.postgres_admin_login}:${random_password.postgres.result}@${azurerm_postgresql_flexible_server.autodrive.fqdn}:5432/${azurerm_postgresql_flexible_server_database.autodrive.name}?sslmode=require"
  sensitive   = true
}
