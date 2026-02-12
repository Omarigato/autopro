FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Argument for build-time environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Build the Next.js app
RUN npm run build

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
