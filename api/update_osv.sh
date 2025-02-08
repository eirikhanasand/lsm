#!/bin/bash

export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U osvuser -d osvdb -t -c"

gsutil cp gs://osv-vulnerabilities/all.zip osv.zip

mkdir -p osv
unzip -o osv.zip -d osv > /dev/null
rm osv.zip

export PSQL 

process_file() {
    file="$1"
    vuln_name=$(basename "$file" .json)

    if ! jq empty "$file" > /dev/null 2>&1; then
        echo "Error: Invalid JSON file - $file"
        return
    fi

    json_data=$(jq -c "." "$file" | sed "s/'/''/g")

    $PSQL "INSERT INTO vulnerabilities (name, ecosystem, version, data)
           VALUES ('$vuln_name', 'unknown', 'unknown', '$json_data'::jsonb)
           ON CONFLICT (ecosystem, name, version) DO UPDATE SET data = EXCLUDED.data;"
}

export -f process_file

find osv -name '*.json' | xargs -P 32 -I {} bash -c 'process_file "$@"' _ {}

echo "Cleaning up old vulnerabilities..."
$PSQL "DELETE FROM vulnerabilities WHERE name NOT IN (
    SELECT name FROM vulnerabilities WHERE ecosystem IS NOT NULL
);"

rm -rf osv

echo "Database update complete"
