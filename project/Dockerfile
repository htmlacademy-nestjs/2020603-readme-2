# Образ для запуска всего проекта в Docker (см. compose.yaml). Один образ на все
# пять сервисов: внутри зависимости, клиенты Prisma и собранные приложения, а
# какой сервис стартует, задаёт аргумент docker/start.sh.
FROM node:24-bookworm-slim

# Prisma CLI (миграции) нужна системная библиотека OpenSSL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

ENV NX_DAEMON=false \
  NX_NO_CLOUD=true \
  NX_SKIP_NX_CACHE=true

WORKDIR /app

# Сначала только манифесты: слой с node_modules пересобирается, лишь когда
# меняются зависимости.
COPY package.json package-lock.json ./
COPY apps/api-gateway/package.json apps/api-gateway/
COPY apps/blog/package.json apps/blog/
COPY apps/file-storage/package.json apps/file-storage/
COPY apps/notify/package.json apps/notify/
COPY apps/users/package.json apps/users/
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx nx run-many -t db-generate \
  && npx nx run-many -t build

ENTRYPOINT ["sh", "docker/start.sh"]
