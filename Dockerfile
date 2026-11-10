# Development runtime. Digest pinning awaits registry access and validation.
FROM node:24.11.0-bookworm-slim
WORKDIR /app
RUN mkdir -p /app/node_modules && chown -R node:node /app
USER node
EXPOSE 5173
CMD ["sh", "-c", "npm ci && npm run dev"]
