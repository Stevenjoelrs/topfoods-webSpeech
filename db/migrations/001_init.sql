-- Migración para tabla compartida del equipo: dishes (solo id, name, difficulty)
CREATE TABLE IF NOT EXISTS dishes(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    difficulty INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS dishes_name_lower_idx ON dishes(LOWER(name));