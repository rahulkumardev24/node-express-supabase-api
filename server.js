require("dotenv").config();

const express = require("express");
const pool = require("./db");

const app = express();

const PORT = process.env.PORT || 3000;

// Allow JSON request body
app.use(express.json());


// Check user input. When "partial" is true (update), only the fields sent are checked.
function validateUser(body, partial = false) {
  const errors = [];
  const data = {};

  if (body.name !== undefined || !partial) {
    if (typeof body.name !== "string" || body.name.trim() === "") {
      errors.push("name is required");
    } else {
      data.name = body.name.trim();
    }
  }

  if (body.email !== undefined || !partial) {
    if (typeof body.email !== "string" || !/^\S+@\S+\.\S+$/.test(body.email.trim())) {
      errors.push("email must be a valid email address");
    } else {
      data.email = body.email.trim().toLowerCase();
    }
  }

  if (body.age !== undefined || !partial) {
    const age = Number(body.age);
    if (body.age === null || body.age === "" || !Number.isInteger(age) || age < 1 || age > 120) {
      errors.push("age must be a whole number between 1 and 120");
    } else {
      data.age = age;
    }
  }

  if (body.roll_number !== undefined || !partial) {
    if (body.roll_number === null || String(body.roll_number).trim() === "") {
      errors.push("roll_number is required");
    } else {
      data.roll_number = String(body.roll_number).trim();
    }
  }

  if (body.class !== undefined || !partial) {
    if (body.class === null || String(body.class).trim() === "") {
      errors.push("class is required");
    } else {
      data.class = String(body.class).trim();
    }
  }

  return { errors, data };
}


// Turn database errors into clear messages
function handleDbError(err, res) {
  if (err.code === "23505") {
    const message = err.constraint === "users_email_key"
      ? "Email already exists"
      : "This roll number already exists in this class";
    return res.status(409).json({ success: false, message });
  }
  throw err;
}


// Get the user ID from the URL, or send an error
function getUserId(req, res) {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId < 1) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
    return null;
  }

  return userId;
}


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
    count: result.rows.length,
    users: result.rows,
  });
});


// GET user by ID
app.get("/users/:id", async (req, res) => {
  const userId = getUserId(req, res);
  if (userId === null) return;

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
  const { errors, data } = validateUser(req.body || {});

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      errors: errors,
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, age, roll_number, class)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.email, data.age, data.roll_number, data.class]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (err) {
    handleDbError(err, res);
  }
});


// PUT update user (send only the fields you want to change)
app.put("/users/:id", async (req, res) => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  const { errors, data } = validateUser(req.body || {}, true);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      errors: errors,
    });
  }

  const fields = Object.keys(data);

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Send at least one field to update: name, email, age, roll_number, class",
    });
  }

  // Builds: name = $1, age = $2, ...
  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
  const values = fields.map((field) => data[field]);

  try {
    const result = await pool.query(
      `UPDATE users SET ${setClause}, updated_at = NOW()
       WHERE id = $${fields.length + 1}
       RETURNING *`,
      [...values, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    handleDbError(err, res);
  }
});


// DELETE user
app.delete("/users/:id", async (req, res) => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [userId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    message: "User deleted successfully",
    user: result.rows[0],
  });
});


// Handle any unexpected error
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Request body is not valid JSON" });
  }

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
