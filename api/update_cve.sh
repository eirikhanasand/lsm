#!/bin/bash

# Database credentials
export PGPASSWORD="osvpassword"
PSQL="psql -h postgres -U osvuser -d osvdb -t -c"

# API endpoint
REDHAT_API="https://access.redhat.com/hydra/rest/securitydata/cve.json"

# Output file
OUTPUT_FILE="cve_data.json"

# Fetch CVE data
echo "Fetching CVE data from Red Hat API..."
wget -q -O "$OUTPUT_FILE" "$REDHAT_API"

if [ ! -s "$OUTPUT_FILE" ]; then
    echo "Failed to fetch data or empty response. Exiting."
    exit 1
fi

echo "CVE data fetched successfully."

# Create new table CVEs if not exists
$PSQL "CREATE TABLE IF NOT EXISTS CVEs (
    id SERIAL PRIMARY KEY,
    CVE TEXT UNIQUE,
    severity TEXT,
    public_date TIMESTAMP,
    advisories JSONB,
    bugzilla TEXT,
    bugzilla_description TEXT,
    cvss_score NUMERIC,
    cvss_scoring_vector TEXT,
    CWE TEXT,
    affected_packages JSONB,
    package_state JSONB,
    resource_url TEXT,
    cvss3_scoring_vector TEXT,
    cvss3_score NUMERIC
);"

echo "Inserting CVEs into the database..."

jq -c '.[]' "$OUTPUT_FILE" | while read -r line; do
    cve=$(echo "$line" | jq -r '.CVE // "unknown"')
    severity=$(echo "$line" | jq -r '.severity // "unknown"')
    public_date=$(echo "$line" | jq -r '.public_date // "unknown"')
    advisories=$(echo "$line" | jq -c '.advisories')
    bugzilla=$(echo "$line" | jq -r '.bugzilla // "unknown"')

    # Escape single quotes in bugzilla_description to prevent SQL syntax errors
    bugzilla_description=$(echo "$line" | jq -r '.bugzilla_description // "unknown"' | sed "s/'/''/g")

    cvss_score=$(echo "$line" | jq -r '.cvss_score // "null"')
    cvss_scoring_vector=$(echo "$line" | jq -r '.cvss_scoring_vector // "unknown"')
    cwe=$(echo "$line" | jq -r '.CWE // "unknown"')
    affected_packages=$(echo "$line" | jq -c '.affected_packages')
    package_state=$(echo "$line" | jq -c '.package_state')
    resource_url=$(echo "$line" | jq -r '.resource_url // "unknown"')
    cvss3_scoring_vector=$(echo "$line" | jq -r '.cvss3_scoring_vector // "unknown"')
    cvss3_score=$(echo "$line" | jq -r '.cvss3_score // "null"')

    $PSQL "INSERT INTO CVEs (CVE, severity, public_date, advisories, bugzilla, bugzilla_description, cvss_score, cvss_scoring_vector, CWE, affected_packages, package_state, resource_url, cvss3_scoring_vector, cvss3_score)
        VALUES ('$cve', '$severity', '$public_date', '$advisories', '$bugzilla', '$bugzilla_description', $cvss_score, '$cvss_scoring_vector', '$cwe', '$affected_packages', '$package_state', '$resource_url', '$cvss3_scoring_vector', $cvss3_score)
        ON CONFLICT (CVE) DO UPDATE SET severity = EXCLUDED.severity, public_date = EXCLUDED.public_date, advisories = EXCLUDED.advisories, bugzilla = EXCLUDED.bugzilla, bugzilla_description = EXCLUDED.bugzilla_description, cvss_score = EXCLUDED.cvss_score, cvss_scoring_vector = EXCLUDED.cvss_scoring_vector, CWE = EXCLUDED.CWE, affected_packages = EXCLUDED.affected_packages, package_state = EXCLUDED.package_state, resource_url = EXCLUDED.resource_url, cvss3_scoring_vector = EXCLUDED.cvss3_scoring_vector, cvss3_score = EXCLUDED.cvss3_score;"
done

echo "CVE insertion complete."

rm "$OUTPUT_FILE"
echo "Temporary files cleaned up."
