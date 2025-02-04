# Node image with Alpine Linux
FROM node:20-alpine

# Installs apk dependencies
RUN apk add --no-cache python3 make g++ varnish postgresql-client jq

# Sets the working directory
WORKDIR /app

# Starts varnish
COPY default.vcl ./etc/varnish/default.vcl

# Copy package.json first for caching
COPY package*.json ./

# Installs node dependencies
RUN npm install

# Copies the rest of the API source code
COPY . .

# Compiles the API
RUN npm run build

# Adds script execution permissions
RUN chmod +x /app/entrypoint.sh /app/update_osv.sh

# Exposes API port
EXPOSE 8080

# Starts the update script and executes the entrypoint script
CMD /bin/sh -c "/app/update_osv.sh && exec /entrypoint.sh"
