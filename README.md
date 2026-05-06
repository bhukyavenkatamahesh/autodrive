# AutoDrive — Cloud Native Used-Car Marketplace

AI-powered used-car marketplace, deployed on Microsoft Azure with a full
production-grade cloud stack.

**Live demo:** https://autodriveai.duckdns.org
**Chatbot (Ashad):** https://autodrive-chatbot.azurewebsites.net
**ML service (Samarth):** https://autodrive-ml-samarth.azurewebsites.net (Swagger: `/docs`)

Built for the Cloud Computing course at IIT Delhi by:
**Venkata Mahesh** (frontend, auth, cars, reviews, infra) ·
**Ashad** (RAG chatbot) ·
**Samarth** (ML price + sentiment) ·
**Pritam** (backend support)

---

## What it does

- Browse used cars with filters (brand, fuel type, body type, price, location, search, sort)
- AI chatbot ("CarBot") — RAG over live inventory, voice-enabled, deployed by Ashad on App Service
- ML-based fair-price prediction (XGBoost) + sentiment analysis (DistilBERT) — deployed by Samarth on App Service
- Email / password login + JWT auth
- Test-drive booking with conflict detection
- Reviews with auto-tagged sentiment badge (positive / negative / neutral)
- Admin panel to post / edit / delete cars

---

## System Architecture

```
                                 ┌──────────────────────────────────┐
                                 │  autodriveai.duckdns.org (HTTPS) │
                                 │  Let's Encrypt — auto-renew      │
                                 └────────────────┬─────────────────┘
                                                  │
                                       ┌──────────▼──────────┐
                                       │ Azure Public LB     │
                                       └──────────┬──────────┘
                                                  │
                                       ┌──────────▼──────────┐
                                       │ NGINX Ingress       │
                                       │ (TLS termination)   │
                                       └─┬────┬────┬────┬────┘
                                         │    │    │    │
            /                /auth        │ /api  /reviews
            │                  │          │  │       │
        ┌───▼────┐         ┌───▼────┐  ┌──▼──▼──┐ ┌──▼──────┐
        │frontend│         │  auth  │  │  cars  │ │ reviews │
        │Next.js │         │Fastify │  │FastAPI │ │ Fastify │
        │  AKS   │         │  AKS   │  │  AKS   │ │   AKS   │
        └────────┘         └───┬────┘  └────┬───┘ └────┬────┘
                               │            │          │
                               └────────────┼──────────┘
                                            │
                              ┌─────────────▼─────────────┐
                              │  Azure Postgres Flexible   │
                              │  Server (v16, Burstable)   │
                              └────────────────────────────┘

  External services (cross-account, integrated via HTTPS):

  Ashad's Chatbot ←  iframe / redirect from /chat
  ──────────────────────────────────────────────────
  https://autodrive-chatbot.azurewebsites.net
  FastAPI on Azure App Service · GPT-4o · RAG over live cars

  Samarth's ML  ←  POST /predict/price + POST /sentiment
  ──────────────────────────────────────────────────
  https://autodrive-ml-samarth.azurewebsites.net
  FastAPI on Azure App Service · XGBoost · DistilBERT
```

All infrastructure is declared in Terraform. Every push to `main` triggers
GitHub Actions: build Docker images → push to ACR → `helm upgrade` against
AKS → cert-manager renews TLS → ingress routes traffic.

---

## Cloud services in use

| Service | Role |
|---|---|
| **Azure Kubernetes Service (AKS)** | Runs frontend + auth + cars + reviews as Helm-managed deployments |
| **Azure Container Registry (ACR)** | Stores Docker images for all 4 services |
| **Azure Database for PostgreSQL Flexible Server** | Cars, users, bookings (in-memory for reviews) |
| **Azure Key Vault (RBAC mode)** | Postgres URL, JWT secret, AppInsights string — fetched by CI |
| **Azure Log Analytics Workspace** | Central logs from AKS containers |
| **Azure Application Insights** | APM + request tracing (workspace-based) |
| **Azure Public Load Balancer** | Front door via NGINX Ingress |
| **Managed Identity on AKS** | ACR pull + Key Vault read with no static creds in cluster |
| **cert-manager + Let's Encrypt** | Automated TLS issuance + renewal |
| **GitHub Actions** | CI/CD — build, push to ACR, helm upgrade |
| **DuckDNS** | Free DNS pointing at the AKS load-balancer IP |

