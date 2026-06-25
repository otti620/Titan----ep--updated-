import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "https://dfbduedbvessfzpdiwyw.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYmR1ZWRidmVzc2Z6cGRpd3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDAyMzgsImV4cCI6MjA4MTcxNjIzOH0.eYtCAeXs9BnFNmdSSz4SziN9FTJxGHysl73luuuaAIQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getSupabaseAdmin = () => supabase;
