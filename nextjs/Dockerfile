
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Set environment variables before copying source code
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_BASE_URL=https://vaoluoitv.net
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_LIVE_URL=https://vl25.live
ENV NEXT_PUBLIC_LIVE_URL=$NEXT_PUBLIC_LIVE_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Ldsp-ErAAAAAIdXwpqCdRXRD94s67k1f0VT3pBj
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_NEWS_API=https://luck8event.com/api
ENV NEXT_PUBLIC_NEWS_API=$NEXT_PUBLIC_NEWS_API
ARG NEXT_PUBLIC_WS_URL=https://api.vaoluoitv.com
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_API_URL=https://api.vaoluoitv.com/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_AUTH_LUCK8_URL=https://auth.luck8event.com/api/v1
ENV NEXT_PUBLIC_API_AUTH_LUCK8_URL=$NEXT_PUBLIC_API_AUTH_LUCK8_URL

# Copy package.json first (required for npm run build)
COPY package.json package-lock.json* ./

# Copy only necessary files for build (improves cache)
COPY next.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY components.json ./
COPY public ./public
COPY src ./src

# Build with Next.js cache mounting (BuildKit feature)
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public


RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 8080


CMD ["npm", "start"]