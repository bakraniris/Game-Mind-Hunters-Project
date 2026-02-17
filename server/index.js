import express from "express";
import knex from "knex";

const app = express();
app.use(express.json());
app.use(express.static("../app"));
const db = knex({
  client: "sqlite3",
  connection: { filename: "./database.db" },
  useNullAsDefault: true, // Required for SQLite
});

async function initTables() {
  const hofExists = await db.schema.hasTable("hall_of_fame");
  if (!hofExists) {
    await db.schema.createTable("hall_of_fame", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("difficulty").notNullable();
      table.integer("time_seconds").notNullable();
      table.integer("reveals").notNullable();
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  }

  const battlesExists = await db.schema.hasTable("battles");
  if (!battlesExists) {
    await db.schema.createTable("battles", (table) => {
      table.increments("id").primary();
      table.string("player1").notNullable();
      table.string("player2").notNullable();
      table.integer("player1_score").notNullable();
      table.integer("player2_score").notNullable();
      table.string("winner").notNullable();
      table.string("difficulty").notNullable();
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  }
}

app.get("/cards", async function (request, response) {
  const rows = await db.raw("SELECT * FROM cards");
  response.json(rows);
});

app.get("/hall-of-fame", async function (request, response) {
  const rows = await db("hall_of_fame")
    .select("*", db.raw("CASE WHEN difficulty = 'ultrahard' THEN 0 ELSE 1 END AS sort_priority"))
    .orderBy("sort_priority", "asc")
    .orderBy("time_seconds", "asc")
    .orderBy("reveals", "asc")
    .limit(10);
  response.json(rows);
});

app.post("/hall-of-fame", async function (request, response) {
  const { name, difficulty, time_seconds, reveals } = request.body;

  if (!name || !difficulty || time_seconds == null || reveals == null) {
    return response.status(400).json({ error: "Missing required fields" });
  }

  const [id] = await db("hall_of_fame").insert({
    name,
    difficulty,
    time_seconds,
    reveals,
  });

  response.status(201).json({ id, name, difficulty, time_seconds, reveals });
});

app.get("/battles", async function (request, response) {
  const rows = await db("battles")
    .select("*")
    .orderBy("created_at", "desc")
    .limit(10);
  response.json(rows);
});

app.post("/battles", async function (request, response) {
  const { player1, player2, player1_score, player2_score, winner, difficulty } =
    request.body;

  if (!player1 || !player2 || player1_score == null || player2_score == null || !winner || !difficulty) {
    return response.status(400).json({ error: "Missing required fields" });
  }

  const [id] = await db("battles").insert({
    player1,
    player2,
    player1_score,
    player2_score,
    winner,
    difficulty,
  });

  response.status(201).json({ id });
});

const PORT = process.env.PORT || 3000;

initTables().then(() => {
  app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}. Type Ctrl+C to stop.`);
  });
});
