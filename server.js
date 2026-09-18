import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import { insertFood, getAllFoods, closePool } from "./db.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "public");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(express.static(PUBLIC));

app.get("/api/foods", async (req, res) => {
  try {
    const foods = await getAllFoods();
    res.json(foods);
  } catch (err) {
    console.error("GET /api/foods error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/foods", async (req, res) => {
  try {
    const { name, value } = req.body;
    if (!name || typeof value !== "number") {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const inserted = await insertFood(name, value);
    if (!inserted) {
      return res.status(409).json({ error: "duplicated" });
    }
    res.json({ ok: true, food: inserted });
  } catch (err) {
    console.error("POST /api/foods error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const server = http.createServer(app);

async function shutdown() {
  console.log("\nCerrando servidor...");
  await closePool();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);
});