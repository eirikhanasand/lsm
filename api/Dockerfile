# Node image with Alpine Linux
FROM node:20-alpine

# Sets the working directory
WORKDIR /app

# Installs apk dependencies
RUN apk add --no-cache python3 make g++ varnish postgresql-client jq py3-pip bash python3-dev gcc musl-dev coreutils

# Virtual environment for Python packages
RUN python3 -m venv /opt/venv

# Installs gsutil and crcmod
RUN /opt/venv/bin/pip install gsutil crcmod

# Sets environment variables to use gsutil globally
ENV PATH="/opt/venv/bin:$PATH"

# Starts varnish
COPY ./api/default.vcl /etc/varnish/default.vcl

# Copy package.json first for caching
COPY ./api/package*.json ./

# Installs node dependencies
RUN npm install

# Copies the rest of the API source code
COPY ./api .

# Copies the env variables
COPY ../.env ../.env

# Compiles the API
RUN npm run build

# Adds script execution permissions
RUN chmod +x /app/entrypoint.sh /app/update_osv.sh /app/update_cve.sh /app/remote_osv.sh

# Cronjob to update osv hourly if using local osv
RUN sh -c '[ "$LOCAL_OSV" = "true" ] && echo "0 * * * * /bin/sh /app/update_osv.sh" >> /etc/crontabs/root || true'

# Cronjob to update CVE hourly
RUN echo '0 * * * * /bin/sh /app/update_cve.sh' >> /etc/crontabs/root

# Exposes API port
EXPOSE 8080

# Starts the update script if using local osv and executes the entrypoint script
CMD ["stdbuf", "-oL", "-eL", "/bin/bash", "-c", "[ \"$LOCAL_OSV\" = \"false\" ] && /app/remote_osv.sh || /app/update_osv.sh && /app/update_cve.sh && /app/entrypoint.sh"]
