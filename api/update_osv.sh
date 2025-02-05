#!/bin/sh

export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U osvuser -d osvdb -t -c"

while true; do
    echo "Downloading OSV vulnerabilities..."
    
    gsutil cp gs://osv-vulnerabilities/all.zip osv.zip
    
    mkdir -p osv
    unzip -o osv.zip -d osv > /dev/null
    rm osv.zip

    echo "Updating database with a maximum of 10 JSON files..."

    counter=0
    for file in osv/*.json; do
        if [ "$counter" -ge 10 ]; then
            break
        fi

        vuln_name=$(basename "$file" .json)

        if ! jq empty "$file" > /dev/null 2>&1; then
            echo "Skipping invalid JSON file: $file"
            continue
        fi

        json_data=$(jq -c '.' "$file" | sed "s/'/''/g")

        echo "Executing SQL for $vuln_name"

        $PSQL "INSERT INTO vulnerabilities (name, ecosystem, version, data) 
               VALUES ('$vuln_name', 'unknown', 'unknown', '$json_data'::jsonb) 
               ON CONFLICT (ecosystem, name, version) DO UPDATE SET data = EXCLUDED.data;"

        counter=$((counter+1))
    done

    echo "Removing outdated vulnerabilities..."
    
   $PSQL "DELETE FROM vulnerabilities WHERE name NOT IN (
    SELECT name FROM vulnerabilities WHERE ecosystem IS NOT NULL
    );"

    rm -rf osv

    echo "Database update complete with 10 JSON files. Sleeping for 1 hour..."
    sleep 3600
done
