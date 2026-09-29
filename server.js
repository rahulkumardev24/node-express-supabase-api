require("dotenv").config();

const express = require("express");
const pool = require("./db");

const app = express();

const PORT = process.env.PORT || 3000;

// Allow JSON request body
app.use(express.json());


// GET API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "My first REST API is working! \n Thanks!!",
  });
});


// GET all users
app.get("/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users ORDER BY id");

  res.json({
    success: true,
    users: result.rows,
  });
});


// GET user by ID
app.get("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    user: user,
  });
});


// POST create user
app.post("/users", async (req, res) => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "name and email are required",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name.trim(), email.trim().toLowerCase()]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }
    throw err;
  }
});


// Handle any unexpected error
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: "Something went wrong" });
});


// Run the server locally (Vercel uses the exported app instead)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}




module.exports = app;
