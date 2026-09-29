const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to your .env file.");
}

// One pool is shared by all requests (reused between requests on Vercel)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  max: 5,
});

module.exports = pool;
