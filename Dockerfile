FROM node:20-alpine AS base

RUN apk add --no-cache tzdata

ENV TZ=America/Sao_Paulo

USER node

WORKDIR /app

COPY --chown=node:node package*.json .

RUN npm ci --omit=dev


FROM base AS build

COPY --chown=node:node . .

RUN npm install && npm run build


FROM node:20-alpine AS production

RUN apk add --no-cache tzdata

ENV TZ=America/Sao_Paulo

USER node

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --chown=node:node . .

CMD ["node", "dist/main.js"]
