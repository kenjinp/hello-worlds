FROM node:16.14-alpine AS base
ARG PNPM_VERSION=7.5.0
RUN npm --global install pnpm@${PNPM_VERSION}
WORKDIR /root/monorepo

FROM base AS build 
ARG APP="docs"
ENV APP=${APP}
ENV NODE_OPTIONS="--max-old-space-size=1024"
ARG LIVEBLOCKS_API_KEY
ENV LIVEBLOCKS_API_KEY=${LIVEBLOCKS_API_KEY}
RUN apk add --no-cache git
COPY ./.npmrc .
COPY ./pnpm-lock.yaml .
COPY ./pnpm-workspace.yaml .
RUN pnpm fetch
COPY . .
RUN pnpm install --filter "$APP..." --frozen-lockfile --unsafe-perm --offline
RUN pnpm test --if-present --filter $APP
ARG NODE_ENV="production"
ENV NODE_ENV=${NODE_ENV}
RUN pnpm --filter "$APP..." build

FROM alpine as prod
ENV PORT="3002"
EXPOSE $PORT
RUN apk add curl
RUN curl -L https://github.com/svenstaro/miniserve/releases/download/v0.20.0/miniserve-v0.20.0-x86_64-unknown-linux-musl > miniserve
RUN chmod +x miniserve
COPY --from=build /root/monorepo/apps/docs/build ./
CMD ./miniserve ./ --header "Cross-Origin-Opener-Policy:same-origin" --header "Cross-Origin-Embedder-Policy:require-corp" --spa --index index.html -p $PORT -g