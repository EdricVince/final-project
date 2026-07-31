# Deployment

StudySpark ships with two deployment paths. Local development still uses **pnpm**
(`pnpm dev` in each package) — the artefacts below are for hosted deployment only.

## Option A — Render Blueprint (PaaS, recommended)

The repo root contains [`render.yaml`](./render.yaml), a Render Blueprint that
provisions both services in one step:

| Service | Type | Source |
|---|---|---|
| `studyspark-api` | Docker web service | [`quiz-app-be/Dockerfile`](./quiz-app-be/Dockerfile) |
| `studyspark-web` | Static site (CDN) | `pnpm --filter quiz-app-fe build` → `quiz-app-fe/dist` |

The database is **external Supabase PostgreSQL**, so the blueprint has no `databases:`
block — you provide `DB_*` and the other secrets as environment variables.

**Steps**
1. Push the repo to GitHub (this branch already contains `render.yaml`).
2. Render Dashboard → **New → Blueprint** → select this repo.
3. Render reads `render.yaml` and shows both services. Fill in every `sync: false`
   env var (DB credentials, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ANTHROPIC_API_KEY`, `SMTP_*`). `JWT_SECRET` / `ADMIN_SECRET` are auto-generated.
4. On the **web** service set the public env vars:
   - `VITE_API_BASE_URL` → `https://studyspark-api.onrender.com/api/v1`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   Then set the API service's `APP_URL` → `https://studyspark-web.onrender.com`.
5. **Apply** — Render builds the Docker API + the static SPA and deploys both.
   API health is checked at `/`.

> After the OAuth provider is configured, add the deployed web URL
> (`https://studyspark-web.onrender.com/**`) to **Supabase → Auth → URL Configuration**.

## Option B — Docker Compose (self-hosted)

[`docker-compose.yml`](./docker-compose.yml) builds both images locally:

```bash
docker compose up --build
# API  http://localhost:3000/api/v1   ·   Web  http://localhost:8080
```

Backend secrets are read from `quiz-app-be/.env`; the web image bakes the public
`VITE_*` values at build time via build args.
