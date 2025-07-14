CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS declarations (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliations (
  id SERIAL PRIMARY KEY,
  declaration_id INT,
  status TEXT,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
