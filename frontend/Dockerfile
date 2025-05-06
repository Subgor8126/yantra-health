# Stage 1: Build stage named "builder"
FROM node:18-alpine AS builder
WORKDIR /app

# Copy and install deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build with build-time variables (VITE_...)
ARG VITE_API_URL
ARG VITE_VIEWER_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_VIEWER_URL=$VITE_VIEWER_URL

RUN npm run build

# Stage 2: Serve static files
FROM nginx:alpine

# Copy built files from the builder stage to the nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf