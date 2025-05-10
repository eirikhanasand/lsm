-- Creates the database
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'osvdb') THEN
        CREATE DATABASE osvdb;
    END IF;
END $$;

-- Enters the database
\c osvdb

-- Creates the user 'osvuser'
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

-- Allowed dependencies
CREATE TABLE IF NOT EXISTS allow (
    name TEXT PRIMARY KEY,
    comment TEXT NOT NULL
);

-- Blocked dependencies
CREATE TABLE IF NOT EXISTS block (
    name TEXT PRIMARY KEY,
    comment TEXT NOT NULL
);

-- Version specific allowed dependencies
CREATE TABLE IF NOT EXISTS allow_versions (
    name TEXT NOT NULL,
    version TEXT,
    FOREIGN KEY (name) REFERENCES allow(name),
    PRIMARY KEY (name, version)
);

-- Ecosystem specific allowed dependencies
CREATE TABLE IF NOT EXISTS allow_ecosystems (
    name TEXT NOT NULL,
    ecosystem TEXT,
    FOREIGN KEY (name) REFERENCES allow(name),
    PRIMARY KEY (name, ecosystem)
);

-- Repository specific allowed dependencies
CREATE TABLE IF NOT EXISTS allow_repositories (
    name TEXT NOT NULL,
    repository TEXT,
    FOREIGN KEY (name) REFERENCES allow(name),
    PRIMARY KEY (name, repository)
);

-- References for specific allowed dependencies
CREATE TABLE IF NOT EXISTS allow_references (
    name TEXT NOT NULL,
    reference TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES allow(name),
    PRIMARY KEY (name, reference)
);

-- Authors for specific allowed dependencies
CREATE TABLE IF NOT EXISTS allow_authors (
    name TEXT NOT NULL,
    author TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES allow(name),
    PRIMARY KEY (name, author)
);

-- Created info for specific allowed dependencies
CREATE TABLE IF NOT EXISTS allow_created (
    name TEXT PRIMARY KEY,
    id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES allow(name)
);

-- Updated info for specific allowed dependencies
CREATE TABLE IF NOT EXISTS allow_updated (
    name TEXT PRIMARY KEY,
    id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES allow(name)
);

-- Changelog for specific allowed dependencies
CREATE TABLE IF NOT EXISTS allow_changelog (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES allow(name)
);

-- Version specific blocked versions
CREATE TABLE IF NOT EXISTS block_versions (
    name TEXT NOT NULL,
    version TEXT,
    FOREIGN KEY (name) REFERENCES block(name),
    PRIMARY KEY (name, version)
);

-- Ecosystem specific blocked ecosystems
CREATE TABLE IF NOT EXISTS block_ecosystems (
    name TEXT NOT NULL,
    ecosystem TEXT,
    FOREIGN KEY (name) REFERENCES block(name),
    PRIMARY KEY (name, ecosystem)
);

-- Repository specific blocked repositories
CREATE TABLE IF NOT EXISTS block_repositories (
    name TEXT NOT NULL,
    repository TEXT,
    FOREIGN KEY (name) REFERENCES block(name),
    PRIMARY KEY (name, repository)
);

-- References for specific blocked dependencies
CREATE TABLE IF NOT EXISTS block_references (
    name TEXT NOT NULL,
    reference TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES block(name),
    PRIMARY KEY (name, reference)
);

-- Authors for specific blocked dependencies
CREATE TABLE IF NOT EXISTS block_authors (
    name TEXT NOT NULL,
    author TEXT NOT NULL,
    FOREIGN KEY (name) REFERENCES block(name),
    PRIMARY KEY (name, author)
);

-- Created info for specific blocked dependencies
CREATE TABLE IF NOT EXISTS block_created (
    name TEXT PRIMARY KEY,
    id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES block(name)
);

-- Updated info for specific blocked dependencies
CREATE TABLE IF NOT EXISTS block_updated (
    name TEXT PRIMARY KEY,
    id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES block(name)
);

-- Changelog for specific blocked dependencies
CREATE TABLE IF NOT EXISTS block_changelog (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (name) REFERENCES block(name)
);

-- Vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
    name TEXT PRIMARY KEY,
    package_name TEXT NOT NULL,
    ecosystem TEXT NOT NULL,
    version_introduced TEXT NOT NULL,
    version_fixed TEXT NOT NULL,
    data JSONB NOT NULL,
    CONSTRAINT unique_name_ecosystem_version 
    UNIQUE (name, package_name, ecosystem, version_introduced, version_fixed)
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
    CONSTRAINT unique_event 
    UNIQUE (timestamp, package_name, package_version, client_address)
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

-- Fallback user for no-auth implementation
INSERT INTO users (id, name, avatar)
VALUES ('0', 'Unknown User', 'null');

-- Indexes for downloaded packages
CREATE INDEX idx_download_timestamp ON download_events (timestamp);
CREATE INDEX idx_download_package_name ON download_events (package_name);
CREATE INDEX idx_download_ecosystem ON download_events (ecosystem);
CREATE INDEX idx_download_version ON download_events (package_version);

-- Indexes for Vulnerability
CREATE INDEX IF NOT EXISTS idx_name_ecosystem_version 
ON vulnerabilities (name, package_name, ecosystem, version_introduced, version_fixed);

CREATE INDEX IF NOT EXISTS idx_package_name 
ON vulnerabilities (name, package_name);

CREATE INDEX IF NOT EXISTS idx_vuln_name 
ON vulnerabilities (name);

-- Indexes for allowed packages
CREATE INDEX IF NOT EXISTS idx_allow_versions_name
ON allow_versions (name);

CREATE INDEX IF NOT EXISTS idx_allow_ecosystems_name
ON allow_ecosystems (name);

CREATE INDEX IF NOT EXISTS idx_allow_repositories_name
ON allow_repositories (name);

CREATE INDEX IF NOT EXISTS idx_allow_authors_name
ON allow_authors (name);

-- Indexes for blocked packages
CREATE INDEX IF NOT EXISTS idx_block_versions_name
ON block_versions (name);

CREATE INDEX IF NOT EXISTS idx_block_ecosystems_name
ON block_ecosystems (name);

CREATE INDEX IF NOT EXISTS idx_block_repositories_name
ON block_repositories (name);

CREATE INDEX IF NOT EXISTS idx_block_authors_name
ON block_authors (name);
