# node-express-supabase-api

A learning project: a simple REST API built with Express and a Supabase PostgreSQL database.

## Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/` | Check that the API is working |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get one user by ID |
| POST | `/users` | Add a user (all fields required) |
| PUT | `/users/:id` | Update a user (send only the fields to change) |
| DELETE | `/users/:id` | Delete a user |

User fields:

```json
{
  "name": "Aman",
  "email": "aman@example.com",
  "age": 15,
  "roll_number": "101",
  "class": "10A"
}
```

- `email` must be unique.
- `roll_number` must be unique within a `class`.
- `age` must be a whole number from 1 to 120.

## Setup

1. Install packages: `npm install`
2. In Supabase, run [schema.sql](schema.sql) in the SQL Editor to create the `users` table.
3. Copy `.env.example` to `.env` and add your Supabase connection string.
4. Start the server: `npm start`
5. Open http://localhost:3000/users
