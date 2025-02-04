# Use Alpine-based Node.js
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache python3 make g++ varnish postgresql-client jq

# Set the working directory
WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./

# Install ALL dependencies (including TypeScript & PostgreSQL client)
RUN npm install

# Copy the rest of the source code
COPY . .

# Compile TypeScript BEFORE running the backend
RUN npm run build

# Ensure scripts are executable
RUN chmod +x /app/entrypoint.sh /app/update_osv.sh

# Expose API port
EXPOSE 8080

# Run the update script before starting the backend
CMD /bin/sh -c "/app/update_osv.sh && exec node --max-old-space-size=24576 dist/src/index.js"
