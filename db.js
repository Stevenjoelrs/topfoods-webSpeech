import pg from "pg";
import dotenv from "dotenv";
import dns from "node:dns";

dotenv.config();

const { Pool } = pg;

function parseConnectionString(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "5432", 10),
    database: parsed.pathname.slice(1),
    user: parsed.username,
    password: parsed.password,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  };
}

const config = parseConnectionString(process.env.DATABASE_URL);

// En Docker (production) forzar IPv4 si es necesario, en local dejar resolver normal
if (process.env.NODE_ENV === "production") {
  dns.lookup(config.host, { family: 4 }, (err, address, family) => {
    if (!err) {
      console.log(`[Docker] Resuelto ${config.host} -> ${address} (IPv${family})`);
      config.host = address;
    } else {
      console.warn("[Docker] No se pudo forzar IPv4, usando resolución normal:", err.message);
    }
  });
}

const pool = new Pool(config);

pool.on("error", (err) => {
  console.error("Error inesperado en pool de PG:", err);
});

export async function insertFood(name, value) {
  const result = await pool.query(
    `INSERT INTO dishes (name, difficulty) VALUES ($1, $2)
     ON CONFLICT ON CONSTRAINT dishes_name_key DO NOTHING
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