-- Migración para tabla compartida del equipo: dishes (solo id, name, difficulty)
CREATE TABLE IF NOT EXISTS dishes(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    CONSTRAINT dishes_name_lower_unique UNIQUE (LOWER(name))
);