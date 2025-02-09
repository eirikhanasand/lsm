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
temp_names="vuln_names.txt"
rm -f $temp_file $temp_names

# Processes JSON files in parallel and creates CSV for bulk insert
find osv -name '*.json' -print0 | xargs -P 32 -0 -I {} sh -c '
    file="{}"
    vuln_name="${file##*/}"
    vuln_name="${vuln_name%.json}"
    if json_data=$(jq -c . "$file" | sed '"'"'s/"/""/g'"'"'); then
        echo "\"$vuln_name\",\"unknown\",\"unknown\",\"$json_data\"" >> "$1"
        echo "$vuln_name" >> "$2"
    fi
' _ "$temp_file" "$temp_names"

echo "Populating vulnerabilities..."
$PSQL_MULTILINE <<EOF
BEGIN;
CREATE TABLE IF NOT EXISTS vulnerabilities_new (
    name TEXT PRIMARY KEY,
    ecosystem TEXT,
    version TEXT,
    data JSONB
);
TRUNCATE vulnerabilities_new;
\COPY vulnerabilities_new (name, ecosystem, version, data) FROM '$temp_file' WITH (FORMAT csv, DELIMITER ',', QUOTE '"', ESCAPE '"');
ALTER TABLE vulnerabilities RENAME TO vulnerabilities_old;
ALTER TABLE vulnerabilities_new RENAME TO vulnerabilities;
DROP TABLE vulnerabilities_old;
COMMIT;
EOF


echo "Populating vulnerability names..."
$PSQL_MULTILINE <<EOF
BEGIN;
CREATE TABLE IF NOT EXISTS vulnerability_names_new (name TEXT UNIQUE);
TRUNCATE vulnerability_names_new;
\COPY vulnerability_names_new (name) FROM '$temp_names' WITH (FORMAT csv);
ALTER TABLE vulnerability_names RENAME TO vulnerability_names_old;
ALTER TABLE vulnerability_names_new RENAME TO vulnerability_names;
DROP TABLE vulnerability_names_old;
COMMIT;
EOF

echo "Cleaning up old vulnerabilities..."
$PSQL "DELETE FROM vulnerabilities WHERE name NOT IN (SELECT name FROM vulnerability_names);"

rm -rf osv $temp_file $temp_names

echo "Database update complete."
