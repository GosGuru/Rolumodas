import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wrsdfutpfzmmckttzazh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyc2RmdXRwZnptbWNrdHR6YXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYzNTEsImV4cCI6MjA2NTk4MjM1MX0.pquuFugMji030hp1Mxb2Tp8azmC9xvvIh3APQROIGa0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Probar con retorno de datos para verificar el update
async function testWithReturn() {
  console.log('=== TESTING WITH RETURN DATA ===');
  
  try {
    // Intentar cambiar homeLimit a 5
    const { data, error } = await supabase
      .from("site_content")
      .update({ 
        content_value: { value: "5" }
      })
      .eq('content_key', 'categories_home_limit')
      .select();
    
    console.log('Update result with return:', { data, error });
    
    if (data && data.length > 0) {
      console.log('Updated record:', data[0]);
    } else if (!error) {
      console.log('Update completed but no data returned (possible RLS issue)');
    }
    
    // Verificar inmediatamente después
    const { data: checkData, error: checkError } = await supabase
      .from("site_content")
      .select("content_key, content_value")
      .eq('content_key', 'categories_home_limit')
      .single();
    
    console.log('Verification check:', { checkData, checkError });
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

// Intentar hacer update con autenticación
async function testAuth() {
  console.log('\n=== TESTING AUTH ===');
  
  // Primero verificar si hay usuario autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('Current user:', { user: user?.email || 'No user', authError });
  
  // Si no hay usuario, el anon key debería tener permisos limitados
  if (!user) {
    console.log('No authenticated user - this might be the issue');
  }
}

async function runAdvancedTest() {
  await testAuth();
  await testWithReturn();
}

runAdvancedTest().catch(console.error);
