# ── Frontend (Vue 3 + Vite) — build then serve the static bundle via nginx. ──
# Build context is the repo ROOT (pnpm workspace). Public env is baked at build time.
# Build:  docker build -f quiz-app-fe/Dockerfile \
#           --build-arg VITE_API_BASE_URL=https://api.example.com/api/v1 \
#           --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_ANON_KEY=... \
#           -t studyspark-fe .

FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY quiz-app-be/package.json ./quiz-app-be/
COPY quiz-app-fe/package.json ./quiz-app-fe/
RUN pnpm install --frozen-lockfile --filter quiz-app-fe...
COPY quiz-app-fe ./quiz-app-fe
# Public (VITE_*) build-time env — baked into the client bundle.
ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN pnpm --filter quiz-app-fe build

FROM nginx:alpine AS runtime
COPY quiz-app-fe/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/quiz-app-fe/dist /usr/share/nginx/html
EXPOSE 80
