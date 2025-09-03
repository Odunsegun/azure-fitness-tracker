<# =========================
  setup.ps1  (stable version)
  Usage (recommended):  . .\setup.ps1
  Or just:              .\setup.ps1   (works too; we use $global: vars)
========================= #>

param(
  [string]$ResourceGroup = "fit-rg",
  [string]$Location      = "canadacentral",
  [string]$DbName        = "FitnessDB",
  [string]$Container     = "Activities",

  # If you already know the exact names, pass them in here:
  [string]$StorageAccount,   # e.g. "fitstor"
  [string]$CosmosAccount,    # e.g. "fit-cosmos-12345"
  [string]$FunctionApp       # e.g. "fit-func-123456"
)

Write-Host " Loading Azure context..."

# 1) Ensure you're logged in and capture subscription
$global:SUB = az account show --query id -o tsv 2>$null
if (-not $global:SUB) {
  throw "Not logged in. Run: az login --use-device-code"
}

# 2) Base globals
$global:RG   = $ResourceGroup
$global:LOC  = $Location
$global:DB   = $DbName
$global:COLL = $Container

# Helper
function FirstOrNull($list) { if ($list -and $list.Count -gt 0) { $list[0] } else { $null } }

# 3) Discover existing resources if not provided
if (-not $StorageAccount) {
  $sa = az storage account list -g $global:RG --query "[].name" -o tsv 2>$null
  $StorageAccount = FirstOrNull($sa)
}
if (-not $CosmosAccount) {
  $ca = az cosmosdb list -g $global:RG --query "[].name" -o tsv 2>$null
  if (-not $ca) { $ca = az cosmosdb list --query "[].name" -o tsv 2>$null }
  $CosmosAccount = FirstOrNull($ca)
}
if (-not $FunctionApp) {
  $fa = az functionapp list -g $global:RG --query "[].name" -o tsv 2>$null
  $FunctionApp = FirstOrNull($fa)
}

# 4) Promote to globals
$global:STG    = $StorageAccount
$global:COSMOS = $CosmosAccount
$global:APP    = $FunctionApp

# 5) Friendly warnings if somethings missing
if (-not $global:STG)    { Write-Warning "No Storage Account found in RG '$($global:RG)'. Pass -StorageAccount or create one." }
if (-not $global:COSMOS) { Write-Warning "No Cosmos Account found. Pass -CosmosAccount or create one." }
if (-not $global:APP)    { Write-Warning "No Function App found. Pass -FunctionApp or create one." }

# 6) Set Azure CLI defaults (optional but handy)
az configure --defaults subscription=$global:SUB group=$global:RG location=$global:LOC 1>$null

# 7) Try to fetch Cosmos connection string
$global:COSMOS_CONN = $null
if ($global:COSMOS) {
  try {
    $global:COSMOS_CONN = az cosmosdb keys list `
      -g $global:RG -n $global:COSMOS `
      --type connection-strings `
      --query 'connectionStrings[0].connectionString' -o tsv
  } catch {
    Write-Warning "Could not fetch Cosmos connection string. Check the account name/RG and provider registration."
  }
}

# 8) Summary
Write-Host ""
Write-Host " Variables loaded:"
Write-Host "  SUB   = $($global:SUB)"
Write-Host "  RG    = $($global:RG)"
Write-Host "  LOC   = $($global:LOC)"
Write-Host "  STG   = $($global:STG)"
Write-Host "  COSMOS= $($global:COSMOS)"
Write-Host "  DB    = $($global:DB)"
Write-Host "  COLL  = $($global:COLL)"
Write-Host "  APP   = $($global:APP)"
if ($global:COSMOS_CONN) {
    Write-Host "  COSMOS_CONN acquired OK"
}
else{
  Write-Host " COSMOS_CONN not set (will skip)"
}
