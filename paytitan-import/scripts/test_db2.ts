import { createClient } from '@supabase/supabase-js';
const supabase = createClient("https://dfbduedbvessfzpdiwyw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYmR1ZWRidmVzc2Z6cGRpd3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDAyMzgsImV4cCI6MjA4MTcxNjIzOH0.eYtCAeXs9BnFNmdSSz4SziN9FTJxGHysl73luuuaAIQ");

async function check() {
  const { data, error } = await supabase.rpc('get_platform_stats', {});
  console.log("Stats:", data, error);
}
check();
