-- ⚠️ MIGRACIÓN REQUERIDA PARA AGREGAR STOCK A VARIANTES
-- 
-- DESCRIPCIÓN: Agregar campo de stock individual para cada variante de producto
-- 
-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com/dashboard/
-- 2. Abre tu proyecto Rolu Modas
-- 3. Ve a SQL Editor (icono </> en el menú lateral)
-- 4. Copia y pega este SQL:

-- ========================================
-- MIGRACIÓN: Actualizar variantes para incluir stock
-- ========================================

-- No necesitamos crear nuevas tablas porque las variantes están almacenadas como JSON
-- La migración será realizada a nivel de aplicación para actualizar la estructura JSON

-- Función para actualizar productos existentes con stock en variantes
CREATE OR REPLACE FUNCTION update_variant_stock()
RETURNS void AS $$
DECLARE
    product_record RECORD;
    updated_variants JSONB;
    variant_item JSONB;
    option_item JSONB;
    updated_options JSONB;
BEGIN
    -- Iterar sobre todos los productos que tienen variantes
    FOR product_record IN 
        SELECT id, variants 
        FROM products 
        WHERE variants IS NOT NULL 
        AND JSONB_ARRAY_LENGTH(variants) > 0
    LOOP
        updated_variants := '[]'::JSONB;
        
        -- Procesar cada variante
        FOR variant_item IN 
            SELECT * FROM JSONB_ARRAY_ELEMENTS(product_record.variants)
        LOOP
            updated_options := '[]'::JSONB;
            
            -- Procesar cada opción de la variante
            FOR option_item IN 
                SELECT * FROM JSONB_ARRAY_ELEMENTS(variant_item->'options')
            LOOP
                -- Agregar stock: 0 si no existe
                option_item := option_item || JSONB_BUILD_OBJECT('stock', 
                    CASE 
                        WHEN option_item ? 'stock' THEN (option_item->>'stock')::INTEGER
                        ELSE 0
                    END
                );
                
                updated_options := updated_options || option_item;
            END LOOP;
            
            -- Actualizar la variante con las opciones actualizadas
            variant_item := variant_item || JSONB_BUILD_OBJECT('options', updated_options);
            updated_variants := updated_variants || variant_item;
        END LOOP;
        
        -- Actualizar el producto con las variantes actualizadas
        UPDATE products 
        SET variants = updated_variants 
        WHERE id = product_record.id;
        
    END LOOP;
    
    RAISE NOTICE 'Migración de stock para variantes completada exitosamente';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función de migración
SELECT update_variant_stock();

-- Limpiar la función temporal
DROP FUNCTION update_variant_stock();

-- Verificar que la migración funcionó
SELECT 
    'Migración completada exitosamente' as status,
    COUNT(*) as total_products_with_variants,
    COUNT(*) FILTER (WHERE variants IS NOT NULL AND JSONB_ARRAY_LENGTH(variants)> 0) as products_with_updated_variants
FROM products 
WHERE variants IS NOT NULL;

-- ========================================
-- DESPUÉS DE EJECUTAR:
-- ========================================
-- 1. Refresca tu admin panel (F5)
-- 2. El campo "Stock" aparecerá en cada opción de variante
-- 3. Podrás gestionar el stock individual por variante
-- 4. El sistema calculará automáticamente el stock total del producto
