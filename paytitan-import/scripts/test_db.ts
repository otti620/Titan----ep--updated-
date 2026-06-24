import { createClient } from '@supabase/supabase-js';
const supabase = createClient("https://dfbduedbvessfzpdiwyw.supabase.co", process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYmR1ZWRidmVzc2Z6cGRpd3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDAyMzgsImV4cCI6MjA4MTcxNjIzOH0.eYtCAeXs9BnFNmdSSz4SziN9FTJxGHysl73luuuaAIQ");

async function check() {
  const { data, error } = await supabase.from('transactions').select('*').limit(2);
  console.log("Tx:", data, error);
}
check();
