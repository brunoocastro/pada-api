FROM node:16-alpine AS base

WORKDIR /usr/src/pada-api

COPY [ "package.json", "package-lock.json", "./" ]

FROM base AS dev
ENV NODE_ENV=dev
RUN npm ci
COPY . .
CMD [ "npm", "run", "start:dev" ]
