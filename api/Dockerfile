# Node image with Alpine Linux
FROM node:20-alpine

# Sets the working directory
WORKDIR /app

# Installs apk dependencies
RUN apk add --no-cache python3 make g++ varnish postgresql-client jq py3-pip bash python3-dev gcc musl-dev

# Virtual environment for Python packages
RUN python3 -m venv /opt/venv

# Installs gsutil and crcmod
RUN /opt/venv/bin/pip install gsutil crcmod

# Sets environment variables to use gsutil globally
ENV PATH="/opt/venv/bin:$PATH"

# Starts varnish
COPY default.vcl /etc/varnish/default.vcl

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

# Cronjob to update osv hourly
RUN echo '0 * * * * /bin/sh /app/update_osv.sh' >> /etc/crontabs/root

# Exposes API port
EXPOSE 8080

# Starts the update script and executes the entrypoint script
CMD /bin/sh -c "bash /app/update_osv.sh && /app/entrypoint.sh"
