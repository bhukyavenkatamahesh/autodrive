# AutoDrive

AI-powered used-car marketplace, deployed on Microsoft Azure with a full
production-grade cloud stack.

**Live demo:** https://autodriveai.duckdns.org
**Chatbot (separate Azure account):** https://autodrive-chatbot.azurewebsites.net

Built for the Cloud Computing course at IIT Delhi.

---

## What it does

- Browse verified used cars with filters (brand, fuel type, body type, price range, location)
- AI chatbot ("CarBot") for natural-language car discovery (RAG over the live car inventory)
- ML-based fair-price prediction shown alongside every listing
- Login with email/password, Google, or GitHub OAuth
- Test-drive booking with conflict detection
- Admin panel to post/edit/delete cars

---

## Architecture

```
                         ┌─────────────────────────────────┐
                         │  autodriveai.duckdns.org (HTTPS)│
                         │  Let's Encrypt cert (auto-renew)│
                         └───────────────┬─────────────────┘
                                         │
                         ┌───────────────▼─────────────────┐
                         │      NGINX Ingress Controller   │
                         │      (Azure public LB)          │
                         └──┬────────────┬────────────┬────┘
                            │            │            │
                  ┌─────────▼──┐  ┌──────▼───┐  ┌─────▼──────┐
                  │  frontend  │  │   auth   │  │   cars     │
                  │ (Next.js)  │  │(Fastify) │  │ (FastAPI)  │
                  │  2 pods    │  │ 2 pods   │  │  2 pods    │
                  │  HPA 2→4   │  │ HPA 2→5  │  │  HPA 2→5   │
                  └────────────┘  └─────┬────┘  └──────┬─────┘
                                        │              │
                                        └──────┬───────┘
                                               │
                             ┌─────────────────▼──────────────────┐
                             │  Azure Postgres Flexible Server    │
                             │  (v16, Standard_B1ms)              │
                             └────────────────────────────────────┘

        ┌──────────────────────────────────────────────────────────────┐
        │  Azure Key Vault — postgres-url, jwt-secret, OAuth, AppI     │
        │  Azure Container Registry — images pushed by CI              │
        │  Application Insights + Log Analytics — APM & centralised    │
        └──────────────────────────────────────────────────────────────┘

  (cross-account) ↔  Ashad's Chatbot (App Service, different Azure sub)
```

All infrastructure is declared in Terraform. Every git push to `main`
triggers GitHub Actions: build Docker images → push to ACR → `helm
upgrade` against AKS.

---

## Cloud services in use

| Service | Purpose |
|---|---|
| **Azure Kubernetes Service (AKS)** | Runs frontend + auth + cars as Helm-managed deployments with HPA |
| **Azure Container Registry (ACR)** | Stores Docker images for all 3 services |
| **Azure Database for PostgreSQL (Flexible Server)** | Cars, users, bookings, reviews |
| **Azure Key Vault (RBAC mode)** | DB URL, JWT, OAuth creds, AppInsights string. CI fetches at deploy time |
| **Azure Log Analytics Workspace** | Central logs from AKS containers |
| **Azure Application Insights** | APM + request tracing (workspace-based) |
| **Azure Public Load Balancer** | Front door via NGINX Ingress |
| **Managed Identity on AKS** | Pulls from ACR + reads Key Vault without static creds in cluster |
| **cert-manager + Let's Encrypt** | Automated TLS cert issuance + renewal |
| **GitHub Actions** | CI/CD — build, push to ACR, helm upgrade |
| **DuckDNS** | Free DNS pointing at the AKS load-balancer IP |

---

## Repository layout

```
autodrive/
├── frontend/              # Next.js 14 app (standalone build, TS, Tailwind)
│   └── Dockerfile         # baked-in NEXT_PUBLIC_* for relative API paths
├── services/
│   ├── auth/              # Fastify + JWT + OAuth (Node 20)
│   └── cars/              # FastAPI + psycopg (Python 3.11)
├── infra/
│   ├── terraform/         # RG, AKS, ACR, Postgres, KV, AI, LAW
│   └── helm/autodrive/    # Single chart for all 3 services
│       └── templates/     # deployments + svc + HPA + ingress + TLS
├── .github/workflows/
│   └── deploy.yml         # build-and-push → helm-deploy
└── DEPLOY.md              # end-to-end first-deploy guide
```

---

## Request flow (loading the homepage)

1. Browser → `https://autodriveai.duckdns.org/`
2. Azure LB → NGINX ingress → `frontend` service → Next.js pod
3. Next.js pod renders and calls `/api/cars` to populate listings
4. NGINX ingress matches `/api(/|$)(.*)` rule, strips prefix, routes to `cars`
5. `cars` pod queries Postgres Flexible Server over SSL
6. Response bubbles back up the same chain
7. TLS is terminated at the ingress; all secrets come from Key Vault
   (fetched at deploy time, mounted as K8s Secrets)

---

## Auto-scaling

Each service has an HPA (HorizontalPodAutoscaler v2):

| Service | Min | Max | Target CPU |
|---|---|---|---|
| auth | 2 | 5 | 70% |
| cars | 2 | 5 | 70% |
| frontend | 2 | 4 | 75% |

Load-test with `hey` / `ab` scales pods 2 → 4-5 in ~60s and back down
after cooldown.

---

## CI/CD

Every push to `main`:

1. **build-and-push** — builds 3 Docker images (auth, cars, frontend),
   tags `:sha` and `:latest`, pushes to ACR
2. **helm-deploy** — fetches Postgres URL + JWT secret from Key Vault,
   runs `helm upgrade --install autodrive infra/helm/autodrive` with the
   new image tags, waits for rollout (8 min timeout)

Secrets live as GitHub repo secrets; environment config as GitHub repo
variables. See `.github/workflows/deploy.yml`.

---

## Local development

```bash
# Backend
cd services/cars && pip install -r requirements.txt && uvicorn app.main:app --port 8001
cd services/auth && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

Needs a local Postgres. Each service defaults to
`postgresql://postgres:postgres@localhost:5432/autodrive`.

---

## Deploying to Azure from scratch

See [DEPLOY.md](./DEPLOY.md). Short version:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # paste your subscription_id
terraform init && terraform apply

# Install NGINX ingress + cert-manager on the cluster
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.15.3/cert-manager.yaml

# Point your domain at the ingress public IP, then configure GitHub
# secrets + variables and push to main — CI does the rest.
```

---

## Team

- **Venkata Mahesh** — frontend + backend (auth, cars) + infra + deployment
- **Ashad** — AI chatbot (deployed separately on Azure App Service)
- **Pritam** — backend (reviews service)
- **Samarth** — ML price prediction model

---

## License

MIT — IIT Delhi Cloud Computing course project, April 2026.
