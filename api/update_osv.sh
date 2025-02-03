#!/bin/sh

export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U postgres -d osvdb -t -c"

while true; do
    echo "Downloading OSV vulnerabilities..."
    
    wget -O osv.zip -q "https://www.googleapis.com/download/storage/v1/b/osv-vulnerabilities/o/all.zip?generation=1738262461584480&alt=media"
    
    mkdir -p osv
    unzip -o osv.zip -d osv > /dev/null
    rm osv.zip

    echo "Updating database..."

    existing_vulns=$($PSQL "SELECT name FROM vulnerabilities;")

    for file in osv/*.json; do
        vuln_name=$(basename "$file" .json)

        if ! jq empty "$file" > /dev/null 2>&1; then
            echo "Skipping invalid JSON file: $file"
            continue
        fi

        json_data=$(jq -c '.' "$file")

        if echo "$existing_vulns" | grep -q "$vuln_name"; then
            existing_size=$($PSQL "SELECT length(data::text) FROM vulnerabilities WHERE name = '$vuln_name';" | tr -d ' ')
            new_size=$(echo -n "$json_data" | wc -c)

            if [ "$existing_size" = "$new_size" ]; then
                echo "Skipping unchanged vulnerability: $vuln_name"
                continue
            fi

            echo "Updating vulnerability: $vuln_name"
            $PSQL "UPDATE vulnerabilities SET data = '$json_data'::jsonb WHERE name = '$vuln_name';"
        else
            echo "Inserting new vulnerability: $vuln_name"
            $PSQL "INSERT INTO vulnerabilities (name, ecosystem, version, data) VALUES ('$vuln_name', 'unknown', 'unknown', '$json_data'::jsonb);"
        fi
    done

    echo "Removing outdated vulnerabilities..."
    $PSQL "DELETE FROM vulnerabilities WHERE name NOT IN ($(ls osv/*.json | xargs -n1 basename | sed 's/\.json//g' | awk '{printf "'\''%s'\'',", $1}' | sed 's/,$//'));"

    rm -rf osv

    echo "Database update complete. Sleeping for 1 hour..."
    sleep 3600
done
