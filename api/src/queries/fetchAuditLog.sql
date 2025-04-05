SELECT id, event, author, timestamp
FROM audit_log a
-- author filter
WHERE ($1::TEXT IS NULL OR a.author = $1::TEXT)
-- startDate filter
AND ($2::TIMESTAMP IS NULL OR a.timestamp >= $2::TIMESTAMP)
-- endDate filter
AND ($3::TIMESTAMP IS NULL OR a.timestamp <= $3::TIMESTAMP)
-- name filter
AND ($4::TEXT IS NULL OR (
    SELECT regexp_matches(a.event, '^(Added|Updated) (\S+)', 'i'))[1] = $4::TEXT
)
-- ecosystem filter
AND ($5::TEXT IS NULL OR (
    SELECT regexp_matches(a.event, '^(ecosystems) (\S+)', 'i'))[1] = $5::TEXT
)
-- version filter
AND ($6::TEXT IS NULL OR (
    SELECT regexp_matches(a.event, '^(versions) (\S+)', 'i'))[1] = $6::TEXT
)
-- list filter
AND ($7::TEXT IS NULL OR (
    SELECT regexp_matches(a.event, '^(blacklist|whitelist) (for) (\S+)', 'i'))[1] = $7::TEXT
)
LIMIT $8 OFFSET ($9 - 1) * $8;
