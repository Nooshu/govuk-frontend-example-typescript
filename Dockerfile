# Cloud Run image. Node compiles Sass, then serves the TypeScript app with tsx.
# Cloud Run injects PORT (8080). The process binds 0.0.0.0.

FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:styles
ENV NODE_ENV=production \
    DEMOS_ENABLED=true
EXPOSE 8080
CMD ["npx", "tsx", "src/main.ts"]
