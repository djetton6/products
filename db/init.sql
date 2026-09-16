CREATE TABLE IF NOT EXISTS products (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0)
);
