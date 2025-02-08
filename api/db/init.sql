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

-- Whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist (
    name TEXT PRIMARY KEY
);

-- Blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist (
    name TEXT PRIMARY KEY
);

-- Table for version specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_versions (
    name TEXT NOT NULL,
    version TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name)
);

-- Table for ecosystem specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_ecosystems (
    name TEXT NOT NULL,
    ecosystem TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name)
);

-- Table for repository specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_repositories (
    name TEXT NOT NULL,
    repository TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name)
);

-- Table for version specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_versions (
    name TEXT NOT NULL,
    version TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name)
);

-- Table for ecosystem specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_ecosystems (
    name TEXT NOT NULL,
    ecosystem TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name)
);

-- Table for repository specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_repositories (
    name TEXT NOT NULL,
    repository TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name)
);

-- Creates vulnerability table
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    ecosystem TEXT NOT NULL,
    version TEXT NOT NULL,
    data JSONB NOT NULL,
    CONSTRAINT unique_ecosystem_name_version UNIQUE (ecosystem, name, version)
);

-- Indexes for Vulnerability
CREATE INDEX IF NOT EXISTS idx_ecosystem_name_version ON vulnerabilities (ecosystem, name, version);
CREATE INDEX IF NOT EXISTS idx_vulnerability_name ON vulnerabilities (name);

-- Indexes for Whitelist
CREATE INDEX IF NOT EXISTS idx_whitelist_versions_name ON whitelist_versions (name);
CREATE INDEX IF NOT EXISTS idx_whitelist_ecosystems_name ON whitelist_ecosystems (name);
CREATE INDEX IF NOT EXISTS idx_whitelist_repositories_name ON whitelist_repositories (name);

-- Indexes for Blacklist
CREATE INDEX IF NOT EXISTS idx_blacklist_versions_name ON blacklist_versions (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_ecosystems_name ON blacklist_ecosystems (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_repositories_name ON blacklist_repositories (name);
