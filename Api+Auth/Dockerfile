# Etapa 1: build con bcrypt nativo
FROM node:18.20.3-alpine AS builder

WORKDIR /app

# Agregar herramientas necesarias para compilar bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Etapa 2: imagen liviana para producción
FROM node:18.20.3-alpine

WORKDIR /app

COPY --from=builder /app /app

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "src/server.js"]
