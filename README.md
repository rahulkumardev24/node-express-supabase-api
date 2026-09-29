# Node.js REST API with Supabase

A learning project: a simple REST API built with Express and a Supabase PostgreSQL database.

## Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/` | Check that the API is working |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get one user by ID |
| POST | `/users` | Create a user (`{ "name": "...", "email": "..." }`) |

## Setup

1. Install packages: `npm install`
2. In Supabase, run [schema.sql](schema.sql) in the SQL Editor to create the `users` table.
3. Copy `.env.example` to `.env` and add your Supabase connection string.
4. Start the server: `npm start`
5. Open http://localhost:3000/users
