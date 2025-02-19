#!/bin/bash

export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U osvuser -d osvdb -t -c"
PSQL_MULTILINE="psql -h postgres -U osvuser -d osvdb -t"
HEALTH_FILE="/tmp/health_status"
echo "starting" > $HEALTH_FILE

gsutil -m cp gs://osv-vulnerabilities/all.zip osv.zip
mkdir -p osv

echo "Unzipping vulnerabilities archive..."
unzip -o osv.zip -d osv > /dev/null
rm osv.zip

TMP_DIR=$(mktemp -d)
echo "Preparing bulk insert with $(nproc) cores (this might take some time)..."

# Helper function to process the JSON files
process_json() {
    file="$1"
    vuln_name=$(basename "$file" .json)
    jq -r --arg vuln_name "$vuln_name" '
        [
            $vuln_name,
            (.affected[0].package.name // "unknown" | ascii_downcase),
            (.affected[0].package.ecosystem // "unknown" | ascii_downcase),
            (.affected[0].ranges[0].events[-1].introduced // "unknown"),
            (.affected[0].ranges[0].events[-1].fixed // "unknown"),
            (tostring)
        ] | @csv
    ' "$file"
}

# Exports function and dir
export -f process_json
export TMP_DIR

# Processes JSON files in parallel and creates CSV for bulk insert
find osv -name '*.json' -print0 | xargs -0 -P$(nproc) -I{} bash -c 'process_json "$@" > "$TMP_DIR/$(basename "$@").csv"' _ {}
cat "$TMP_DIR"/*.csv > vuln_data.csv
rm -rf "$TMP_DIR"

echo "Populating vulnerabilities..."

$PSQL "ALTER TABLE IF EXISTS vulnerabilities DROP CONSTRAINT IF EXISTS unique_name_ecosystem_version;"
$PSQL "DROP TABLE IF EXISTS vulnerabilities_new CASCADE;"
$PSQL "
CREATE UNLOGGED TABLE vulnerabilities_new (
    name TEXT,
    package_name TEXT NOT NULL,
    ecosystem TEXT NOT NULL,
    version_introduced TEXT NOT NULL,
    version_fixed TEXT NOT NULL,
    data JSONB NOT NULL
);"

$PSQL "
\COPY vulnerabilities_new (name, package_name, ecosystem, version_introduced, version_fixed, data)
FROM 'vuln_data.csv'
WITH (FORMAT csv, DELIMITER ',', QUOTE '\"', ESCAPE '\"');
"

$PSQL_MULTILINE <<EOF
BEGIN;
    ALTER TABLE vulnerabilities_new ADD PRIMARY KEY (name);
    ALTER TABLE vulnerabilities_new ADD CONSTRAINT unique_name_ecosystem_version
        UNIQUE (name, package_name, ecosystem, version_introduced, version_fixed);
    ALTER TABLE vulnerabilities_new SET LOGGED;
    ALTER TABLE IF EXISTS vulnerabilities RENAME TO vulnerabilities_old;
    ALTER TABLE vulnerabilities_new RENAME TO vulnerabilities;
    DROP TABLE IF EXISTS vulnerabilities_old;
COMMIT;
EOF

# rm -rf osv vuln_data.csv

echo "healthy" > $HEALTH_FILE
echo "Database ready."

# 10s pull
# 120s install
# 140s download starts
# 153s unzip
# 183s bulk insert
# 353s done
