FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@12 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --prod --frozen-lockfile

COPY . .

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]