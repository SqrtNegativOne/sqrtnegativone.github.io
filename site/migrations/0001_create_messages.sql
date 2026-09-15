-- Contact form messages submitted from /contact.
CREATE TABLE IF NOT EXISTS messages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	body TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	ip_hash TEXT,
	country TEXT,
	user_agent TEXT
);

-- Rate limiting + moderation lookups.
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_ip_hash_created_at ON messages (ip_hash, created_at);
