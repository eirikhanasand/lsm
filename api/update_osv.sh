#!/bin/sh

while true; do
    echo "Downloading OSV vulnerabilities..."
    
    wget -O osv.zip -q "https://www.googleapis.com/download/storage/v1/b/osv-vulnerabilities/o/all.zip?generation=1738262461584480&alt=media"
    
    mkdir -p osv
    unzip -o osv.zip -d osv > /dev/null
    rm osv.zip

    echo "Updating database..."

    PSQL="psql -h postgres -U postgres -d osvdb"

    for file in osv/*.json; do
        vuln_name=$(basename "$file" .json)

        if ! jq empty "$file" > /dev/null 2>&1; then
            echo "Skipping invalid JSON file: $file"
            continue
        fi

        $PSQL <<EOF
        INSERT INTO vulnerabilities (name, ecosystem, version, data)
        VALUES ('$vuln_name', 'unknown', 'unknown', '$(cat "$file")'::jsonb)
        ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data;
EOF

        echo "Processed: $vuln_name"
    done

    echo "Removing outdated vulnerabilities..."
    $PSQL <<EOF
    DELETE FROM vulnerabilities WHERE name NOT IN (SELECT name FROM vulnerabilities);
EOF

    rm -rf osv

    echo "Database update complete. Sleeping for 1 hour..."
    sleep 3600
done
