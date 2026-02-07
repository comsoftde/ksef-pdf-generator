# 1) build front (vite) z repo
FROM node:22.14.0-bookworm-slim AS build
WORKDIR /src
COPY . .
RUN npm ci
RUN npm run build

# 2) runtime: API + headless chromium
FROM node:22.14.0-bookworm-slim
WORKDIR /app

# Zainstaluj Playwright i Chromium + zależności systemowe
RUN npm i -g playwright@1.50.0 \
 && playwright install --with-deps chromium

# Skopiuj zbudowane pliki frontu
COPY --from=build /src/dist /app/dist

# Skopiuj API i zainstaluj deps
COPY api/package.json /app/api/package.json
COPY api/server.mjs /app/api/server.mjs
RUN cd /app/api && npm i --omit=dev

ENV PORT=8080
EXPOSE 8080
CMD ["node", "/app/api/server.mjs"]
