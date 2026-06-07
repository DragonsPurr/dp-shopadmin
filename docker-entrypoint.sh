#!/bin/sh
set -e

cd /app/server

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  npx medusa db:migrate
fi

exec npx medusa start -H 0.0.0.0 -p "${PORT:-9000}"
