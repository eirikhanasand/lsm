SELECT COUNT(*) 
FROM whitelist w
WHERE ($1 IS NULL OR w.name = $1)
AND (
    $2 IS NULL 
    OR EXISTS (
        SELECT 1 FROM whitelist_versions WHERE name = w.name AND version = $2
    )
)
AND (
    $3 IS NULL 
    OR EXISTS (
        SELECT 1 FROM whitelist_ecosystems WHERE name = w.name AND ecosystem = $3
    )
);
