#!/bin/bash

export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U osvuser -d osvdb -t -c"
PSQL_MULTILINE="psql -h postgres -U osvuser -d osvdb -t"
HEALTH_FILE="/tmp/health_status"
echo "starting" > $HEALTH_FILE

gsutil cp gs://osv-vulnerabilities/all.zip osv.zip
mkdir -p osv

echo "Unzipping vulnerabilities archive..."
unzip -o osv.zip -d osv > /dev/null
rm osv.zip

echo "Preparing bulk insert..."
temp_file="vuln_data.csv"
rm -f $temp_file

# Processes JSON files in parallel and creates CSV for bulk insert
find osv -name '*.json' -print0 | xargs -P 32 -0 -I {} sh -c '
    file="{}"
    vuln_name="${file##*/}"
    vuln_name="${vuln_name%.json}"
    json_data=$(jq -c . "$file" | sed '"'"'s/"/""/g'"'"')
    package_name=$(jq -r ".affected[0].package.name" "$file" | tr "[:upper:]" "[:lower:]")
    ecosystem=$(jq -r ".affected[0].package.ecosystem" "$file" | tr "[:upper:]" "[:lower:]")
    version_introduced=$(jq -r ".affected[0].ranges[0].events[-1].introduced" "$file")
    version_fixed=$(jq -r ".affected[0].ranges[0].events[-1].fixed" "$file")
    package_name=${package_name:-"unknown"}
    ecosystem=${ecosystem:-"unknown"}
    version_introduced=${version_introduced:-"unknown"}
    version_fixed=${version_fixed:-"unknown"}
    echo "\"$vuln_name\",\"$package_name\",\"$ecosystem\",\"$version_introduced\",\"$version_fixed\",\"$json_data\"" >> "$1"
' _ "$temp_file"

echo "Populating vulnerabilities..."

$PSQL "ALTER TABLE IF EXISTS vulnerabilities DROP CONSTRAINT IF EXISTS unique_name_ecosystem_version;"

$PSQL "DROP TABLE IF EXISTS vulnerabilities_new CASCADE;"

$PSQL "
CREATE TABLE vulnerabilities_new (
    name TEXT PRIMARY KEY,
    package_name TEXT NOT NULL,
    ecosystem TEXT NOT NULL,
    version_introduced TEXT NOT NULL,
    version_fixed TEXT NOT NULL,
    data JSONB NOT NULL,
CONSTRAINT unique_name_ecosystem_version
UNIQUE (name, package_name, ecosystem, version_introduced, version_fixed)
);
"

$PSQL "\COPY vulnerabilities_new (name, package_name, ecosystem, version_introduced, version_fixed, data)
FROM '$temp_file'
WITH (FORMAT csv, DELIMITER ',', QUOTE '\"', ESCAPE '\"');
"

$PSQL_MULTILINE <<EOF
BEGIN;
    ALTER TABLE IF EXISTS vulnerabilities RENAME TO vulnerabilities_old;
    ALTER TABLE vulnerabilities_new RENAME TO vulnerabilities;
    DROP TABLE IF EXISTS vulnerabilities_old;
COMMIT;
EOF

echo "healthy" > $HEALTH_FILE
echo "Database ready."
