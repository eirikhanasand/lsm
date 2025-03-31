#!/bin/bash

# === Configuration ===
export PGPASSWORD=$DB_PASSWORD
DB_HOST="${DB_HOST:-postgres}"
DB_USER="${DB_USER:-osvuser}"
DB_NAME="${DB_NAME:-osvdb}"

NVD_API_BASE_URL="https://services.nvd.nist.gov/rest/json/cves/2.0"
RESULTS_PER_PAGE=2000
export NVD_API_KEY="${NVD_API_KEY:-}"

SLEEP_DURATION=$([ -n "$NVD_API_KEY" ] && echo "1" || echo "6")

PAGE_OUTPUT_FILE="nvd_cve_page_data.json.$$"

export USE_JSONB_CASTING=true

PSQL="psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c"
echo "INFO: Using PSQL command: psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c"
echo "INFO: Connecting to database $DB_NAME@$DB_HOST as $DB_USER"

# === Main Loop ===
total_results=0
total_processed=0 # More accurate count now
start_index=0
page_num=0
overall_start_time=$(date +%s)
error_count=0 # Track errors

echo "INFO: Starting NVD CVE fetch and processing (serially)..."

while true; do
    page_num=$((page_num + 1))
    api_url="${NVD_API_BASE_URL}?resultsPerPage=${RESULTS_PER_PAGE}&startIndex=${start_index}"
    wget_headers=""
    if [ -n "$NVD_API_KEY" ]; then wget_headers="--header=apiKey:${NVD_API_KEY}"; fi
    if [ -z "$NVD_API_KEY" ] && [ "$start_index" -eq 0 ]; then echo "WARN: Consider setting NVD_API_KEY"; fi
    if [ "$start_index" -ne 0 ]; then
        echo "INFO: Sleeping for ${SLEEP_DURATION}s before next API call..."
        sleep "$SLEEP_DURATION"
    fi

    echo "INFO: Fetching page $page_num: startIndex=${start_index}..."
    wget --timeout=60 --tries=3 -q $wget_headers -O "$PAGE_OUTPUT_FILE" "$api_url"
    wget_exit_code=$?
    if [ $wget_exit_code -ne 0 ] || [ ! -s "$PAGE_OUTPUT_FILE" ]; then echo "ERROR: wget failed page $page_num"; rm -f "$PAGE_OUTPUT_FILE"; exit 1; fi

    if [ "$start_index" -eq 0 ]; then
        if ! jq -e '.format == "NVD_CVE"' "$PAGE_OUTPUT_FILE" > /dev/null 2>&1; then echo "ERROR: Initial response invalid"; rm "$PAGE_OUTPUT_FILE"; exit 1; fi
        total_results=$(jq -r '.totalResults // 0' "$PAGE_OUTPUT_FILE")
        if ! [[ "$total_results" =~ ^[0-9]+$ ]]; then echo "ERROR: Bad totalResults ($total_results)"; rm "$PAGE_OUTPUT_FILE"; exit 1; fi
        echo "INFO: Total CVEs reported by NVD: $total_results"
        if [ "$total_results" -eq 0 ]; then echo "INFO: No CVEs found."; rm "$PAGE_OUTPUT_FILE"; exit 0; fi
    fi

    vulnerabilities_count=$(jq '.vulnerabilities | length // 0' "$PAGE_OUTPUT_FILE")
    if ! [[ "$vulnerabilities_count" =~ ^[0-9]+$ ]]; then echo "WARN: Invalid vuln count page $page_num"; vulnerabilities_count=0; fi

    if [ "$vulnerabilities_count" -gt 0 ]; then
        page_start_time=$(date +%s)
        echo "INFO: Processing $vulnerabilities_count CVEs from page $page_num sequentially..."

        processed_in_page=0
        # Note: Removed 'local' from variable assignments below
        jq -c '.vulnerabilities[]?.cve // ""' "$PAGE_OUTPUT_FILE" | while IFS= read -r cve_json_line || [[ -n "$cve_json_line" ]]; do
            if ! [[ "$cve_json_line" =~ ^\{.*\}$ ]]; then
                printf "WARN: Skipping invalid line (does not look like JSON object): %s\n" "$(echo "$cve_json_line" | cut -c 1-100)..." >&2
                error_count=$((error_count + 1))
                continue
            fi

            cve=$(echo "$cve_json_line" | jq -er '.id // "unknown"')
            if [ $? -ne 0 ] || [ "$cve" == "unknown" ] || [ -z "$cve" ]; then
                printf "WARN: Failed to extract valid CVE ID from line: %s\n" "$(echo "$cve_json_line" | cut -c 1-100)..." >&2
                error_count=$((error_count + 1))
                continue
            fi

            public_date=$(echo "$cve_json_line" | jq -er '.published // ""')
            resource_url="https://nvd.nist.gov/vuln/detail/${cve}"
            advisories=$(echo "$cve_json_line" | jq -ec '.references // []')
            affected_packages=$(echo "$cve_json_line" | jq -ec '.configurations // []')
            cwe=$(echo "$cve_json_line" | jq -er '(.weaknesses[0].description[]? | select(.lang=="en").value) // "unknown"')

            severity="unknown"; cvss3_score_raw="null"; cvss_score_raw="null"
            cvss3_scoring_vector="unknown"; cvss_scoring_vector="unknown"

            if echo "$cve_json_line" | jq -e '.metrics.cvssMetricV31[0]' > /dev/null; then
                severity=$(echo "$cve_json_line" | jq -er '.metrics.cvssMetricV31[0].cvssData.baseSeverity // "unknown"')
                cvss3_score_raw=$(echo "$cve_json_line" | jq -er '.metrics.cvssMetricV31[0].cvssData.baseScore // "null"')
                cvss3_scoring_vector=$(echo "$cve_json_line" | jq -er '.metrics.cvssMetricV31[0].cvssData.vectorString // "unknown"')
            elif echo "$cve_json_line" | jq -e '.metrics.cvssMetricV30[0]' > /dev/null; then
                severity=$(echo "$cve_json_line" | jq -er '.metrics.cvssMetricV30[0].cvssData.baseSeverity // "unknown"')
                cvss3_score_raw=$(echo "$cve_json_line" | jq -er '.metrics.cvssMetricV30[0].cvssData.baseScore // "null"')
                cvss3_scoring_vector=$(echo "$cve_json_line" | jq -er '.metrics.cvssMetricV30[0].cvssData.vectorString // "unknown"')
            fi

             if echo "$cve_json_line" | jq -e '.metrics.cvssMetricV2[0]' > /dev/null; then
                 if [ "$severity" == "unknown" ]; then severity=$(echo "$cve_json_line" | jq -er '.metrics.cvssMetricV2[0].baseSeverity // "unknown"'); fi
                 cvss_score_raw=$(echo "$cve_json_line" | jq -er '.metrics.cvssMetricV2[0].cvssData.baseScore // "null"')
                 cvss_scoring_vector=$(echo "$cve_json_line" | jq -er '.metrics.cvssMetricV2[0].vectorString // "unknown"')
            fi

            cvss3_score_sql="null"; cvss_score_sql="null"
            if [[ "$cvss3_score_raw" != "null" ]] && printf "%.1f" "$cvss3_score_raw" > /dev/null 2>&1; then cvss3_score_sql=$(printf "%.1f" "$cvss3_score_raw"); fi
            if [[ "$cvss_score_raw" != "null" ]] && printf "%.1f" "$cvss_score_raw" > /dev/null 2>&1; then cvss_score_sql=$(printf "%.1f" "$cvss_score_raw"); fi

             bugzilla="unknown"; bugzilla_description=""
             package_state='[]'

            cve_sql=$(echo "$cve" | sed "s/'/''/g")
            severity_sql=$(echo "$severity" | sed "s/'/''/g")
            public_date_sql=$(echo "$public_date" | sed "s/'/''/g")
            resource_url_sql=$(echo "$resource_url" | sed "s/'/''/g")
            cwe_sql=$(echo "$cwe" | sed "s/'/''/g")
            cvss_scoring_vector_sql=$(echo "$cvss_scoring_vector" | sed "s/'/''/g")
            cvss3_scoring_vector_sql=$(echo "$cvss3_scoring_vector" | sed "s/'/''/g")

            advisories_insert="'${advisories:-[]}'::jsonb"
            affected_packages_insert="'${affected_packages:-[]}'::jsonb"
            package_state_insert="'${package_state:-[]}'::jsonb"

            sql=$(cat <<-EOF
INSERT INTO CVEs (
    CVE, severity, public_date, advisories, bugzilla, bugzilla_description,
    cvss_score, cvss_scoring_vector, CWE, affected_packages, package_state,
    resource_url, cvss3_scoring_vector, cvss3_score
) VALUES (
    '$cve_sql', '$severity_sql', '$public_date_sql', $advisories_insert, '$bugzilla', '$bugzilla_description',
    $cvss_score_sql, '$cvss_scoring_vector_sql', '$cwe_sql', $affected_packages_insert, $package_state_insert,
    '$resource_url_sql', '$cvss3_scoring_vector_sql', $cvss3_score_sql
)
ON CONFLICT (CVE) DO UPDATE SET
    severity = EXCLUDED.severity, public_date = EXCLUDED.public_date, advisories = EXCLUDED.advisories,
    cvss_score = EXCLUDED.cvss_score, cvss_scoring_vector = EXCLUDED.cvss_scoring_vector, CWE = EXCLUDED.CWE,
    affected_packages = EXCLUDED.affected_packages, resource_url = EXCLUDED.resource_url,
    cvss3_scoring_vector = EXCLUDED.cvss3_scoring_vector, cvss3_score = EXCLUDED.cvss3_score;
EOF
)
            $PSQL "$sql" > /dev/null 2>&1
            db_exit_code=$?

            if [ $db_exit_code -ne 0 ]; then
                 printf "WARN: Failed insert/update: CVE=%s DB_Exit_Code=%d SQL_Start=%s\n" \
                        "$cve" "$db_exit_code" "$(echo "$sql" | head -n 5)..." >&2
                 error_count=$((error_count + 1))
            fi
            processed_in_page=$((processed_in_page + 1))
            total_processed=$((total_processed + 1))

        done # End while read loop

        page_end_time=$(date +%s)
        page_duration=$((page_end_time - page_start_time))

        current_time=$(date +%s)
        elapsed_time=$((current_time - overall_start_time))
        rate=$(awk -v proc="$total_processed" -v time="$elapsed_time" 'BEGIN { if (time > 0) printf "%.2f", proc/time; else print "inf"; }')
        echo "INFO: Finished page $page_num in ${page_duration}s. Total processed: $total_processed / $total_results (~${rate} CVEs/sec)"
    else
         echo "INFO: No vulnerabilities found in page $page_num (startIndex: $start_index)."
    fi

    start_index=$((start_index + RESULTS_PER_PAGE))
    if [ "$start_index" -ge "$total_results" ]; then echo "INFO: Reached end of NVD results."; break; fi
    if [ "$vulnerabilities_count" -eq 0 ] && [ "$start_index" -lt "$total_results" ]; then echo "WARN: Empty page before end. Stopping."; break; fi
done

overall_end_time=$(date +%s)
total_duration=$((overall_end_time - overall_start_time))
echo "INFO: Cleaning up temporary file: $PAGE_OUTPUT_FILE"
rm -f "$PAGE_OUTPUT_FILE"
echo "[✓] CVE data import complete. Processed $total_processed CVEs ($error_count errors) in ${total_duration} seconds."

exit 0