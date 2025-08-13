-- ⚠️ MIGRACIÓN REQUERIDA PARA FUNCIONALIDAD DE VISIBILIDAD DE CATEGORÍAS
-- 
-- ERROR ACTUAL: "column categories.visible does not exist"
-- 
-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com/dashboard/
-- 2. Abre tu proyecto Rolu Modas
-- 3. Ve a SQL Editor (icono </> en el menú lateral)
-- 4. Copia y pega este SQL:

-- ========================================
-- MIGRACIÓN: Agregar campo visible a categories
-- ========================================

-- Agregar columna visible con valor por defecto true
ALTER TABLE categories 
ADD COLUMN visible BOOLEAN DEFAULT true;

-- Actualizar todas las categorías existentes como visibles
UPDATE categories 
SET visible = true 
WHERE visible IS NULL;

-- Crear índice para mejorar performance en consultas
CREATE INDEX IF NOT EXISTS idx_categories_visible ON categories(visible);

-- Verificar que la migración funcionó
SELECT 
  'Migración completada exitosamente' as status,
  COUNT(*) as total_categories,
  COUNT(*) FILTER (WHERE visible = true) as visible_categories,
  COUNT(*) FILTER (WHERE visible = false) as hidden_categories
FROM categories;

-- ========================================
-- DESPUÉS DE EJECUTAR:
-- ========================================
-- 1. Refresca tu admin panel (F5)
-- 2. Los botones Eye aparecerán en cada categoría
-- 3. Las categorías aparecerán nuevamente en home/shop
-- 4. La configuración funcionará correctamente
