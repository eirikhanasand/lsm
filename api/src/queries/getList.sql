SELECT l.name, l.comment,
COALESCE((SELECT array_agg(version) FROM {list}list_versions WHERE name = l.name), '{}'::TEXT[]) AS versions, 
COALESCE((SELECT array_agg(ecosystem) FROM {list}list_ecosystems WHERE name = l.name), '{}'::TEXT[]) AS ecosystems, 
COALESCE((SELECT array_agg(repository) FROM {list}list_repositories WHERE name = l.name), '{}'::TEXT[]) AS repositories,
COALESCE((SELECT array_agg(reference) FROM {list}list_references WHERE name = l.name), '{}'::TEXT[]) AS "references",
(
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'avatar', u.avatar
        )
    )
    FROM {list}list_authors la
    JOIN users u ON la.author = u.id
    WHERE la.name = l.name
) AS authors,
(
    SELECT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'avatar', u.avatar,
        'time', lc.timestamp
    )
    FROM {list}list_created lc
    JOIN users u ON lc.id = u.id
    WHERE lc.name = l.name
    LIMIT 1
) AS created,
(
    SELECT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'avatar', u.avatar,
        'time', lu.timestamp
    )
    FROM {list}list_updated lu
    JOIN users u ON lu.id = u.id
    WHERE lu.name = l.name
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
    FROM {list}list_changelog cl
    JOIN users u ON cl.author = u.id
    WHERE cl.name = l.name
), '[]'::jsonb) AS "changeLog"
FROM {list}list l
LEFT JOIN (
    SELECT name, array_agg(version) AS versions
    FROM {list}list_versions
    GROUP BY name
) lv ON lv.name = l.name
LEFT JOIN (
    SELECT name, array_agg(ecosystem) AS ecosystems
    FROM {list}list_ecosystems
    GROUP BY name
) le ON le.name = l.name
LEFT JOIN (
    SELECT name, array_agg(repository) AS repositories
    FROM {list}list_repositories
    GROUP BY name
) lr ON lr.name = l.name
LEFT JOIN (
    SELECT name, array_agg(reference) AS references
    FROM {list}list_references
    GROUP BY name
) lrf ON lrf.name = l.name
-- name filter
WHERE ($1::TEXT IS NULL OR (SELECT l.name = $1))
-- ecosystem filter
AND ($2::TEXT IS NULL OR (SELECT $2 = ANY(le.ecosystems)))
-- version filter
AND ($3::TEXT IS NULL OR (SELECT $3 = ANY(lv.versions)))
-- repository filter (checks for unique word since the repository is often 
-- '[REMOTE] npm', but could also be '[LOCAL] npm-other'), which should not be
-- included since 'npm-other' !== 'npm' and 'other-npm' !== 'npm'
AND (
    $4::TEXT IS NULL OR EXISTS (
        SELECT 1 FROM unnest(lr.repositories) AS repo
        WHERE repo ~* ('\y' || $4 || '\y')
    )
)
-- startDate filter
AND ($5::TIMESTAMP IS NULL OR (
    SELECT lc.timestamp
    FROM {list}list_created lc
    WHERE lc.name = l.name
    LIMIT 1
) >= $5::TIMESTAMP)
-- endDate filter
AND ($6::TIMESTAMP IS NULL OR (
    SELECT lc.timestamp
    FROM {list}list_created lc
    WHERE lc.name = l.name
    LIMIT 1
) <= $6::TIMESTAMP)
LIMIT $8::INT OFFSET ($7::INT * $8::INT) - $8::INT;
;
