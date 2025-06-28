-- Script de prueba para insertar productos con variantes
-- Ejecutar después de supabase_variants_setup.sql

-- Insertar productos de prueba con variantes
INSERT INTO products (name, price, description, category_id, stock, visible, variants, short_description, long_description, is_trending) VALUES
(
    'Camiseta Básica Premium',
    1800.00,
    'Camiseta de algodón 100% de alta calidad, perfecta para uso diario. Material suave y transpirable.',
    1, -- Asegúrate de que esta categoría existe
    50,
    true,
    '[
        {"name": "Talla", "options": ["XS", "S", "M", "L", "XL", "XXL"]},
        {"name": "Color", "options": ["Blanco", "Negro", "Azul Marino", "Gris", "Rojo"]}
    ]'::jsonb,
    'Camiseta básica de algodón premium',
    'Esta camiseta está confeccionada con algodón 100% de la más alta calidad. El material es suave al tacto, transpirable y duradero. Perfecta para uso diario, deportes o como prenda casual. Disponible en múltiples tallas y colores para adaptarse a todos los gustos.',
    true
),
(
    'Jeans Clásicos Slim Fit',
    3200.00,
    'Jeans de alta calidad con corte slim fit, perfectos para cualquier ocasión. Material duradero y cómodo.',
    1, -- Asegúrate de que esta categoría existe
    30,
    true,
    '[
        {"name": "Talla", "options": ["28", "30", "32", "34", "36", "38"]},
        {"name": "Color", "options": ["Azul Clásico", "Azul Oscuro", "Negro", "Gris"]}
    ]'::jsonb,
    'Jeans slim fit de alta calidad',
    'Estos jeans están confeccionados con denim premium de alta calidad. El corte slim fit ofrece un ajuste moderno y elegante, perfecto para cualquier ocasión. El material es duradero, resistente al desgaste y mantiene su forma después de múltiples lavados.',
    false
),
(
    'Vestido Elegante de Verano',
    4500.00,
    'Vestido elegante perfecto para el verano. Material ligero y fresco con diseño moderno.',
    1, -- Asegúrate de que esta categoría existe
    25,
    true,
    '[
        {"name": "Talla", "options": ["XS", "S", "M", "L", "XL"]},
        {"name": "Color", "options": ["Floral", "Azul Cielo", "Rosa Pálido", "Blanco"]}
    ]'::jsonb,
    'Vestido elegante para verano',
    'Este vestido elegante está diseñado para el verano con materiales ligeros y frescos. El diseño es moderno y versátil, perfecto para eventos especiales o uso diario. Incluye detalles finos y un corte que favorece cualquier tipo de figura.',
    true
);

-- Verificar que los productos se insertaron correctamente
SELECT 
    id,
    name,
    price,
    variants,
    visible
FROM products 
WHERE variants IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;

-- Probar la función de búsqueda por variante
SELECT * FROM search_products_by_variant('Talla', 'M');

-- Ver estadísticas de variantes
SELECT * FROM get_variant_statistics(); 