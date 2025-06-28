-- Script de verificación para el sistema de colores
-- Ejecutar después de agregar la columna colors

-- 1. Verificar que la columna existe
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'colors';

-- 2. Verificar productos existentes
SELECT 
  id,
  name,
  colors,
  CASE 
    WHEN colors IS NULL THEN 'Sin colores'
    WHEN jsonb_typeof(colors) = 'array' THEN 'Con colores'
    ELSE 'Formato inválido'
  END as colors_status
FROM products 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Probar inserción de un producto con colores
INSERT INTO products (
  name, 
  price, 
  description, 
  category_id, 
  stock, 
  visible,
  colors
) 
VALUES (
  'Producto Test Colores',
  1000.00,
  'Producto de prueba para verificar el sistema de colores',
  1,
  10,
  true,
  '[
    {"name": "Negro", "value": "#000000"},
    {"name": "Blanco", "value": "#FFFFFF"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- 4. Verificar que se insertó correctamente
SELECT 
  id,
  name,
  colors,
  jsonb_array_length(colors) as num_colors
FROM products 
WHERE name = 'Producto Test Colores'
ORDER BY created_at DESC
LIMIT 1;

-- 5. Limpiar producto de prueba (opcional)
-- DELETE FROM products WHERE name = 'Producto Test Colores'; 