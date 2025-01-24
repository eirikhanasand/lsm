# Node image with Alpine Linux
FROM node:20-alpine

# Installs Python
RUN apk add --no-cache python3 make g++ varnish

# Copies package.json and package-lock.json
COPY package*.json ./

# Installs dependencies
RUN npm install
RUN npm install redis dotenv fastify firebase-admin dotenv redis @fastify/cors

# Copies the rest of the API source code
COPY default.vcl ./etc/varnish/default.vcl
COPY varnish.vcl ./etc/varnish/default2.vcl
COPY . .

# Exposes port 8080
EXPOSE 8080
