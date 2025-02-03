ALTER USER postgres WITH ENCRYPTED PASSWORD 'osvpassword';


CREATE TABLE IF NOT EXISTS vulnerabilities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    ecosystem TEXT NOT NULL,
    version TEXT NOT NULL,
    data JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_name_version ON vulnerabilities (ecosystem, name, version);
CREATE INDEX IF NOT EXISTS idx_vulnerability_name ON vulnerabilities (name);
