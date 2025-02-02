# # Stage 1: Install dependencies
# FROM node:20 AS builder
# WORKDIR /usr/src/app

# COPY package*.json ./
# RUN npm install --only=production

# # Stage 2: Copy dependencies and set up runtime
# FROM ghcr.io/puppeteer/puppeteer:24.1.1
# WORKDIR /usr/src/app

# USER root
# RUN chown -R node:node /usr/src/app
# USER node

# COPY --from=builder /usr/src/app/node_modules ./node_modules
# COPY --chown=node . .

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# CMD ["node", "server.js"]


FROM ghcr.io/puppeteer/puppeteer:24.1.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD [ "node", "server.js" ]