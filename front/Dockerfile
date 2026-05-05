FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Argument for build-time environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Backend URL for API proxy (override at runtime via docker-compose)
ARG API_BACKEND_URL=http://back:8000
ENV API_BACKEND_URL=$API_BACKEND_URL

# Build the Next.js app
RUN npm run build

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
