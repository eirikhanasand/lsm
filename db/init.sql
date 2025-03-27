DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'osvdb') THEN
        CREATE DATABASE osvdb;
    END IF;
END $$;

\c osvdb

DO $$
DECLARE
    user_password text;
BEGIN
    user_password := current_setting('db_password', true);

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'osvuser') THEN
        EXECUTE format('CREATE USER osvuser WITH ENCRYPTED PASSWORD %L', user_password);
        EXECUTE 'GRANT ALL PRIVILEGES ON DATABASE osvdb TO osvuser';
    END IF;
END $$;

-- Whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist (
    name TEXT PRIMARY KEY,
    comment TEXT NOT NULL
);

-- Blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist (
    name TEXT PRIMARY KEY,
    comment TEXT NOT NULL
);

-- Version specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_versions (
    name TEXT NOT NULL,
    version TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, version)
);

-- Ecosystem specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_ecosystems (
    name TEXT NOT NULL,
    ecosystem TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, ecosystem)
);

-- Repository specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_repositories (
    name TEXT NOT NULL,
    repository TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, repository)
);

-- References for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_references (
    name TEXT NOT NULL,
    reference TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, reference)
);

-- Authors for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_authors (
    name TEXT NOT NULL,
    author TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, author)
);

-- Created info for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_created (
    name TEXT NOT NULL,
    id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, id, timestamp)
);

-- Updated info for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_updated (
    name TEXT NOT NULL,
    id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, id, timestamp)
);

-- Changelog for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_changelog (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES whitelist(name)
);

-- Version specific blacklisted versions
CREATE TABLE IF NOT EXISTS blacklist_versions (
    name TEXT NOT NULL,
    version TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, version)
);

-- Ecosystem specific blacklisted ecosystems
CREATE TABLE IF NOT EXISTS blacklist_ecosystems (
    name TEXT NOT NULL,
    ecosystem TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, ecosystem)
);

-- Repository specific blacklisted repositories
CREATE TABLE IF NOT EXISTS blacklist_repositories (
    name TEXT NOT NULL,
    repository TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, repository)
);

-- References for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_references (
    name TEXT NOT NULL,
    reference TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, reference)
);

-- Authors for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_authors (
    name TEXT NOT NULL,
    author TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, author)
);

-- Created info for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_created (
    name TEXT NOT NULL,
    id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, id, timestamp)
);

-- Updated info for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_updated (
    name TEXT NOT NULL,
    id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, id, timestamp)
);

-- Changelog for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_changelog (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES blacklist(name)
);

-- Vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
    name TEXT PRIMARY KEY,
    package_name TEXT NOT NULL,
    ecosystem TEXT NOT NULL,
    version_introduced TEXT NOT NULL,
    version_fixed TEXT NOT NULL,
    data JSONB NOT NULL,
    CONSTRAINT unique_name_ecosystem_version UNIQUE (name, package_name, ecosystem, version_introduced, version_fixed)
);

-- Download events table
CREATE TABLE IF NOT EXISTS download_events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    package_name VARCHAR(255) NOT NULL CHECK (LENGTH(package_name) > 0),
    package_version VARCHAR(50) NOT NULL CHECK (LENGTH(package_version) > 0),
    ecosystem VARCHAR(100) NOT NULL CHECK (LENGTH(ecosystem) > 0),
    client_address INET NOT NULL,
    status INTEGER NOT NULL CHECK (status IN (1, 2)),
    reason TEXT CHECK (LENGTH(reason) > 0),
    severity FLOAT(1) DEFAULT -1,
    CONSTRAINT unique_event UNIQUE (timestamp, package_name, package_version, client_address)
);

CREATE TABLE IF NOT EXISTS CVEs (
    id SERIAL PRIMARY KEY,
    CVE TEXT UNIQUE,
    severity TEXT,
    public_date TIMESTAMP,
    advisories JSONB,
    bugzilla TEXT,
    bugzilla_description TEXT,
    cvss_score NUMERIC,
    cvss_scoring_vector TEXT,
    CWE TEXT,
    affected_packages JSONB,
    package_state JSONB,
    resource_url TEXT,
    cvss3_scoring_vector TEXT,
    cvss3_score NUMERIC
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    event TEXT NOT NULL,
    author TEXT NOT NULL
);

-- User table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL
);

-- Indexes for downloaded packages
CREATE INDEX idx_download_timestamp ON download_events (timestamp);
CREATE INDEX idx_download_package_name ON download_events (package_name);
CREATE INDEX idx_download_ecosystem ON download_events (ecosystem);
CREATE INDEX idx_download_version ON download_events (package_version);

-- Indexes for Vulnerability
CREATE INDEX IF NOT EXISTS idx_name_ecosystem_version ON vulnerabilities (name, package_name, ecosystem, version_introduced, version_fixed);
CREATE INDEX IF NOT EXISTS idx_package_name ON vulnerabilities (name, package_name);
CREATE INDEX IF NOT EXISTS idx_vuln_name ON vulnerabilities (name);

-- Indexes for Whitelist
CREATE INDEX IF NOT EXISTS idx_whitelist_versions_name ON whitelist_versions (name);
CREATE INDEX IF NOT EXISTS idx_whitelist_ecosystems_name ON whitelist_ecosystems (name);
CREATE INDEX IF NOT EXISTS idx_whitelist_repositories_name ON whitelist_repositories (name);
CREATE INDEX IF NOT EXISTS idx_whitelist_authors_name ON whitelist_authors (name);

-- Indexes for Blacklist
CREATE INDEX IF NOT EXISTS idx_blacklist_versions_name ON blacklist_versions (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_ecosystems_name ON blacklist_ecosystems (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_repositories_name ON blacklist_repositories (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_authors_name ON blacklist_authors (name);
