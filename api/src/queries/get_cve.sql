SELECT
    CVE,
    severity,
    public_date,
    advisories,
    bugzilla,
    bugzilla_description,
    cvss_score,
    cvss_scoring_vector,
    CWE,
    affected_packages,
    package_state,
    resource_url,
    cvss3_scoring_vector,
    cvss3_score
FROM CVEs
WHERE CVE = $1;
