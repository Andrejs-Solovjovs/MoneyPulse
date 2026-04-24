const SUPABASE_URL = "https://qjjahfqkksvyamtgqewq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqamFoZnFra3N2eWFtdGdxZXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTU1NjAsImV4cCI6MjA5MjU5MTU2MH0.9kKnBlyrMEcfCMeaZu9w9Cfdd1lKrDmlzx2OwD9rAbQ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);