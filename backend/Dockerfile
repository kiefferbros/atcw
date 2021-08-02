FROM node:16-alpine AS base
WORKDIR /home/node/app
COPY "./package*.json"  ./
RUN npm install
COPY . .

FROM base as prod-build
ENV NODE_ENV=production
RUN npm run build

FROM node:16-alpine AS production
WORKDIR /home/node/app
ENV NODE_ENV=production
COPY "./package*.json"  ./
RUN npm install
COPY --from=prod-build /home/node/app/dist/ ./dist
