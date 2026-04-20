resource "azurerm_kubernetes_cluster" "autodrive" {
  name                = "aks-${local.name_prefix}"
  location            = azurerm_resource_group.autodrive.location
  resource_group_name = azurerm_resource_group.autodrive.name
  dns_prefix          = "aks-${var.project}"
  sku_tier            = "Free"

  default_node_pool {
    name       = "default"
    node_count = var.aks_node_count
    vm_size    = var.aks_node_size

    upgrade_settings {
      max_surge = "10%"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.autodrive.id
  }

  tags = local.common_tags
}

resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = azurerm_container_registry.autodrive.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.autodrive.kubelet_identity[0].object_id
}
