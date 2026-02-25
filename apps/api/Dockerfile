FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app

# ── Install dependencies ────────────────────────────────────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/shared-validators/package.json packages/shared-validators/
COPY packages/shared-constants/package.json packages/shared-constants/
RUN pnpm install --frozen-lockfile --prod=false

# ── Build ────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY apps/api apps/api
COPY packages packages
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

RUN pnpm --filter @job-platform/shared-types build 2>/dev/null || true
RUN pnpm --filter @job-platform/shared-validators build 2>/dev/null || true
RUN pnpm --filter @job-platform/shared-constants build 2>/dev/null || true
RUN pnpm --filter @job-platform/api build

# ── Production image ─────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/apps/api/package.json ./
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/apps/api/node_modules ./apps_node_modules

USER appuser
EXPOSE 5000

CMD ["node", "dist/server.js"]
