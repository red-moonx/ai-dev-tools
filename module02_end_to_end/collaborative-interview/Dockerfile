# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy client source
COPY client/ ./

# Build the frontend
RUN npm run build

# Stage 2: Setup backend and serve
FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies (production only)
WORKDIR /app/server
RUN npm ci --production

# Copy server source
COPY server/ ./

# Copy built frontend from stage 1
COPY --from=frontend-build /app/client/dist /app/client/dist

# Copy root package.json for potential scripts
COPY package.json /app/

# Set working directory to app root
WORKDIR /app

# Expose port (Render will map this)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the server
CMD ["npm", "run", "server"]
