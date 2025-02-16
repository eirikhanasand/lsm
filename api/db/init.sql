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
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, version)
);

-- Table for ecosystem specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_ecosystems (
    name TEXT NOT NULL,
    ecosystem TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, ecosystem)
);

-- Table for repository specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_repositories (
    name TEXT NOT NULL,
    repository TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, repository)
);

-- Table for comments for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_comments (
    name TEXT NOT NULL,
    comment TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, comment)
);

-- Table for version specific blacklisted versions
CREATE TABLE IF NOT EXISTS blacklist_versions (
    name TEXT NOT NULL,
    version TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, version)
);

-- Table for ecosystem specific blacklisted ecosystems
CREATE TABLE IF NOT EXISTS blacklist_ecosystems (
    name TEXT NOT NULL,
    ecosystem TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, ecosystem)
);

-- Table for repository specific blacklisted repositories
CREATE TABLE IF NOT EXISTS blacklist_repositories (
    name TEXT NOT NULL,
    repository TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, repository)
);

-- Table for comments for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_comments (
    name TEXT NOT NULL,
    comment TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, comment)
);

-- Creates vulnerability table
CREATE TABLE IF NOT EXISTS vulnerabilities (
    name TEXT PRIMARY KEY,
    package_name TEXT NOT NULL,
    ecosystem TEXT NOT NULL,
    version_introduced TEXT NOT NULL,
    version_fixed TEXT NOT NULL,
    data JSONB NOT NULL,
    CONSTRAINT unique_name_ecosystem_version UNIQUE (name, package_name, ecosystem, version_introduced, version_fixed)
);

-- Indexes for Vulnerability
CREATE INDEX IF NOT EXISTS idx_name_ecosystem_version ON vulnerabilities (name, package_name, ecosystem, version_introduced, version_fixed);
CREATE INDEX IF NOT EXISTS idx_package_name ON vulnerabilities (name, package_name);
CREATE INDEX IF NOT EXISTS idx_vuln_name ON vulnerabilities (name);

-- Indexes for Whitelist
CREATE INDEX IF NOT EXISTS idx_whitelist_versions_name ON whitelist_versions (name);
CREATE INDEX IF NOT EXISTS idx_whitelist_ecosystems_name ON whitelist_ecosystems (name);
CREATE INDEX IF NOT EXISTS idx_whitelist_repositories_name ON whitelist_repositories (name);
CREATE INDEX IF NOT EXISTS idx_whitelist_comments_name ON whitelist_comments (name);

-- Indexes for Blacklist
CREATE INDEX IF NOT EXISTS idx_blacklist_versions_name ON blacklist_versions (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_ecosystems_name ON blacklist_ecosystems (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_repositories_name ON blacklist_repositories (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_comments_name ON blacklist_comments (name);
