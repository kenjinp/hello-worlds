VERSION 0.6

build: 
  FROM node:16.14-alpine AS base
  ARG PNPM_VERSION=7.5.0
  ARG LIVEBLOCKS_API_KEY
  ARG APP="docs"
  ARG NODE_ENV="production"

  ENV APP=${APP}
  ENV NODE_OPTIONS="--max-old-space-size=1024"
  ENV LIVEBLOCKS_API_KEY=${LIVEBLOCKS_API_KEY}
  ENV NODE_ENV=${NODE_ENV}

  RUN npm --global install pnpm@${PNPM_VERSION}
  WORKDIR /root/monorepo
  RUN apk add --no-cache git
  COPY ./.npmrc .
  COPY ./pnpm-lock.yaml .
  COPY ./pnpm-workspace.yaml .
  RUN pnpm fetch
  COPY . .
  RUN pnpm install --filter "$APP..." --frozen-lockfile --unsafe-perm --offline
  RUN pnpm test --if-present --filter $APP
  RUN pnpm --filter "$APP..." build
  SAVE ARTIFACT apps/$APP/dist

deploy:
  ARG STACK="dev"
  ARG APP="docs"
  FROM pulumi/pulumi-nodejs
  COPY +build/apps/$APP/dist ./_site
  COPY infra ./infra
  WORKDIR infra
  RUN npm install
  RUN --secret PULUMI_ACCESS_TOKEN pulumi stack select $STACK
  RUN --secret PULUMI_ACCESS_TOKEN --secret AWS_ACCESS_KEY_ID --secret AWS_SECRET_ACCESS_KEY pulumi up -y --skip-preview