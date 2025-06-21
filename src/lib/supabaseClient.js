
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wrsdfutpfzmmckttzazh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyc2RmdXRwZnptbWNrdHR6YXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYzNTEsImV4cCI6MjA2NTk4MjM1MX0.pquuFugMji030hp1Mxb2Tp8azmC9xvvIh3APQROIGa0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
