SELECT b.name, b.comment,
COALESCE((SELECT array_agg(version) FROM blacklist_versions WHERE name = b.name), '{}'::TEXT[]) AS versions, 
COALESCE((SELECT array_agg(ecosystem) FROM blacklist_ecosystems WHERE name = b.name), '{}'::TEXT[]) AS ecosystems, 
COALESCE((SELECT array_agg(repository) FROM blacklist_repositories WHERE name = b.name), '{}'::TEXT[]) AS repositories,
COALESCE((SELECT array_agg(reference) FROM blacklist_references WHERE name = b.name), '{}'::TEXT[]) AS "references",
(
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'avatar', u.avatar
        )
    )
    FROM blacklist_authors ba
    JOIN users u ON ba.author = u.id
    WHERE ba.name = b.name
) AS authors,
(
    SELECT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'avatar', u.avatar,
        'time', bc.timestamp
    )
    FROM blacklist_created bc
    JOIN users u ON bc.id = u.id
    WHERE bc.name = b.name
    LIMIT 1
) AS created,
(
    SELECT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'avatar', u.avatar,
        'time', bu.timestamp
    )
    FROM blacklist_updated bu
    JOIN users u ON bu.id = u.id
    WHERE bu.name = b.name
    AND ($4::TIMESTAMP IS NULL OR bu.timestamp >= $4)
    AND ($5::TIMESTAMP IS NULL OR bu.timestamp <= $5)
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
    FROM blacklist_changelog cl
    JOIN users u ON cl.author = u.id
    WHERE cl.name = b.name
), '[]'::jsonb) AS "changeLog"
FROM blacklist b
-- name filter
WHERE ($1::TEXT IS NULL OR (SELECT b.name = $1))
-- ecosystem filter
AND ($2::TEXT IS NULL OR (SELECT b.ecosystem = $2))
-- version filter
AND ($3::TEXT IS NULL OR (SELECT b.version = $3))
LIMIT $6 OFFSET ($7 - 1) * $6;
;
