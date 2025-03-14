SELECT b.name, b.comment,
    COALESCE((SELECT array_agg(version) FROM blacklist_versions WHERE name = b.name AND version = $2), '{}'::TEXT[]) AS versions,
    COALESCE((SELECT array_agg(ecosystem) FROM blacklist_ecosystems WHERE name = b.name AND ecosystem = $3), '{}'::TEXT[]) AS ecosystems,
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
            'time', bcr.timestamp
        )
        FROM blacklist_created bcr
        JOIN users u ON bcr.id = u.id
        WHERE bcr.name = b.name
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
        LIMIT 1
    ) AS updated,
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', bch.id,
                'name', b.name,
                'event', bch.event,
                'author', jsonb_build_object(
                    'id', u.id,
                    'name', u.name,
                    'avatar', u.avatar
                ),
                'timestamp', bch.timestamp
            )
        )
        FROM blacklist_changelog bch
        JOIN users u ON bch.author = u.id
        WHERE bch.name = b.name
    ), '[]'::jsonb) AS "changeLog"
FROM blacklist b
WHERE b.name = $1 AND EXISTS (
SELECT 1 FROM blacklist_versions WHERE name = b.name AND version = $2
) AND EXISTS (
SELECT 1 FROM blacklist_ecosystems WHERE name = b.name AND ecosystem = $3
);
