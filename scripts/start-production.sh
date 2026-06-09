#!/usr/bin/env sh
set -e

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
SERVER="$ROOT/.medusa/server"

if [ ! -f "$SERVER/public/admin/index.html" ]; then
  echo "Admin build not found. Run: npm run build"
  exit 1
fi

if [ -f "$ROOT/.env" ]; then
  cp "$ROOT/.env" "$SERVER/.env.production"
fi

if [ ! -d "$SERVER/node_modules" ]; then
  ln -sf "$ROOT/node_modules" "$SERVER/node_modules"
fi

cd "$SERVER"
exec npx medusa start "$@"
