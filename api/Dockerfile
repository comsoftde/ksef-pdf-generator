FROM node:22-bookworm-slim

WORKDIR /app

COPY api/package.json /app/api/package.json
RUN cd /app/api && npm i --omit=dev

COPY api/server.mjs /app/api/server.mjs

ENV PORT=8080
EXPOSE 8080

CMD ["node", "/app/api/server.mjs"]
