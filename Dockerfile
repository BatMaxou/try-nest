ARG NODE_VERSION=24

# Base image
FROM node:${NODE_VERSION}-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable;

# Main image
FROM base AS main

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch;
RUN pnpm install --frozen-lockfile --ignore-scripts=false;

# Dev image
FROM main AS dev

COPY . .

CMD ["pnpm", "run", "start:dev"]

# Builder image
FROM main AS builder

COPY . .

RUN pnpm run build;

# Production image
FROM base AS prod

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

ENV NODE_ENV=production

COPY --chown=nestjs:nodejs package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
