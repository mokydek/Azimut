# Azimut

Azimut is a web service that turns the fear of AI driven job loss into a calm, personal
adaptation plan. It has three parts: a profession risk assessment that estimates how exposed
your work is to automation, an adaptation roadmap of durable skills generated from that
assessment, and a calm tracker, a lightweight mood and reflection journal that helps you see
your progress over time instead of a sense of chaos.

## Stack

- React with TypeScript
- Vite
- Tailwind CSS v4
- Supabase (authentication, Postgres database, row level security)

## Local setup

1. Clone the repository and enter the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local environment file from the template and fill in your Supabase project values:
   ```bash
   cp .env.example .env.local
   ```
   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
4. Apply the database schema. Open the Supabase SQL Editor for your project and run the files in
   `supabase/migrations` in order:
   1. `001_init.sql` (tables, row level security, seeded professions)
   2. `002_profile_name.sql` (profile name trigger)
5. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` type checks and builds the production bundle.
- `npm run preview` serves the production build locally.
- `npm run test` runs the engine test suites with Vitest.
