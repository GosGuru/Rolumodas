-- Script para agregar soporte de colores a productos en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Agregar columna colors a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT NULL;

-- Crear comentario para documentar el campo
COMMENT ON COLUMN products.colors IS 'Array de objetos con colores disponibles para el producto. Formato: [{"name": "Nombre del color", "value": "#hexcode"}]';

-- Crear índice para búsquedas por colores (opcional, para mejor rendimiento)
CREATE INDEX IF NOT EXISTS idx_products_colors ON products USING GIN (colors);

-- Ejemplo de inserción de producto con colores
-- INSERT INTO products (name, price, description, category_id, stock, visible, colors) 
-- VALUES (
--   'Remera Básica',
--   1500.00,
--   'Remera de algodón premium',
--   1,
--   50,
--   true,
--   '[
--     {"name": "Negro", "value": "#000000"},
--     {"name": "Blanco", "value": "#FFFFFF"},
--     {"name": "Azul Marino", "value": "#000080"}
--   ]'::jsonb
-- );

-- Función para validar el formato de colores (opcional)
CREATE OR REPLACE FUNCTION validate_colors_format()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar que colors sea un array válido si no es NULL
  IF NEW.colors IS NOT NULL THEN
    -- Verificar que sea un array
    IF jsonb_typeof(NEW.colors) != 'array' THEN
      RAISE EXCEPTION 'colors debe ser un array JSON';
    END IF;
    
    -- Verificar que cada elemento tenga name y value
    FOR i IN 0..jsonb_array_length(NEW.colors)-1 LOOP
      IF NOT (NEW.colors->i ? 'name' AND NEW.colors->i ? 'value') THEN
        RAISE EXCEPTION 'Cada color debe tener name y value';
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validar colores (opcional)
DROP TRIGGER IF EXISTS validate_colors_trigger ON products;
CREATE TRIGGER validate_colors_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_colors_format();

-- Función para buscar productos por color (opcional)
CREATE OR REPLACE FUNCTION search_products_by_color(color_value TEXT)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  price DECIMAL,
  description TEXT,
  colors JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.price, p.description, p.colors
  FROM products p
  WHERE p.colors @> jsonb_build_array(jsonb_build_object('value', color_value))
    AND p.visible = true;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso de la función de búsqueda:
-- SELECT * FROM search_products_by_color('#000000');

-- Actualizar RLS (Row Level Security) si es necesario
-- Asegurar que los usuarios autenticados puedan ver productos con colores
-- (Esto depende de tu configuración actual de RLS)

PRINT 'Script de configuración de colores completado exitosamente!';
PRINT 'Recuerda actualizar tu aplicación para usar el nuevo campo colors.'; 