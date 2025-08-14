import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wrsdfutpfzmmckttzazh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyc2RmdXRwZnptbWNrdHR6YXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDYzNTEsImV4cCI6MjA2NTk4MjM1MX0.pquuFugMji030hp1Mxb2Tp8azmC9xvvIh3APQROIGa0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simular la función actualizada
async function testUpdateFunction() {
  console.log('=== TESTING UPDATED FUNCTION ===');
  
  const settings = {
    homeLimit: 4,
    shopLimit: null,
    homeShowAll: false,
    shopShowAll: true
  };
  
  try {
    const updates = [];
    
    // Preparar actualizaciones con validación (igual que en el código real)
    if (typeof settings.homeLimit === 'number' && settings.homeLimit >= 1 && settings.homeLimit <= 20) {
      updates.push({
        key: "categories_home_limit",
        value: settings.homeLimit.toString()
      });
    }
    
    if (settings.shopLimit === null || (typeof settings.shopLimit === 'number' && settings.shopLimit >= 1 && settings.shopLimit <= 20)) {
      updates.push({
        key: "categories_shop_limit",
        value: settings.shopLimit?.toString() || "null"
      });
    }
    
    if (typeof settings.homeShowAll === 'boolean') {
      updates.push({
        key: "categories_home_show_all",
        value: settings.homeShowAll.toString()
      });
    }
    
    if (typeof settings.shopShowAll === 'boolean') {
      updates.push({
        key: "categories_shop_show_all",
        value: settings.shopShowAll.toString()
      });
    }
    
    console.log('Updates to process:', updates);
    
    // Ejecutar actualizaciones usando solo UPDATE
    for (const update of updates) {
      console.log(`Updating ${update.key} to ${update.value}`);
      
      const { error } = await supabase
        .from("site_content")
        .update({ 
          content_value: { value: update.value }
        })
        .eq('content_key', update.key);
      
      if (error) {
        console.error(`Error updating ${update.key}:`, error);
        throw new Error(`Error al actualizar configuración ${update.key}: ${error.message}`);
      } else {
        console.log(`Successfully updated ${update.key}`);
      }
    }
    
    console.log('✅ All updates completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Update failed:', error);
    return false;
  }
}

// Verificar estado antes y después
async function verifyChanges() {
  console.log('\n=== VERIFICANDO CAMBIOS ===');
  const { data, error } = await supabase
    .from("site_content")
    .select("content_key, content_value")
    .in("content_key", [
      "categories_home_limit",
      "categories_shop_limit", 
      "categories_home_show_all",
      "categories_shop_show_all"
    ]);

  if (error) {
    console.error('Error verificando:', error);
    return;
  }
  
  if (data) {
    data.forEach(item => {
      console.log(`${item.content_key}: ${JSON.stringify(item.content_value)}`);
    });
  }
}

async function runTest() {
  await verifyChanges();
  const success = await testUpdateFunction();
  if (success) {
    await verifyChanges();
  }
}

runTest().catch(console.error);
