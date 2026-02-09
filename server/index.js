import express from "express";
import knex from "knex";

// const cards = [
//   { id: 1, name: "Cat", emoji: "🐱" },
//   { id: 2, name: "Dog", emoji: "🐶" },
//   { id: 3, name: "Fox", emoji: "🦊" },
//   { id: 4, name: "Lion", emoji: "🦁" },
//   { id: 5, name: "Panda", emoji: "🐼" },
//   { id: 6, name: "Koala", emoji: "🐨" },
// ];

// Set up express server
const app = express(); //instance of express
app.use(express.json()); // Support JSON content types in requests

// Serve frontend files from the app directory
// 👀 Note: This needs to be updated to the path of your frontend directory
app.use(express.static("../app"));

// Set up database - Creates an instance of the Knex library
// connected to our SQLite database file.
const db = knex({
  client: "sqlite3",
  connection: { filename: "./database.db" },
  useNullAsDefault: true, // Required for SQLite
});

// GET endpoint for listing all users from the database table "users"
app.get("/users", async function (request, response) {
  // Get all users from the database
  const rows = await db.raw("SELECT * FROM users");
  response.json(rows); // Respond with the users list in JSON format
});

//Get endpoint for listening all cards from the data table "cards"
app.get("/cards", async function (request, response) {
  const rows = await db.raw("Select * From cards");
  response.json(rows);
});

// Start the server on port 3000 on your local machine
app.listen(3000, () => {
  console.log("App running on http://localhost:3000. Type Ctrl+C to stop.");
});
