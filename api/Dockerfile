FROM node:22-bookworm-slim

WORKDIR /app

COPY api/package.json .
RUN npm install --omit=dev

COPY api/server.mjs .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.mjs"]
