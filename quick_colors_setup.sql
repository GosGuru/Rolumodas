-- Script rápido para agregar la columna colors
-- Ejecutar en Supabase SQL Editor

-- Agregar columna colors a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT NULL;

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'colors';

-- Mostrar la estructura actual de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position; 