SELECT w.name, w.comment,
    COALESCE((SELECT array_agg(version) FROM whitelist_versions WHERE name = w.name AND version = $2), '{}'::TEXT[]) AS versions,
    COALESCE((SELECT array_agg(ecosystem) FROM whitelist_ecosystems WHERE name = w.name AND ecosystem = $3), '{}'::TEXT[]) AS ecosystems,
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
            'time', wcr.timestamp
        )
        FROM whitelist_created wcr
        JOIN users u ON wcr.id = u.id
        WHERE wcr.name = w.name
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
                'id', wch.id,
                'name', w.name,
                'event', wch.event,
                'author', jsonb_build_object(
                    'id', u.id,
                    'name', u.name,
                    'avatar', u.avatar
                ),
                'timestamp', wch.timestamp
            )
        )
        FROM whitelist_changelog wch
        JOIN users u ON wch.author = u.id
        WHERE wch.name = w.name
    ), '[]'::jsonb) AS "changeLog"
FROM whitelist w
WHERE w.name = $1 AND EXISTS (
SELECT 1 FROM whitelist_versions WHERE name = w.name AND version = $2
) AND EXISTS (
SELECT 1 FROM whitelist_ecosystems WHERE name = w.name AND ecosystem = $3
);
