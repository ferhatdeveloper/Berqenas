# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

# Clean install to avoid lockfile issues and increase memory for build
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN rm -rf package-lock.json node_modules && \
    npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config (optional custom config)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
