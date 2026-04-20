resource "azurerm_log_analytics_workspace" "autodrive" {
  name                = "log-${local.name_prefix}"
  location            = azurerm_resource_group.autodrive.location
  resource_group_name = azurerm_resource_group.autodrive.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

resource "azurerm_application_insights" "autodrive" {
  name                = "appi-${local.name_prefix}"
  location            = azurerm_resource_group.autodrive.location
  resource_group_name = azurerm_resource_group.autodrive.name
  workspace_id        = azurerm_log_analytics_workspace.autodrive.id
  application_type    = "web"
  tags                = local.common_tags
}
