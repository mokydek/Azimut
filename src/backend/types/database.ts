// TypeScript shapes mirroring the Supabase schema in supabase/migrations/001_init.sql.
// Keep these in sync with the SQL when the schema changes.

// Arbitrary JSON payload stored in jsonb columns.
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json }

export interface Profile {
  id: string
  full_name: string | null
  created_at: string
}

export interface Profession {
  id: number
  name: string
  category: string
  base_risk: number
}

export interface Assessment {
  id: string
  user_id: string
  profession_id: number | null
  answers: Json
  risk_score: number
  breakdown: Json
  created_at: string
}

export interface Roadmap {
  id: string
  user_id: string
  assessment_id: string | null
  created_at: string
}

export interface RoadmapStep {
  id: string
  roadmap_id: string
  title: string
  description: string | null
  category: string
  order_index: number
  is_done: boolean
  completed_at: string | null
}

export interface JournalEntry {
  id: string
  user_id: string
  mood: number
  body: string | null
  created_at: string
}
