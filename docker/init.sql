CREATE TABLE if NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    last_clicked_at TIMESTAMP
);