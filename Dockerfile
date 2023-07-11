# https://www.tomray.dev/nestjs-docker-compose-postgres

FROM node:18-alpine AS dev 
WORKDIR /app
COPY --chown=node:node package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN yarn install --immutable --immutable-cache --check-cache
COPY --chown=node:node . .


FROM node:18-alpine AS build
WORKDIR /app
COPY --chown=node:node package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY --chown=node:node --from=dev /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN yarn build
USER node


FROM node:18-alpine AS prod
WORKDIR /app
COPY --chown=node:node --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
