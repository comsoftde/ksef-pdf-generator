# 1) build front (vite) z repo
FROM node:22-bookworm-slim AS build
WORKDIR /src
COPY . .
RUN npm ci
RUN npm run build:public

# 2) runtime
FROM node:22-bookworm-slim
WORKDIR /app

# Skopiuj zbudowane pliki frontu
COPY --from=build /src/dist /app/dist

# Skopiuj API + zainstaluj deps
COPY api/package.json /app/api/package.json
COPY api/server.mjs /app/api/server.mjs
RUN cd /app/api && npm i --omit=dev

# KLUCZ: zainstaluj chromium dla TEJ instalacji playwright (lokalnej)
RUN cd /app/api && npx playwright install --with-deps chromium

ENV PORT=8080
EXPOSE 8080
CMD ["node", "/app/api/server.mjs"]
