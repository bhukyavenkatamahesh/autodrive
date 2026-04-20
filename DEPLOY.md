# AutoDrive — Azure Deployment Guide

End-to-end deploy of frontend + auth + cars onto AKS in Central India, with Postgres Flexible, ACR, Key Vault, Log Analytics, and App Insights. Target demo date: 7 May.

## Architecture at a glance

```
                    ┌──────────── Azure (Central India) ────────────┐
user ─── HTTPS ──▶  │  NGINX Ingress (public LB) ──▶ frontend pod    │
                    │                             ├─▶ auth pod       │
                    │                             └─▶ cars pod       │
                    │   Postgres Flexible (B1ms)  │                   │
                    │   Key Vault                 │                   │
                    │   ACR  •  Log Analytics  •  App Insights        │
                    └─────────────────────────────────────────────────┘
Chatbot (separate Azure App Service) is consumed by the frontend via its public URL.
```

## Cost (approximate, per month)

| Resource | Est. $/mo |
| --- | --- |
| AKS 1 × Standard_B2s (control plane free) | 30 |
| Postgres Flexible B1ms, 32 GB | 13 |
| ACR Basic | 5 |
| Key Vault | 1 |
| Log Analytics + App Insights (stay under 5 GB/mo) | 3 |
| NGINX ingress LB + public IP | 18 |
| **Total** | **~70** |

Plus the teammate's chatbot on App Service (~$10 = ₹784 observed).

## One-time bootstrap (runs on your laptop)

### 1. Provision infrastructure

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # already has your subscription id
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Takes ~8–12 min (AKS is the slow one). Capture the outputs:

```bash
terraform output
# and save secrets:
terraform output -raw postgres_connection_string > /tmp/pg_conn.txt
terraform output -raw static_web_app_api_key 2>/dev/null || true   # (removed, ignore)
```

### 2. Wire kubectl to the cluster

```bash
eval "$(terraform output -raw aks_get_credentials_command)"
kubectl get nodes
```

### 3. Install NGINX ingress controller (one-time)

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.externalTrafficPolicy=Local \
  --set controller.replicaCount=1

# Wait for the public IP:
kubectl get svc -n ingress-nginx ingress-nginx-controller -w
```

When `EXTERNAL-IP` appears, copy it. Call it `INGRESS_IP`. The app will live at `http://<INGRESS_IP>.nip.io/`.

### 4. Create the GitHub Actions service principal

```bash
SUB_ID=991574bb-5c28-4842-96d3-5ebec81e2b23
RG=$(terraform output -raw resource_group)

az ad sp create-for-rbac \
  --name "sp-autodrive-gh" \
  --role Contributor \
  --scopes "/subscriptions/${SUB_ID}/resourceGroups/${RG}" \
  --sdk-auth
```

Copy the whole JSON blob — you'll paste it into the GitHub secret `AZURE_CREDENTIALS`.

Also grant the SP pull-access to the Key Vault so the workflow can read secrets:

```bash
SP_OBJ=$(az ad sp list --display-name sp-autodrive-gh --query "[0].id" -o tsv)
KV=$(terraform output -raw key_vault_name)
az role assignment create \
  --assignee-object-id "$SP_OBJ" \
  --assignee-principal-type ServicePrincipal \
  --role "Key Vault Secrets User" \
  --scope "$(az keyvault show --name "$KV" --query id -o tsv)"
```

### 5. Configure GitHub repository settings

In **Settings → Secrets and variables → Actions**, add:

**Repository secrets:**

| Name | Value |
| --- | --- |
| `AZURE_CREDENTIALS` | the JSON from step 4 |
| `GOOGLE_CLIENT_ID` | (optional, for OAuth) |
| `GOOGLE_CLIENT_SECRET` | (optional) |
| `GITHUB_CLIENT_ID` | (optional) |
| `GITHUB_CLIENT_SECRET` | (optional) |

**Repository variables:**

| Name | Value |
| --- | --- |
| `AZURE_RESOURCE_GROUP` | `terraform output -raw resource_group` |
| `AKS_CLUSTER_NAME` | `terraform output -raw aks_cluster_name` |
| `ACR_NAME` | `terraform output -raw acr_name` |
| `KEY_VAULT_NAME` | `terraform output -raw key_vault_name` |
| `CHATBOT_PUBLIC_URL` | `https://autodrive-chatbot.azurewebsites.net` |
| `FRONTEND_PUBLIC_URL` | `http://<INGRESS_IP>.nip.io` |
| `AUTH_PUBLIC_URL` | `http://<INGRESS_IP>.nip.io/auth` |

### 6. First deploy

Push to `main`, or trigger manually:

```bash
gh workflow run deploy.yml
```

The workflow:
1. Builds and pushes `autodrive-auth`, `autodrive-cars`, `autodrive-frontend` to ACR (tagged with the short SHA).
2. Pulls `postgres-url` and `jwt-secret` from Key Vault.
3. Runs `helm upgrade --install autodrive` on AKS with those secrets.

Watch progress:

```bash
kubectl -n autodrive get pods -w
kubectl -n autodrive get ingress,svc,hpa
```

### 7. Visit the app

`http://<INGRESS_IP>.nip.io/` — Next.js homepage. `/cars`, `/cars/[id]`, `/login`, `/admin`, `/chat` all load through the same ingress.

## Day-to-day commands

```bash
# logs
kubectl -n autodrive logs -l app.kubernetes.io/component=auth -f
kubectl -n autodrive logs -l app.kubernetes.io/component=cars -f
kubectl -n autodrive logs -l app.kubernetes.io/component=frontend -f

# pod shell
kubectl -n autodrive exec -it deploy/autodrive-autodrive-auth -- sh

# quick HPA demo (load test)
kubectl -n autodrive run -it --rm load --image=busybox --restart=Never -- \
  /bin/sh -c 'while true; do wget -qO- http://autodrive-autodrive-cars:8001/cars > /dev/null; done'
# in another terminal:
kubectl -n autodrive get hpa -w
```

## Before demo day

1. Tighten the Postgres firewall — delete the `allow-all-temp-for-bootstrap` rule:
   ```bash
   az postgres flexible-server firewall-rule delete \
     --resource-group $(terraform output -raw resource_group) \
     --name $(terraform output -raw postgres_fqdn | cut -d. -f1) \
     --rule-name allow-all-temp-for-bootstrap --yes
   ```
2. Run a load test (e.g. `k6 run`) and screenshot the HPA scaling graph from Azure Monitor.
3. In Azure Portal → Monitor → Workbooks, add an App Insights dashboard showing request rates per service.

## Tear down (stop the meter)

```bash
cd infra/terraform
terraform destroy
```

Or pause AKS to stop node charges while keeping everything else:

```bash
az aks stop -g $(terraform output -raw resource_group) -n $(terraform output -raw aks_cluster_name)
# start again:
az aks start -g $(terraform output -raw resource_group) -n $(terraform output -raw aks_cluster_name)
```
