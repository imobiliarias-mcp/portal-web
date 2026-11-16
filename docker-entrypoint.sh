#!/bin/sh
# Applies pending migrations, makes sure the local administrator exists, then starts the server.
# Both steps are idempotent, so restarts are safe.
set -eu

./node_modules/.bin/prisma migrate deploy

if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  ./node_modules/.bin/tsx scripts/seed-admin.ts
fi

exec ./node_modules/.bin/next start -p "${PORT:-3100}"
