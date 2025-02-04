DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'osvdb') THEN
        CREATE DATABASE osvdb;
    END IF;
END $$;

\c osvdb

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'osvuser') THEN
        CREATE USER osvuser WITH ENCRYPTED PASSWORD 'osvpassword';
        GRANT ALL PRIVILEGES ON DATABASE osvdb TO osvuser;
    END IF;
END $$;


CREATE TABLE IF NOT EXISTS vulnerabilities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    ecosystem TEXT NOT NULL,
    version TEXT NOT NULL,
    data JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_name_version ON vulnerabilities (ecosystem, name, version);
CREATE INDEX IF NOT EXISTS idx_vulnerability_name ON vulnerabilities (name);
