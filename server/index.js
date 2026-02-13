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

app.get("/cards", async function (request, response) {
  const rows = await db.raw("SELECT * FROM cards");
  response.json(rows);
});

app.listen(3000, () => {
  console.log("App running on http://localhost:3000. Type Ctrl+C to stop.");
});
