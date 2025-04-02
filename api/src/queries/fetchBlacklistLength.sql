SELECT COUNT(*) 
FROM blacklist b
WHERE ($1 IS NULL OR b.name = $1)
AND (
    $2 IS NULL 
    OR EXISTS (
        SELECT 1 FROM blacklist_versions WHERE name = b.name AND version = $2
    )
)
AND (
    $3 IS NULL 
    OR EXISTS (
        SELECT 1 FROM blacklist_ecosystems WHERE name = b.name AND ecosystem = $3
    )
);
