FROM node:22.14.0-bookworm-slim AS build
WORKDIR /src
COPY . .
RUN npm ci
RUN npm run build

FROM node:22.14.0-bookworm-slim
WORKDIR /app

RUN npm i -g playwright@1.50.0 \
 && playwright install --with-deps chromium

COPY --from=build /src/dist /app/dist

COPY api/package.json /app/api/package.json
COPY api/server.mjs /app/api/server.mjs
RUN cd /app/api && npm i --omit=dev

ENV PORT=8080
EXPOSE 8080
CMD ["node", "/app/api/server.mjs"]
