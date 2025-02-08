#!/bin/bash

export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U osvuser -d osvdb -t -c"

echo "Downloading vulnerabilities archive..."
gsutil cp gs://osv-vulnerabilities/all.zip osv.zip

mkdir -p osv
unzip -o osv.zip -d osv > /dev/null
rm osv.zip

echo "Preparing bulk insert..."
temp_file="vuln_data.csv"
temp_names="vuln_names.txt"
rm -f $temp_file $temp_names

# Processes JSON files in parallel and creates CSV for bulk insert
find osv -name '*.json' | xargs -P 32 -I {} sh -c '
    file="{}"
    vuln_name=$(basename "$file" .json)
    if jq empty "$file" > /dev/null 2>&1; then
        json_data=$(jq -c "." "$file" | sed "s/\"/\"\"/g")
        echo "$vuln_name,unknown,unknown,$json_data" >> vuln_data.csv
        echo "$vuln_name" >> vuln_names.txt
    else
        echo "Skipping invalid JSON: $file"
    fi
'

# Copies csv into db
echo "Inserting data into database..."
$PSQL "\COPY vulnerabilities (name, ecosystem, version, data) FROM '$temp_file' WITH (FORMAT csv, QUOTE '\"', ESCAPE '\"');"

# Populates vulnerability names
$PSQL "\COPY vulnerability_names (name) FROM '$temp_names' WITH (FORMAT csv);"

echo "Cleaning up old vulnerabilities..."
$PSQL "DELETE FROM vulnerabilities WHERE name NOT IN (SELECT name FROM vulnerability_names);"

rm -rf osv $temp_file $temp_names

echo "Database update complete."
