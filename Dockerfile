FROM node:20
FROM ghcr.io/puppeteer/puppeteer:24.1.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "server.js" ]
