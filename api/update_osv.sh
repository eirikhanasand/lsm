#!/bin/sh

export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U osvuser -d osvdb -t -c"

while true; do
    echo "Downloading OSV vulnerabilities..."
    
    wget -O osv.zip -q "https://www.googleapis.com/download/storage/v1/b/osv-vulnerabilities/o/all.zip?generation=1738262461584480&alt=media"
    
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

        $PSQL <<EOF
        INSERT INTO vulnerabilities (name, ecosystem, version, data)
        VALUES ('$vuln_name', 'unknown', 'unknown', '$json_data'::jsonb)
        ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data;
EOF

        echo "Processed: $vuln_name"
        counter=$((counter+1))
    done

    echo "Removing outdated vulnerabilities..."
    $PSQL "DELETE FROM vulnerabilities WHERE name NOT IN (SELECT name FROM (SELECT name FROM vulnerabilities EXCEPT SELECT name FROM (SELECT basename(name, '.json') AS name FROM pg_ls_dir('osv')) AS temp) AS outdated);"

    rm -rf osv

    echo "Database update complete with 10 JSON files. Sleeping for 1 hour..."
    sleep 3600
done
