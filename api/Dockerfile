FROM node:20-alpine

# Installs services
RUN apk add --no-cache python3 make g++ varnish
RUN apk add --no-cache postgresql-client jq

# Starts varnish
COPY default.vcl ./etc/varnish/default.vcl

# Copies entrypoint
COPY entrypoint.sh /entrypoint.sh

# Copies package.json and package-lock.json
COPY package*.json ./

# Installs dependencies
RUN npm install
RUN npm install redis dotenv fastify firebase-admin dotenv redis @fastify/cors

# Copies the rest of the API source code
COPY . .

# Exposes port 8080
EXPOSE 8080

# Set execution permissions
RUN chmod +x /entrypoint.sh update_osv.sh

# Start both the update script and the backend
CMD /bin/sh -c "/app/update_osv.sh & exec /entrypoint.sh"
