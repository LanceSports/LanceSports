// server/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://vzopcnujdgzjvdynuelt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6b3BjbnVqZGd6anZkeW51ZWx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUyMjQ5MywiZXhwIjoyMDcxMDk4NDkzfQ.e96yTWbQ_cwLg-0xhSK94RicwJj0YFWZDSlOj4oeQxU"
);

module.exports = supabase;
