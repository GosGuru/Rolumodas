import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wrsdfutpfzmmckttzazh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyc2RmdXRwZnptbWNrdHR6YXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYzNTEsImV4cCI6MjA2NTk4MjM1MX0.pquuFugMji030hp1Mxb2Tp8azmC9xvvIh3APQROIGa0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para probar la lectura de configuraciones
async function testRead() {
  console.log('=== TESTING READ ===');
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("content_key, content_value")
      .in("content_key", [
        "categories_home_limit",
        "categories_shop_limit", 
        "categories_home_show_all",
        "categories_shop_show_all"
      ]);

    console.log('Read result:', { data, error });
    
    if (data) {
      data.forEach(item => {
        console.log(`${item.content_key}: ${JSON.stringify(item.content_value)}`);
      });
    }
  } catch (err) {
    console.error('Read error:', err);
  }
}

// Función para probar la escritura de configuraciones
async function testWrite() {
  console.log('=== TESTING WRITE ===');
  try {
    // Primero intentar actualizar el homeLimit a 4
    const testUpdate = {
      content_key: "categories_home_limit",
      content_value: { value: "4" }
    };
    
    console.log('Attempting upsert with:', testUpdate);
    
    const { data, error } = await supabase
      .from("site_content")
      .upsert(testUpdate);

    console.log('Upsert result:', { data, error });
    
    if (error) {
      console.error('Upsert failed, trying update...');
      
      const { data: updateData, error: updateError } = await supabase
        .from("site_content")
        .update({ content_value: { value: "4" } })
        .eq('content_key', 'categories_home_limit');
      
      console.log('Update result:', { updateData, updateError });
      
      if (updateError) {
        console.error('Update failed, trying insert...');
        
        const { data: insertData, error: insertError } = await supabase
          .from("site_content")
          .insert({
            content_key: "categories_home_limit",
            content_value: { value: "4" }
          });
        
        console.log('Insert result:', { insertData, insertError });
      }
    }
    
  } catch (err) {
    console.error('Write error:', err);
  }
}

// Función para verificar permisos
async function testPermissions() {
  console.log('=== TESTING PERMISSIONS ===');
  try {
    // Intentar consulta simple
    const { data, error } = await supabase
      .from("site_content")
      .select("content_key")
      .limit(1);
    
    console.log('Permission test result:', { data, error });
  } catch (err) {
    console.error('Permission error:', err);
  }
}

// Ejecutar todas las pruebas
async function runTests() {
  await testPermissions();
  await testRead();
  await testWrite();
  
  // Verificar nuevamente
  console.log('\n=== VERIFYING CHANGES ===');
  await testRead();
}

runTests().catch(console.error);
