# Build stage
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package file only so build uses package.json directly
COPY package.json ./

# Install dependencies without using package-lock inside Docker
RUN npm install --no-package-lock

# Copy source code
COPY . .

# Build-time environment variables for Vite
ARG VITE_SERVER_API
ARG VITE_SOCKET_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_SERVER_API=${VITE_SERVER_API}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]