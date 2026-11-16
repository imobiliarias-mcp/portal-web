# syntax=docker/dockerfile:1
# Build context: this directory (portal_web/).

FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS builder
# Placeholders so module loading works during the build; no connection is opened and
# neither value reaches the runtime image.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build \
    BETTER_AUTH_SECRET=build-time-placeholder-not-used-at-runtime \
    NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

FROM deps AS runtime-deps
RUN --mount=type=cache,target=/root/.npm npm prune --omit=dev

FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=America/Sao_Paulo \
    GENERIC_TIMEZONE=America/Sao_Paulo \
    PORT=3100 \
    HOSTNAME=0.0.0.0
COPY --from=runtime-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/src ./src
COPY --chown=node:node package.json prisma.config.ts tsconfig.json next.config.ts ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node --chmod=755 docker-entrypoint.sh ./
USER node
EXPOSE 3100
HEALTHCHECK --interval=15s --timeout=5s --retries=5 --start-period=40s \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3100/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
ENTRYPOINT ["./docker-entrypoint.sh"]
