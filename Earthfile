VERSION 0.6

build: 
  FROM node:18.12-alpine
  ARG PNPM_VERSION=7.19.0
  ARG LIVEBLOCKS_API_KEY
  ARG GITHUB_TOKEN
  ARG APP="docs"

  ENV APP=${APP}
  ENV NODE_OPTIONS="--max-old-space-size=1024"
  ENV NEXT_PUBLIC_LIVEBLOCKS_API_KEY=${NEXT_PUBLIC_LIVEBLOCKS_API_KEY}
  ENV NEXT_PUBLIC_GITHUB_TOKEN=${NEXT_PUBLIC_GITHUB_TOKEN}
  ENV NODE_ENV="development"

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
  ENV NODE_ENV="production"
  RUN pnpm --filter "$APP^..." build
  RUN pnpm --filter "$APP" build
  RUN pnpm --filter "$APP" export
  SAVE ARTIFACT apps/$APP/out

deploy:
  ARG STACK="dev"
  ARG APP="docs"
  FROM pulumi/pulumi-nodejs
  COPY +build/out ./_site
  RUN ls ./_site
  COPY infra ./infra
  WORKDIR infra
  RUN npm install
  RUN --secret PULUMI_ACCESS_TOKEN pulumi stack select $STACK
  RUN --secret PULUMI_ACCESS_TOKEN --secret AWS_ACCESS_KEY_ID --secret AWS_SECRET_ACCESS_KEY pulumi up -y --skip-preview