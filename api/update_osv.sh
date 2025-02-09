#!/bin/bash

export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U osvuser -d osvdb -t -c"
PSQL_MULTILINE="psql -h postgres -U osvuser -d osvdb -t"

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
    package_name=$(jq -r ".affected[0].package.name" "$file")
    ecosystem=$(jq -r ".affected[0].package.ecosystem" "$file")
    version_introduced=$(jq -r ".affected[0].ranges[0].events[-1].introduced" "$file")
    version_fixed=$(jq -r ".affected[0].ranges[0].events[-1].fixed" "$file")
    package_name=${package_name:-"unknown"}
    ecosystem=${ecosystem:-"unknown"}
    version_introduced=${version_introduced:-"unknown"}
    version_fixed=${version_fixed:-"unknown"}
    echo "\"$vuln_name\",\"$package_name\",\"$ecosystem\",\"$version_introduced\",\"$version_fixed\",\"$json_data\"" >> "$1"
' _ "$temp_file"

echo "Populating vulnerabilities..."
$PSQL "CREATE TABLE vulnerabilities_new (name TEXT PRIMARY KEY, ecosystem TEXT, version TEXT, data JSONB);"
$PSQL "\COPY vulnerabilities_new (name, ecosystem, version, data) FROM '$temp_file' WITH (FORMAT csv, DELIMITER ',', QUOTE '\"', ESCAPE '\"');"

$PSQL_MULTILINE <<EOF
BEGIN;
ALTER TABLE vulnerabilities RENAME TO vulnerabilities_old;
ALTER TABLE vulnerabilities_new RENAME TO vulnerabilities;
DROP TABLE vulnerabilities_old;
COMMIT;
EOF

rm -rf osv $temp_file

echo "Database ready."
