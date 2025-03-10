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

-- Table for authors for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_authors (
    name TEXT NOT NULL,
    author TEXT,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, author)
);

-- Table for created at timestamp for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_createdat (
    name TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, timestamp)
);

-- Table for updated at timestamp for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_updatedat (
    name TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, timestamp)
);

-- Table for created by user for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_createdby (
    name TEXT NOT NULL,
    createdby TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, createdby)
);

-- Table for updated by user for specific whitelisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_updatedby (
    name TEXT NOT NULL,
    updatedby TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES whitelist(name),
    PRIMARY KEY (name, updatedby)
);

-- Table for changelog for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS whitelist_changelog (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES whitelist(name)
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

-- Table for authors for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_authors (
    name TEXT NOT NULL,
    author TEXT,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, author)
);

-- Table for created at timestamp for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_createdat (
    name TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, timestamp)
);

-- Table for updated at timestamp for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_updatedat (
    name TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, timestamp)
);

-- Table for created by user for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_createdby (
    name TEXT NOT NULL,
    createdBy TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, createdBy)
);

-- Table for updated by user timestamp for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_updatedby (
    name TEXT NOT NULL,
    updatedBy TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES blacklist(name),
    PRIMARY KEY (name, updatedBy)
);

-- Table for changelog for specific blacklisted dependencies
CREATE TABLE IF NOT EXISTS blacklist_changelog (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES blacklist(name)
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

-- Creates downloaded events table
CREATE TABLE IF NOT EXISTS download_events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    package_name VARCHAR(255) NOT NULL CHECK (LENGTH(package_name) > 0),
    package_version VARCHAR(50) NOT NULL CHECK (LENGTH(package_version) > 0),
    ecosystem VARCHAR(100) NOT NULL CHECK (LENGTH(ecosystem) > 0),
    client_address INET NOT NULL,
    repository VARCHAR(25) NOT NULL CHECK (LENGTH(repository) > 0),
    status VARCHAR(10) NOT NULL CHECK (status IN ('passed', 'blocked')),
    reason TEXT CHECK (LENGTH(reason) > 0),
    CONSTRAINT unique_event UNIQUE (timestamp, package_name, package_version, client_address)
);

-- Creates audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    event TEXT NOT NULL,
    author TEXT NOT NULL
);

-- Creates user table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL
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
CREATE INDEX IF NOT EXISTS idx_whitelist_comments_name ON whitelist_comments (name);
CREATE INDEX IF NOT EXISTS idx_whitelist_authors_name ON whitelist_authors (name);

-- Indexes for Blacklist
CREATE INDEX IF NOT EXISTS idx_blacklist_versions_name ON blacklist_versions (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_ecosystems_name ON blacklist_ecosystems (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_repositories_name ON blacklist_repositories (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_comments_name ON blacklist_comments (name);
CREATE INDEX IF NOT EXISTS idx_blacklist_authors_name ON blacklist_authors (name);
