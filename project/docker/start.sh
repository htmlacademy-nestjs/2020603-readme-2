#!/bin/sh
# Запуск сервиса в контейнере: sh docker/start.sh <app>.
# Сервис с базой сначала применяет миграции, а при первом запуске заполняет
# базу демо-данными. Отметка о заполнении хранится в томе /app/state и
# удаляется вместе с базами по docker compose down -v, поэтому перезапуск
# контейнера не стирает созданные при проверке данные.
set -e

app="$1"
config="apps/$app/prisma.config.ts"

if [ -f "$config" ]; then
  npx prisma migrate deploy --config "$config"

  marker="/app/state/$app.seeded"
  if [ -f "apps/$app/prisma/seed.ts" ] && [ ! -f "$marker" ]; then
    npx prisma db seed --config "$config"
    mkdir -p /app/state
    touch "$marker"
  fi
fi

exec node "apps/$app/dist/main.js"
