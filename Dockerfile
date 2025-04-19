# Step 1: Build app
FROM node:23-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Debug step: List contents of /usr/src/app
RUN ls -la /usr/src/app
RUN ls -la /usr/src/app/dist

# ---- Step 2: Production image ----
FROM node:23-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/.env ./

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
