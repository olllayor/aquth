FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
RUN pnpm run typecheck
EXPOSE 8787
CMD ["pnpm", "run", "dev", "--", "--ip", "0.0.0.0"]
