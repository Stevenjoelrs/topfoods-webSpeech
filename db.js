import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Error inesperado en pool de PG:", err);
});

export async function insertFood(name, value) {
  const result = await pool.query(
    `INSERT INTO dishes (name, difficulty) VALUES ($1, $2)
     ON CONFLICT ((LOWER(name))) DO NOTHING
     RETURNING id, name, difficulty as value`,
    [name, value]
  );
  return result.rows[0] || null;
}

export async function getAllFoods() {
  const result = await pool.query(
    `SELECT id, name, difficulty as value FROM dishes ORDER BY id DESC`
  );
  return result.rows;
}

export async function closePool() {
  await pool.end();
}