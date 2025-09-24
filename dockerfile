# Use slim Node base to keep image small
FROM node:22-slim

# Set work directory
WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the app
COPY index.js ./
COPY . .

# Environment defaults (override in compose/env file)
ENV TOKEN=changeme
ENV FREETUBE_DIR=/data/freetube
ENV EXPORT_DIR=/data/exports

# Create mountable volumes
VOLUME ["/freetube", "/exports"]
# 3000 is the default invidious port (and default for other services in the average homelab) so we use 3004
EXPOSE 3004

# Default command
CMD ["node", "index.js"]
# we shouldnt need to do anything else, just have the user mount /data to the FreeTube data directory