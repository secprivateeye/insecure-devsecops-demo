// infra/insecure-storage.tf
// Intentionally insecure Azure Storage configuration (for IaC scanning demos)

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-devsecops-demo"
  location = "eastus"
}

resource "azurerm_storage_account" "insecure" {
  name                     = "devsecopsinsecuredemo"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  // Insecure: allow blob public access
  allow_blob_public_access = true

  // Insecure: TLS version not enforced to latest
  min_tls_version = "TLS1_0"

  network_rules {
    default_action = "Allow" // overly permissive, no IP restriction
  }
}
