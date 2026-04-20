resource "azurerm_container_registry" "autodrive" {
  name                = "cr${var.project}${local.suffix}"
  resource_group_name = azurerm_resource_group.autodrive.name
  location            = azurerm_resource_group.autodrive.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = local.common_tags
}
