# 1. Build Stage für dein Next Frontend
FROM node:20 AS build

WORKDIR /app

# Zuerst nur package Dateien kopieren
COPY package.json package-lock.json* ./

# Dependencies installieren
# legacy-peer-deps löst deinen react vs react-custom-roulette Konflikt
RUN npm install --legacy-peer-deps

# Restlichen Code kopieren
COPY . .

# Production Build erzeugen
RUN npm run build

# 2. Runtime Stage
FROM node:20

WORKDIR /app

# Alles aus der Build Stage übernehmen
COPY --from=build /app ./

EXPOSE 3000

# Startscript
CMD ["node", "server.js"]