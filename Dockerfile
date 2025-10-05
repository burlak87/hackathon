FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .

RUN touch .env && echo "NODE_ENV=production" >> .env

ENTRYPOINT ["/usr/bin/tini", "--"]

EXPOSE 3000

CMD ["npm", "run", "dev"]