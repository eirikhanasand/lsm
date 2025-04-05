SELECT w.name, w.comment,
COALESCE((SELECT array_agg(version) FROM whitelist_versions WHERE name = w.name), '{}'::TEXT[]) AS versions, 
COALESCE((SELECT array_agg(ecosystem) FROM whitelist_ecosystems WHERE name = w.name), '{}'::TEXT[]) AS ecosystems, 
COALESCE((SELECT array_agg(repository) FROM whitelist_repositories WHERE name = w.name), '{}'::TEXT[]) AS repositories,
COALESCE((SELECT array_agg(reference) FROM whitelist_references WHERE name = w.name), '{}'::TEXT[]) AS "references",
(
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'avatar', u.avatar
        )
    )
    FROM whitelist_authors wa
    JOIN users u ON wa.author = u.id
    WHERE wa.name = w.name
) AS authors,
(
    SELECT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'avatar', u.avatar,
        'time', wc.timestamp
    )
    FROM whitelist_created wc
    JOIN users u ON wc.id = u.id
    WHERE wc.name = w.name
    LIMIT 1
) AS created,
(
    SELECT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'avatar', u.avatar,
        'time', wu.timestamp
    )
    FROM whitelist_updated wu
    JOIN users u ON wu.id = u.id
    WHERE wu.name = w.name
    LIMIT 1
) AS updated,
COALESCE((
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', cl.id,
            'name', cl.name,
            'event', cl.event,
            'author', jsonb_build_object(
                'id', u.id,
                'name', u.name,
                'avatar', u.avatar
            ),
            'timestamp', cl.timestamp
        )
    )
    FROM whitelist_changelog cl
    JOIN users u ON cl.author = u.id
    WHERE cl.name = w.name
), '[]'::jsonb) AS "changeLog"
FROM whitelist w
LEFT JOIN (
    SELECT name, array_agg(version) AS versions
    FROM blacklist_versions
    GROUP BY name
) bv ON bv.name = b.name
LEFT JOIN (
    SELECT name, array_agg(ecosystem) AS ecosystems
    FROM blacklist_ecosystems
    GROUP BY name
) be ON be.name = b.name
LEFT JOIN (
    SELECT name, array_agg(repository) AS repositories
    FROM blacklist_repositories
    GROUP BY name
) br ON br.name = b.name
LEFT JOIN (
    SELECT name, array_agg(reference) AS references
    FROM blacklist_references
    GROUP BY name
) brf ON brf.name = b.name
-- name filter
WHERE ($1::TEXT IS NULL OR (SELECT w.name = $1))
-- ecosystem filter
AND ($2::TEXT IS NULL OR (SELECT w.ecosystem = $2))
-- version filter
AND ($3::TEXT IS NULL OR (SELECT w.version = $3))
-- startDate filter
AND ($4::TIMESTAMP IS NULL OR w.timestamp >= $4::TIMESTAMP)
-- endDate filter
AND ($5::TIMESTAMP IS NULL OR w.timestamp <= $5::TIMESTAMP)
LIMIT $6 OFFSET ($7 - 1) * $6;
;
