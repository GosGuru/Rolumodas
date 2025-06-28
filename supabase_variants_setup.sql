-- Script para configurar variantes de productos en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Verificar si la columna variants ya existe en la tabla products
DO $$
BEGIN
    -- Agregar columna variants si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'variants'
    ) THEN
        ALTER TABLE products ADD COLUMN variants JSONB DEFAULT NULL;
        
        -- Agregar comentario a la columna
        COMMENT ON COLUMN products.variants IS 'Variantes del producto (talla, color, etc.) en formato JSONB';
        
        RAISE NOTICE 'Columna variants agregada a la tabla products';
    ELSE
        RAISE NOTICE 'La columna variants ya existe en la tabla products';
    END IF;
END $$;

-- Crear función para validar el formato de las variantes
CREATE OR REPLACE FUNCTION validate_product_variants()
RETURNS TRIGGER AS $$
BEGIN
    -- Si variants no es NULL, validar que sea un array de objetos con name y options
    IF NEW.variants IS NOT NULL THEN
        -- Verificar que sea un array
        IF jsonb_typeof(NEW.variants) != 'array' THEN
            RAISE EXCEPTION 'variants debe ser un array';
        END IF;
        
        -- Verificar cada elemento del array
        FOR i IN 0..jsonb_array_length(NEW.variants) - 1 LOOP
            DECLARE
                variant jsonb;
            BEGIN
                variant := NEW.variants->i;
                
                -- Verificar que tenga name
                IF NOT (variant ? 'name') THEN
                    RAISE EXCEPTION 'Cada variante debe tener un campo "name"';
                END IF;
                
                -- Verificar que tenga options
                IF NOT (variant ? 'options') THEN
                    RAISE EXCEPTION 'Cada variante debe tener un campo "options"';
                END IF;
                
                -- Verificar que options sea un array
                IF jsonb_typeof(variant->'options') != 'array' THEN
                    RAISE EXCEPTION 'El campo "options" de cada variante debe ser un array';
                END IF;
                
                -- Verificar que options no esté vacío
                IF jsonb_array_length(variant->'options') = 0 THEN
                    RAISE EXCEPTION 'El campo "options" de cada variante no puede estar vacío';
                END IF;
            END;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validar variantes
DROP TRIGGER IF EXISTS validate_variants_trigger ON products;
CREATE TRIGGER validate_variants_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION validate_product_variants();

-- Crear índices para mejorar el rendimiento de consultas con variantes
CREATE INDEX IF NOT EXISTS idx_products_variants ON products USING GIN (variants);

-- Crear función para buscar productos por variantes
CREATE OR REPLACE FUNCTION search_products_by_variant(variant_name TEXT, variant_value TEXT)
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    price DECIMAL,
    description TEXT,
    variants JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.variants
    FROM products p
    WHERE p.variants @> jsonb_build_array(
        jsonb_build_object(
            'name', variant_name,
            'options', jsonb_build_array(variant_value)
        )
    )
    AND p.visible = true;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso de la función:
-- SELECT * FROM search_products_by_variant('Talla', 'M');

-- Crear vista para productos con variantes expandidas
CREATE OR REPLACE VIEW products_with_variants AS
SELECT 
    p.*,
    jsonb_agg(
        jsonb_build_object(
            'variant_name', v->>'name',
            'variant_options', v->'options'
        )
    ) as expanded_variants
FROM products p
LEFT JOIN LATERAL jsonb_array_elements(p.variants) v ON true
GROUP BY p.id, p.name, p.price, p.description, p.category_id, p.stock, p.visible, p.images, p.created_at, p.updated_at, p.short_description, p.long_description, p.is_trending;

-- Insertar algunos productos de ejemplo con variantes (opcional)
-- INSERT INTO products (name, price, description, category_id, stock, visible, variants) VALUES
-- (
--     'Camiseta Básica',
--     1500.00,
--     'Camiseta de algodón 100%',
--     1,
--     50,
--     true,
--     '[
--         {"name": "Talla", "options": ["S", "M", "L", "XL"]},
--         {"name": "Color", "options": ["Blanco", "Negro", "Azul", "Rojo"]}
--     ]'::jsonb
-- ),
-- (
--     'Jeans Clásicos',
--     2500.00,
--     'Jeans de alta calidad',
--     1,
--     30,
--     true,
--     '[
--         {"name": "Talla", "options": ["28", "30", "32", "34", "36"]},
--         {"name": "Color", "options": ["Azul", "Negro", "Gris"]}
--     ]'::jsonb
-- );

-- Crear función para obtener estadísticas de variantes
CREATE OR REPLACE FUNCTION get_variant_statistics()
RETURNS TABLE (
    variant_name TEXT,
    total_products BIGINT,
    unique_options TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH variant_stats AS (
        SELECT 
            v->>'name' as variant_name,
            jsonb_array_elements_text(v->'options') as option_value
        FROM products p
        CROSS JOIN LATERAL jsonb_array_elements(p.variants) v
        WHERE p.variants IS NOT NULL
    )
    SELECT 
        vs.variant_name,
        COUNT(DISTINCT p.id) as total_products,
        ARRAY_AGG(DISTINCT vs.option_value) as unique_options
    FROM variant_stats vs
    JOIN products p ON true
    GROUP BY vs.variant_name
    ORDER BY vs.variant_name;
END;
$$ LANGUAGE plpgsql;

-- Crear políticas RLS para variantes (si usas RLS)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura de productos con variantes
-- CREATE POLICY "Allow read access to products with variants" ON products
--     FOR SELECT USING (true);

-- Política para permitir inserción/actualización de productos con variantes (solo para usuarios autenticados)
-- CREATE POLICY "Allow authenticated users to manage products with variants" ON products
--     FOR ALL USING (auth.role() = 'authenticated');

RAISE NOTICE 'Configuración de variantes completada. La tabla products ahora soporta variantes en formato JSONB.'; 