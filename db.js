import postgres from "postgres";
const sql = postgres("postgres://localhost/topfoods");

export async function insertFood(name, value) {
    const rows = await sql`
        INSERT INTO foods (name,value) VALUES (${name}, ${value})
        ON CONFLICT ((LOWER(name))) DO NOTHING
        RETURNING *
    `;
    return rows[0] || null;
}

export async function getAllFoods() {
    return await sql`SELECT * FROM foods ORDER BY created_at DESC`;
}