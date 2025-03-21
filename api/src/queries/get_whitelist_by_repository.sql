WITH repo_whitelist AS (
    SELECT 
        w.name, w.comment,
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
    JOIN whitelist_repositories wr ON w.name = wr.name
    WHERE wr.repository = $1
),
global_whitelist AS (
    SELECT 
        w.name, w.comment,
        COALESCE((SELECT array_agg(version) FROM whitelist_versions WHERE name = w.name), '{}'::TEXT[]) AS versions,
        '{}'::TEXT[] AS ecosystems,
        '{}'::TEXT[] AS repositories,
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
    LEFT JOIN whitelist_repositories wr ON w.name = wr.name
    WHERE wr.repository IS NULL OR wr.repository = ''
)
SELECT * FROM repo_whitelist
UNION ALL
SELECT * FROM global_whitelist;
