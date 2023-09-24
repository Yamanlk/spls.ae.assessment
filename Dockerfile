FROM node:20-slim AS base

# libssl/openssl required for Prisma to work
RUN apt-get update -y && apt-get install -y openssl

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./


FROM base as build-dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base as production-dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM build-dependencies AS service-bus-ingesters-build
WORKDIR /app
COPY . .
RUN pnpm prisma generate --schema ./apps/service-bus-ingesters/prisma/schema.prisma
RUN pnpm build service-bus-ingesters

FROM build-dependencies AS event-hubs-sender-build
WORKDIR /app
COPY . .
RUN pnpm build event-hubs-sender

FROM build-dependencies AS events-hub-ingesters-build
WORKDIR /app
COPY . .
RUN pnpm build events-hub-ingesters

FROM production-dependencies as service-bus-ingesters
COPY --from=service-bus-ingesters-build /app/node_modules/@prisma/client/service-bus-ingesters /app/node_modules/@prisma/client/service-bus-ingesters
COPY --from=service-bus-ingesters-build /app/dist/apps/service-bus-ingesters/main.js /app/dist/apps/service-bus-ingesters/main.js
CMD [ "node", "dist/apps/service-bus-ingesters/main.js" ]

FROM production-dependencies as event-hubs-sender
COPY --from=event-hubs-sender-build /app/dist/apps/event-hubs-sender/main.js /app/dist/apps/event-hubs-sender/main.js
CMD [ "node", "dist/apps/event-hubs-sender/main.js" ]

FROM production-dependencies as events-hub-ingesters
COPY --from=events-hub-ingesters-build /app/dist/apps/events-hub-ingesters/main.js /app/dist/apps/events-hub-ingesters/main.js
CMD [ "node", "dist/apps/events-hub-ingesters/main.js" ]