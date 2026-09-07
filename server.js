import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { insertFood, getAllFoods } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "public");

const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
};

function json(res, data, status = 200) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => {
            try {
                resolve(JSON.parse(data));
            } catch {
                reject(new Error("Invalid JSON"));
            }
        });
    });
}

const server = http.createServer(async (req, res) => {
    if (req.url === "/api/foods" && req.method === "GET") {
        const foods = await getAllFoods();
        return json(res, foods);
    }

    if (req.url === "/api/foods" && req.method === "POST") {
        let body;
        try {
            body = await parseBody(req);
        } catch {
            return json(res, { error: "Invalid JSON" }, 400);
        }

        const { name, value } = body;
        const inserted = await insertFood(name, value);

        if (!inserted) {
            return json(res, { error: "duplicated" }, 409);
        }
        return json(res, { ok: true, food: inserted }, 200);
    }

    const filePath = path.join(PUBLIC, req.url === "/" ? "index.html" : req.url);
    const resolved = path.resolve(filePath);

    if (!resolved.startsWith(PUBLIC)) {
        res.writeHead(403);
        return res.end("Forbidden");
    }

    const ext = path.extname(resolved);
    const stream = fs.createReadStream(resolved);

    stream.on("open", () => {
        res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
        stream.pipe(res);
    });

    stream.on("error", () => {
        res.writeHead(404);
        res.end("Not Found");
    });
});

server.listen(3000, () => {
    console.log("http://localhost:3000");
});