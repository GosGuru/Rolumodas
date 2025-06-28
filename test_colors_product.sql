-- Script para crear un producto de prueba con colores
-- Ejecutar en el SQL Editor de Supabase para probar el sistema de colores

-- Primero, asegurarse de que existe una categoría
INSERT INTO categories (name, slug) 
VALUES ('Ropa', 'ropa') 
ON CONFLICT (slug) DO NOTHING;

-- Obtener el ID de la categoría
WITH category_id AS (
  SELECT id FROM categories WHERE slug = 'ropa' LIMIT 1
)

-- Insertar producto de prueba con colores
INSERT INTO products (
  name, 
  price, 
  description, 
  category_id, 
  stock, 
  visible, 
  is_trending,
  short_description,
  long_description,
  colors,
  variants
) 
SELECT 
  'Remera Básica de Algodón',
  1500.00,
  'Remera de algodón premium con corte oversize. Ideal para el día a día, perfecta para combinar con cualquier outfit.',
  category_id.id,
  50,
  true,
  true,
  'Remera oversize de algodón premium. Ideal para el día a día.',
  'Esta remera está confeccionada con 100% algodón premium, garantizando suavidad y durabilidad. El corte oversize proporciona un look moderno y cómodo. Perfecta para usar con jeans, shorts o faldas. Disponible en varios colores para que encuentres el que mejor se adapte a tu estilo.',
  '[
    {"name": "Negro", "value": "#000000"},
    {"name": "Blanco", "value": "#FFFFFF"},
    {"name": "Azul Marino", "value": "#000080"},
    {"name": "Rosa", "value": "#FFC0CB"},
    {"name": "Verde Oliva", "value": "#808000"}
  ]'::jsonb,
  '[
    {
      "name": "Talla",
      "options": ["S", "M", "L", "XL"]
    }
  ]'::jsonb
FROM category_id;

-- Verificar que se insertó correctamente
SELECT 
  id,
  name,
  price,
  colors,
  variants,
  visible
FROM products 
WHERE name = 'Remera Básica de Algodón'
ORDER BY created_at DESC
LIMIT 1;

-- Mostrar todos los productos con colores
SELECT 
  id,
  name,
  colors,
  variants
FROM products 
WHERE colors IS NOT NULL
ORDER BY created_at DESC; 