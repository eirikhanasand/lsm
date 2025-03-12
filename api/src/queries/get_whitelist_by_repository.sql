WITH repo_whitelist AS (
    SELECT 
        w.name,
        COALESCE((SELECT array_agg(version) FROM whitelist_versions WHERE name = w.name), '{}'::TEXT[]) AS versions,
        COALESCE((SELECT array_agg(ecosystem) FROM whitelist_ecosystems WHERE name = w.name), '{}'::TEXT[]) AS ecosystems,
        COALESCE((SELECT array_agg(repository) FROM whitelist_repositories WHERE name = w.name), '{}'::TEXT[]) AS repositories,
        COALESCE((SELECT array_agg(comment) FROM whitelist_comments WHERE name = w.name), '{}'::TEXT[]) AS comments,
        COALESCE((SELECT array_agg(author) FROM whitelist_authors WHERE name = w.name), '{}'::TEXT[]) AS authors,
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
        w.name,
        COALESCE((SELECT array_agg(version) FROM whitelist_versions WHERE name = w.name), '{}'::TEXT[]) AS versions,
        '{}'::TEXT[] AS ecosystems,
        '{}'::TEXT[] AS repositories,
        COALESCE((SELECT array_agg(comment) FROM whitelist_comments WHERE name = w.name), '{}'::TEXT[]) AS comments,
        COALESCE((SELECT array_agg(author) FROM whitelist_authors WHERE name = w.name), '{}'::TEXT[]) AS authors,
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
