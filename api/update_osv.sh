#!/bin/bash

echo "Updating database..."
export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U osvuser -d osvdb -t -c"
PSQL_MULTILINE="psql -h postgres -U osvuser -d osvdb -t"
HEALTH_FILE="/tmp/health_status"
echo "starting" > $HEALTH_FILE

start_time=$(($(date +%s%N)))

gsutil cp gs://osv-vulnerabilities/all.zip osv.zip
mkdir -p osv

download_time=$(date +%s%N)
download_s=$(( (download_time - start_time) / 1000000000 ))
echo "Downloaded osv.zip in ${download_s}s."

echo "Unzipping vulnerabilities archive..."
unzip -o osv.zip -d osv > /dev/null
rm osv.zip
unzip_time=$(date +%s%N)
unzip_s=$(( (unzip_time - download_time) / 1000000000 ))
echo "Unzip complete in ${unzip_s}s."

echo "Preparing bulk insert using $(nproc) cores..."
csv="vuln_data.csv"
rm -f $csv
temp_dir=$(mktemp -d)

# Processes files
find osv -name '*.json' -print0 | xargs -P 32 -0 -I {} sh -c '
    file="{}"
    vuln_name="${file##*/}"
    vuln_name="${vuln_name%.json}"
    jq -r "[ \"$vuln_name\",
        (.affected[0].package.name // \"unknown\" | ascii_downcase),
        (.affected[0].package.ecosystem // \"unknown\" | ascii_downcase),
        (.affected[0].ranges[0].events[0].introduced // \"unknown\"),
        (.affected[0].ranges[0].events[1].fixed // \"unknown\"),
        (. | @json)
    ] | @csv" "$file" > "$1/${vuln_name}.csv"
' _ "$temp_dir"
find "$temp_dir" -name '*.csv' -exec cat {} + >> "$csv"
rm -rf "$temp_dir"

processing_time=$(date +%s%N)
processing_s=$(( (processing_time - unzip_time) / 1000000000 ))
echo "Processing json to csv complete in ${processing_s}s."
echo "Populating vulnerabilities..."

$PSQL "SET work_mem = '1GB';"
$PSQL "ALTER TABLE IF EXISTS vulnerabilities DROP CONSTRAINT IF EXISTS unique_name_ecosystem_version;"
$PSQL "DROP TABLE IF EXISTS vulnerabilities_new CASCADE;"
$PSQL "
CREATE UNLOGGED TABLE vulnerabilities_new (
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
$PSQL "ALTER TABLE vulnerabilities_new DISABLE TRIGGER ALL;"
$PSQL "\COPY vulnerabilities_new (name, package_name, ecosystem, version_introduced, version_fixed, data)
FROM '$csv'
WITH (FORMAT csv, DELIMITER ',', QUOTE '\"', ESCAPE '\"');
"
$PSQL "ALTER TABLE vulnerabilities_new ENABLE TRIGGER ALL;"
$PSQL "SET work_mem = '4MB';"
$PSQL_MULTILINE <<EOF
BEGIN;
    ALTER TABLE IF EXISTS vulnerabilities RENAME TO vulnerabilities_old;
    ALTER TABLE vulnerabilities_new RENAME TO vulnerabilities;
    DROP TABLE IF EXISTS vulnerabilities_old;
COMMIT;
EOF

insert_time=$(date +%s%N)
insert_s=$(( (insert_time - processing_time) / 1000000000 ))
echo "Insert complete in ${insert_s}s."

end_time=$(date +%s%N)
duration_s=$(( (end_time - start_time) / 1000000000 ))
echo "healthy" > $HEALTH_FILE
echo "Database ready in ${duration_s}s."