External (different Azure subscriptions):

| Owner | Service | Live URL | Used by |
|---|---|---|---|
| Ashad | Chatbot | `https://autodrive-chatbot.azurewebsites.net` | `/chat` redirect + floating widget iframe |
| Samarth | ML price + sentiment | `https://autodrive-ml-samarth.azurewebsites.net` | Frontend price valuation + reviews sentiment |

---

## Repository layout

```
autodrive/
├── frontend/              # Next.js 14 app (standalone build, TS, Tailwind)
│   └── Dockerfile
├── services/
│   ├── auth/              # Fastify + JWT (Node 20)
│   ├── cars/              # FastAPI + psycopg (Python 3.11) — primary data API
│   └── reviews/           # Fastify + JWT — calls Samarth's /sentiment
├── infra/
│   ├── terraform/         # RG, AKS, ACR, Postgres, KV, AppInsights, LAW
│   └── helm/autodrive/    # Single chart for all 4 services
│       └── templates/     # deployments + svc + HPA + ingress + TLS
├── .github/workflows/
│   └── deploy.yml         # build-and-push → helm-deploy
├── DEPLOY.md              # end-to-end first-deploy guide
└── README.md
```

---

## Request flow (loading a car detail page)

1. Browser → `https://autodriveai.duckdns.org/cars/1`
2. Azure LB → NGINX ingress → TLS terminate → `frontend` pod
3. Next.js renders, fires `GET /api/cars/1` for car data
4. Ingress regex `/api(/|$)(.*)` strips prefix → `cars` pod → Postgres → JSON
5. Browser fires `POST https://autodrive-ml-samarth.azurewebsites.net/predict/price` for live ML valuation
6. Browser fires `GET /reviews/1` → ingress → `reviews` pod → in-memory list
7. Posting a review → `POST /reviews/1` → reviews pod → calls Samarth's `/sentiment` → review saved with sentiment label

---

## Auto-scaling (HPA v2)

| Service | Min | Max | Target CPU |
|---|---|---|---|
| auth | 1 | 4 | 70% |
| cars | 1 | 4 | 70% |
| frontend | 1 | 3 | 75% |
| reviews | 1 | 3 | 70% |

(Tuned for a single Standard_B2s node. Bump min/max when scaling node pool.)

---

## CI/CD

Every push to `main`:

1. **build-and-push** — builds 4 Docker images (auth, cars, reviews, frontend),
   tags with the commit SHA + `:latest`, pushes to ACR
2. **helm-deploy** — fetches Postgres URL + JWT secret from Key Vault,
   runs `helm upgrade --install autodrive infra/helm/autodrive` with the
   new image tags, waits for rollout

GitHub repo secrets: `AZURE_CREDENTIALS`.
GitHub repo variables: `AZURE_RESOURCE_GROUP`, `AKS_CLUSTER_NAME`, `ACR_NAME`,
`KEY_VAULT_NAME`, `CHATBOT_PUBLIC_URL`, `FRONTEND_PUBLIC_URL`, `INGRESS_HOST`,
`INGRESS_TLS_ENABLED`.

See `.github/workflows/deploy.yml`.

---

## Local development

```bash
# Backend
cd services/cars && pip install -r requirements.txt && uvicorn app.main:app --port 8001
cd services/auth && npm install && npm run dev
cd services/reviews && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

Each service defaults to `postgresql://postgres:postgres@localhost:5432/autodrive`.

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

# Point your domain at the ingress IP, configure GitHub secrets/vars,
# then push to main — CI does the rest.
```

---

## License

MIT — IIT Delhi Cloud Computing course project.
